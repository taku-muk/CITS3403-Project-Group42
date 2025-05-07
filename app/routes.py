# app/routes.py

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from collections import defaultdict
import json

from .extensions import db
from .models import User, Expense, SharedReport
from .forms import RegisterForm, LoginForm, ExpenseForm

main = Blueprint('main', __name__)

# -------------------------- Home --------------------------

@main.route('/')
def home():
    return render_template('home.html')


# -------------------------- Auth --------------------------

@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        if User.query.filter_by(username=form.username.data).first():
            flash("❌ Username is already taken. Please choose another.")
            return render_template('register.html', form=form)

        new_user = User(
            username=form.username.data,
            password_hash=generate_password_hash(form.password.data)
        )
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
        if user:
            login_user(user)
            flash("✅ Logged in successfully!")
            return redirect(url_for('main.upload'))
        flash("❌ Invalid username or password.")
    return render_template('login.html', form=form)


@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))


# -------------------------- Upload --------------------------

@main.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.is_json:
        payload = request.get_json()
        Expense.query.filter_by(user_id=current_user.id).delete()
        for tx in payload.get('transactions', []):
            db.session.add(Expense(
                user_id=current_user.id,
                name=tx['name'],
                type=tx['type'],
                amount=float(tx['amount']),
                tags=tx['tags']
            ))
        db.session.commit()
        return '', 204  # No content – frontend handles redirect

    return render_template('upload.html')


# -------------------------- Visualise --------------------------

@main.route('/visualise')
@login_required
def visualise():
    user_expenses = Expense.query.filter_by(user_id=current_user.id).all()
    total_income = sum(e.amount for e in user_expenses if e.type == 'income')
    total_expenditure = sum(e.amount for e in user_expenses if e.type == 'expense')
    net_income = total_income - total_expenditure
    total_savings = sum(e.amount for e in user_expenses if e.type in ['savings', 'investment'])
    available_funds = total_savings + net_income

    run_rate_months = round(available_funds / total_expenditure, 2) if available_funds > 0 and total_expenditure > 0 else 0.0

    assets_data = [
        {'name': exp.type.capitalize(), 'amount': exp.amount, 'progress': 50}
        for exp in user_expenses if exp.type in ['savings', 'investment', 'debt']
    ]

    tag_totals = defaultdict(float)
    for exp in user_expenses:
        if exp.type == 'expense':
            try:
                tags = json.loads(exp.tags) if exp.tags else {}
                importance_tags = tags.get('importance', [])
                if isinstance(importance_tags, str):
                    importance_tags = [importance_tags]
                for tag in importance_tags:
                    tag_totals[tag] += exp.amount
            except Exception:
                tag_totals['Uncategorized'] += exp.amount

    leftover = max(0, total_income - sum(tag_totals.values()))

    chart_data = {
        'totalIncome': total_income,
        'tagTotals': dict(tag_totals),
        'leftover': leftover
    }

    return render_template(
        'visualise.html',
        dashboard_stats={
            'totalIncome': total_income,
            'totalExpenditure': total_expenditure,
            'netIncome': net_income,
            'runRate': run_rate_months
        },
        assets_data=assets_data,
        chart_data=chart_data
    )


# -------------------------- Cashflow Ring --------------------------

@main.route('/cashflow')
@login_required
def cashflow():
    user_expenses = Expense.query.filter_by(user_id=current_user.id).all()
    total_income = sum(e.amount for e in user_expenses if e.type == 'income')

    tag_totals = defaultdict(float)
    for exp in user_expenses:
        if exp.type == 'expense':
            try:
                tags = json.loads(exp.tags) if exp.tags else {}
                importance_tags = tags.get('importance', [])
                if isinstance(importance_tags, str):
                    importance_tags = [importance_tags]
                for tag in importance_tags:
                    tag_totals[tag] += exp.amount
            except Exception:
                tag_totals['Uncategorized'] += exp.amount

    leftover = max(0, total_income - sum(tag_totals.values()))

    chart_data = {
        'totalIncome': total_income,
        'tagTotals': tag_totals,
        'leftover': leftover
    }

    return render_template('cashflow_ring.html', chart_data=chart_data)


# -------------------------- Sharing --------------------------

@main.route('/share', methods=['GET', 'POST'])
@login_required
def share_data():
    if request.method == 'POST':
        recipient_username = request.form.get('recipient_username')
        title = request.form.get('title') or "Shared Report"

        if not recipient_username:
            flash("❌ Recipient username is required.", "error")
            return redirect(url_for('main.share_data'))

        if recipient_username == current_user.username:
            flash("❌ You cannot share a report with yourself.", "error")
            return redirect(url_for('main.share_data'))

        recipient = User.query.filter_by(username=recipient_username).first()
        if not recipient:
            flash("❌ No user with that username was found.", "error")
            return redirect(url_for('main.share_data'))

        shared_report = SharedReport(
            sender_id=current_user.id,
            recipient_username=recipient_username,
            title=title
        )
        db.session.add(shared_report)
        db.session.commit()
        flash(f"✅ Shared report with {recipient_username}!", "success")
        return redirect(url_for('main.share_data'))

    return render_template('share.html')



@main.route('/shared-with-me')
@login_required
def shared_with_me():
    reports = SharedReport.query.filter_by(recipient_username=current_user.username).all()
    return render_template('shared_with_me.html', shared_reports=reports)
