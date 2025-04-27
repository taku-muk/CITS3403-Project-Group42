# app/routes.py

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from .models import User
from .forms import RegisterForm, LoginForm
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


