# app/routes.py

from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from collections import defaultdict

from .models import User, Expense
from .forms import RegisterForm, LoginForm, ExpenseForm
from .extensions import db

main = Blueprint('main', __name__)


@main.route('/')
def home():
    return render_template('home.html')


@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        existing_user = User.query.filter_by(username=form.username.data).first()
        if existing_user:
            flash("❌ Username is already taken. Please choose another.")
            return render_template('register.html', form=form)

        hashed_pw = generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password_hash=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        flash("✅ Registered successfully! Please log in.")
        return redirect(url_for('main.login'))

    return render_template('register.html', form=form)


@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.upload'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user)
            flash("✅ Logged in successfully!")
            return redirect(url_for('main.upload'))
        else:
            flash("❌ Invalid username or password.")
    return render_template('login.html', form=form)


@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))


@main.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    form = ExpenseForm()
    if form.validate_on_submit():
        for field_name in [
            'rent', 'utilities', 'groceries', 'eating_out', 'transport',
            'entertainment', 'subscriptions', 'health', 'education', 'insurance',
            'debt_repayment', 'travel', 'gifts_donations', 'savings_investments',
            'pets', 'other'
        ]:
            amount = getattr(form, field_name).data
            if amount and amount > 0:
                expense = Expense(
                    user_id=current_user.id,
                    month=form.month.data,
                    category=form[field_name].label.text,
                    amount=amount,
                    city=form.city.data
                )
                db.session.add(expense)
        db.session.commit()
        flash("Expenses uploaded!")
        return redirect(url_for('main.visualise'))
    return render_template('upload.html', form=form)


@main.route('/upload-manual', methods=['POST'])
@login_required
def upload_manual():
    month = request.form['month']
    category = request.form['category']
    amount = request.form['amount']
    print(f"Manual entry received: Month={month}, Category={category}, Amount={amount}")
    flash('Manual expense added successfully!')
    return redirect(url_for('main.upload'))


@main.route('/upload-manual-batch', methods=['POST'])
@login_required
def upload_manual_batch():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    for item in data:
        month = item.get('month')
        category = item.get('category')
        amount = item.get('amount')
        print(f"Saving: Month={month}, Category={category}, Amount={amount}")
        # TODO: Actually save to database here!

    return jsonify({"message": "Expenses saved successfully"}), 200


@main.route('/visualise')
@login_required
def visualise():
    user_expenses = Expense.query.filter_by(user_id=current_user.id).all()

    # Categorisation
    needs = ['Rent', 'Utilities', 'Groceries', 'Transport', 'Health', 'Education', 'Insurance', 'Debt Repayment']
    wants = ['Eating Out', 'Entertainment', 'Subscriptions', 'Travel', 'Gifts/Donations', 'Pets', 'Other', 'Savings/Investments']

    # Top cards
    total_income = sum(exp.amount for exp in user_expenses if exp.category == 'Income')
    total_expenditure = sum(exp.amount for exp in user_expenses if exp.category != 'Income')
    net_income = total_income - total_expenditure
    run_rate = round(net_income / (total_expenditure / 12), 2) if total_expenditure else 0

    top_card_data = {
        "totalIncome": total_income,
        "totalExpenditure": total_expenditure,
        "netIncome": net_income,
        "runRate": run_rate
    }

    # Assets (static example)
    assets_data = [
        {"name": "Savings", "amount": 12000, "progress": 70},
        {"name": "Investments", "amount": 5000, "progress": 40},
        {"name": "Debt", "amount": 6534.56, "progress": 50}
    ]

    # Category totals for pie charts
    category_totals = {}
    for exp in user_expenses:
        category_totals[exp.category] = category_totals.get(exp.category, 0) + exp.amount

    needs_total = sum(amount for cat, amount in category_totals.items() if cat in needs)
    wants_total = sum(amount for cat, amount in category_totals.items() if cat in wants)

    # Budgets (can be replaced with user-defined later)
    budgets = {
        'Rent': 1500,
        'Utilities': 200,
        'Groceries': 400,
        'Eating Out': 250,
        'Transport': 180,
        'Entertainment': 150,
        'Subscriptions': 100,
        'Health': 120,
        'Education': 300,
        'Other': 100
    }

    actual = []
    budget = []
    categories_for_budget = []

    for cat in budgets:
        categories_for_budget.append(cat)
        budget.append(budgets[cat])
        actual.append(category_totals.get(cat, 0))

    # Monthly totals for line chart
    monthly_totals = defaultdict(float)
    for exp in user_expenses:
        monthly_totals[exp.month] += exp.amount

    sorted_months = sorted(monthly_totals.keys())
    monthly_values = [monthly_totals[month] for month in sorted_months]

    # Top 3 categories
    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    top_categories = sorted_categories[:3]
    top_labels = [item[0] for item in top_categories]
    top_values = [item[1] for item in top_categories]

    return render_template('visualise.html',
        top_card_data=top_card_data,
        assets_data=assets_data,
        labels=list(category_totals.keys()),
        values=list(category_totals.values()),
        months=sorted_months,
        monthly_totals=monthly_values,
        top_labels=top_labels,
        top_values=top_values,
        categories_for_budget=categories_for_budget,
        actual=actual,
        budget=budget,
        needs_total=needs_total,
        wants_total=wants_total
    )


@main.route('/upload-csv', methods=['POST'])
@login_required
def upload_csv():
    flash('CSV upload received successfully!')
    return redirect(url_for('main.upload'))
