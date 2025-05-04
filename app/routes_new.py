# app/routes.py

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

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
        return redirect(url_for('main.upload'))  # Redirect if already logged in
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user)
            flash("✅ Logged in successfully!")
            return redirect(url_for('main.upload'))  # Corrected typo here
        else:
            flash("❌ Invalid username or password.")
            return render_template('login.html', form=form)

    return render_template('login.html', form=form)


@main.route('/logout')
@login_required
def logout():
    logout_user() 
    return redirect(url_for('main.login'))

@main.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """
    (A) ordinary WTForms POST               -> request.form
    (B) our new JS/JSON fetch() POST        -> request.is_json
    Both paths end up inserting Expense rows, then redirect.
    """
    if request.is_json:
        payload = request.get_json()
         #  Delete all existing expenses for this user
        Expense.query.filter_by(user_id=current_user.id).delete()
        for tx in payload.get('transactions', []):
            db.session.add(Expense(
                user_id   = current_user.id,
                name      = tx['name'],
                type      = tx['type'],
                amount    = float(tx['amount']),
                tags      = tx['tags']
            ))
        db.session.commit()
        return '', 204  # ✅ JS handles the redirect after

    # 🛑 ADD THIS: for normal GET requests, render the upload page
    return render_template('upload.html')

@main.route('/upload-manual', methods=['POST'])
@login_required
def upload_manual():
    # Get the form data
    month = request.form['month']
    category = request.form['category']
    amount = request.form['amount']

    # For now, just print it out (later you save to database)
    print(f"Manual entry received: Month={month}, Category={category}, Amount={amount}")

    # You can also flash a success message
    flash('Manual expense added successfully!')

    return redirect(url_for('main.upload'))

from flask import request, jsonify

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
    # Define what’s a need and what’s a want
    needs = ['Rent', 'Utilities', 'Groceries', 'Transport', 'Health', 'Education', 'Insurance', 'Debt Repayment']
    wants = ['Eating Out', 'Entertainment', 'Subscriptions', 'Travel', 'Gifts/Donations', 'Pets', 'Other', 'Savings/Investments']


    # 🟠 1. Category totals for pie chart
    category_totals = {}
    for exp in user_expenses:
        category_totals[exp.category] = category_totals.get(exp.category, 0) + exp.amount

    needs_total = sum(amount for cat, amount in category_totals.items() if cat in needs)
    wants_total = sum(amount for cat, amount in category_totals.items() if cat in wants)

    # Hardcoded budgets per category (in a real app this would be user input)
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
        actual.append(category_totals.get(cat, 0))  # 0 if no data


    # 🔵 2. Monthly totals for line chart
    from collections import defaultdict
    monthly_totals = defaultdict(float)
    for exp in user_expenses:
        monthly_totals[exp.month] += exp.amount

    # Sort by month
    sorted_months = sorted(monthly_totals.keys())
    monthly_values = [monthly_totals[month] for month in sorted_months]

    # 🔥 3. Top 3 categories
    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    top_categories = sorted_categories[:3]
    top_labels = [item[0] for item in top_categories]
    top_values = [item[1] for item in top_categories]


    return render_template('visualise.html',
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
    # Handle the CSV file upload here
    flash('CSV upload received successfully!')
    return redirect(url_for('main.upload'))