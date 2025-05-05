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
        if user :
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


@main.route('/visualise')
@login_required
def visualise():
    user_expenses = Expense.query.filter_by(user_id=current_user.id).all()

    # Calculate totals
    total_income = sum(e.amount for e in user_expenses if e.type == 'income')
    total_expenditure = sum(e.amount for e in user_expenses if e.type == 'expense')
    net_income = total_income - total_expenditure

    # Sum up all savings (savings + investments)
    total_savings = sum(
        e.amount for e in user_expenses if e.type in ['savings', 'investment']
    )

    # Assets + liabilities data (same as before)
    assets_data = []
    for exp in user_expenses:
        if exp.type in ['savings', 'investment', 'debt']:
            assets_data.append({
                'name': exp.type.capitalize(),
                'amount': exp.amount,
                'progress': 50  # Placeholder
            })

    # Calculate run rate (runway in months)
    available_funds = total_savings + net_income

    if available_funds > 0 and total_expenditure > 0:
        run_rate_months = round(available_funds / total_expenditure, 2)
    else:
        run_rate_months = 0.00  # fallback if no funds or no expenses

    return render_template(
        'visualise.html',
        dashboard_stats={
            'totalIncome': total_income,
            'totalExpenditure': total_expenditure,
            'netIncome': net_income,
            'runRate': run_rate_months  # 🚀 now showing months!
        },
        assets_data=assets_data
    )

@main.route('/test')
def test():
    return render_template('test.html')




