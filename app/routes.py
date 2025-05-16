# app/routes.py

from flask import Blueprint, render_template, redirect, url_for, flash, request, session

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
    # Manually check if passwords match
    if form.password.data != form.confirm.data:
        flash("❌ Passwords do not match.", "error")
        return render_template('register.html', form=form)
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
       # ✅ Add this block to flash validation errors when form fails
    

    return render_template('register.html', form=form)


@main.route('/login', methods=['GET', 'POST'])
def login():
    # Grab next from either querystring or form data
    next_page = request.values.get('next')  

    # If they’re already logged in, send them on their way
    if current_user.is_authenticated:
        return redirect(next_page) if next_page else redirect(url_for('main.upload'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user)
            flash("✅ Logged in successfully!")
            return redirect(next_page) if next_page else redirect(url_for('main.upload'))
        flash("❌ Invalid username or password.")

    # Render template, passing next_page along
    return render_template('login.html', form=form, next_page=next_page)




@main.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('_flashes', None)  # 🧹 Clear old messages
    flash("✅ Logged out successfully.")
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
    # 1. Fetch and classify raw numbers
    user_expenses     = Expense.query.filter_by(user_id=current_user.id).all()
    total_income      = sum(e.amount for e in user_expenses if e.type == 'income')
    total_expenditure = sum(e.amount for e in user_expenses if e.type == 'expense')
    net_income        = total_income - total_expenditure
    total_savings     = sum(e.amount for e in user_expenses if e.type in ['savings', 'investment'])
    available_funds   = total_savings + net_income
    run_rate_months   = (
        round(available_funds / total_expenditure, 2)
        if total_expenditure > 0 else 0.0
    )
    
    # 2. Build assets + liabilities list
    assets_data = []
    for exp in user_expenses:
        if exp.type in ['savings', 'investment', 'debt']:
            assets_data.append({
                'name': exp.name,
                'type': exp.type,
                'amount': exp.amount,
                'progress': 50  # placeholder
            })

    # 3. Initialize tag accumulators
    importance_totals = defaultdict(float)  # Need vs Want
    frequency_totals  = defaultdict(float)  # Recurring vs Once-off

    # 4. Fill them
    for exp in user_expenses:
        if exp.type == 'expense':
            try:
                tags = json.loads(exp.tags) if exp.tags else {}

                # Importance
                imp = tags.get('importance', [])
                if isinstance(imp, str):
                    imp = [imp]
                for tag in imp:
                    importance_totals[tag] += exp.amount

                # Frequency
                freq = tags.get('frequency')
                if isinstance(freq, str):
                    frequency_totals[freq] += exp.amount

            except Exception:
                importance_totals['Uncategorized'] += exp.amount

    # 5. Compute leftovers per category
    importance_leftover = max(0, total_income - sum(importance_totals.values()))
    frequency_leftover  = max(0, total_income - sum(frequency_totals.values()))

    # 6. Package chart_data for the frontend toggle
    chart_data = {
        'totalIncome': total_income,
        'importanceTotals': dict(importance_totals),
        'frequencyTotals': dict(frequency_totals),
        'importanceLeftover': importance_leftover,
        'frequencyLeftover': frequency_leftover
    }

    # 7. Finally render
    return render_template(
        'visualise.html',
        dashboard_stats={
            'totalIncome': total_income,
            'totalExpenditure': total_expenditure,
            'netIncome': net_income,
            'runRate': run_rate_months
        },
        assets_data=assets_data,
        title="Your Dashboard",
        chart_data=chart_data,
        transactions=user_expenses
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

# -------------------------- Expenses Breakdown --------------------------

@main.route('/breakdown_list', methods=['GET','POST'])
@login_required
def breakdown_list():
    user_expenses = Expense.query.filter_by(user_id=current_user.id).all()

    if request.method == 'POST':
        data = request.get_json() or {}
        freq_filters = data.get('frequency', [])
        imp_filters = data.get('importance', [])
    else:
        freq_filters = imp_filters = []

    filtered = []
    for exp in user_expenses:
        tags = json.loads(exp.tags or '{}')
        freq = tags.get('frequency','')
        imp = tags.get('importance','')
        if isinstance(imp, list):
            imp = imp[0] if imp else ''

        if freq_filters and freq not in freq_filters:
            continue
        if imp_filters and imp not in imp_filters:
            continue

        filtered.append({
            'name':   exp.name,
            'type':   exp.type,
            'amount': exp.amount,
            'tags':   { 'frequency': freq, 'importance': imp }
        })

    if request.method == 'POST':
        return render_template(
            'visualise_components/cashflow_items.html',
            transactions=filtered
        )

    return render_template(
        'visualise_components/cashflow_list.html',
        transactions=filtered
    )

# -------------------------- Sharing --------------------------

@main.route('/share', methods=['GET', 'POST'])
@login_required
def share_data():
    if request.method == 'POST':
        recipient = request.form.get('recipient', '').strip()
        title = request.form.get('title', '').strip()
        permission = request.form.get('permission', '').strip()

        # Validate inputs
        if not recipient:
            flash("❌ Recipient username is required.")
            return redirect(url_for('main.share_data'))
        if not title:
            flash("❌ Report title is required.")
            return redirect(url_for('main.share_data'))

        if recipient == current_user.username:
            flash("❌ You cannot share with yourself.")
            return redirect(url_for('main.share_data'))

        # Check if recipient exists
        recipient_user = User.query.filter_by(username=recipient).first()
        if not recipient_user:
            flash("❌ Recipient user not found.")
            return redirect(url_for('main.share_data'))

        # Save to DB
        new_report = SharedReport(
            owner_id=current_user.id,
            recipient_username=recipient,
            report_title=title,
            permission=permission
        )
        db.session.add(new_report)
        db.session.commit()

        flash("✅ Report shared successfully!")
        return redirect(url_for('main.share_data'))

    # For GET request, show the page
    sent_reports = SharedReport.query.filter_by(owner_id=current_user.id).order_by(SharedReport.timestamp.desc()).all()
    received_reports = SharedReport.query.filter_by(recipient_username=current_user.username).all()
    return render_template('share.html', shared_reports=sent_reports)



@main.route('/shared-report/<int:report_id>')
@login_required
def view_shared_report(report_id):
    shared = SharedReport.query.get_or_404(report_id)

    # Guard: only the intended recipient may view
    if shared.recipient_username != current_user.username and shared.owner_id != current_user.id:
        flash("❌ You are not authorized to view this report.")
        return redirect(url_for('main.shared_with_me'))

    # ── 1. Load the owner’s expenses ───────────────────────────
    owner_expenses = Expense.query.filter_by(user_id=shared.owner_id).all()
    owner = User.query.get(shared.owner_id)
    owner_name = owner.username if owner else 'Unknown'

    # ── 2. Core numbers ────────────────────────────────────────
    total_income      = sum(e.amount for e in owner_expenses if e.type == 'income')
    total_expenditure = sum(e.amount for e in owner_expenses if e.type == 'expense')
    net_income        = total_income - total_expenditure
    total_savings     = sum(e.amount for e in owner_expenses if e.type in ['savings', 'investment'])
    available_funds   = total_savings + net_income
    run_rate_months   = round(available_funds / total_expenditure, 2) if total_expenditure else 0.0

    # ── 3. Assets & liabilities list ───────────────────────────
    assets_data = [
        {
            'name': e.name,
            'type': e.type,
            'amount': e.amount,
            'progress': 50        # placeholder
        }
        for e in owner_expenses if e.type in ['savings', 'investment', 'debt']
    ]

    # ── 4. Build tag breakdowns for the cash-flow ring ─────────
    importance_totals = defaultdict(float)
    frequency_totals  = defaultdict(float)

    for e in owner_expenses:
        if e.type != 'expense':
            continue
        try:
            tags = json.loads(e.tags) if e.tags else {}
            # importance (Need vs Want)
            imp = tags.get('importance', [])
            if isinstance(imp, str):
                imp = [imp]
            for tag in imp:
                importance_totals[tag] += e.amount
            # frequency (Recurring vs Once-off)
            freq = tags.get('frequency')
            if isinstance(freq, str):
                frequency_totals[freq] += e.amount
        except Exception:
            importance_totals['Uncategorized'] += e.amount

    importance_leftover = max(0, total_income - sum(importance_totals.values()))
    frequency_leftover  = max(0, total_income - sum(frequency_totals.values()))

    # ── 5. chart_data in the same shape used by /visualise ─────
    chart_data = {
        'totalIncome'        : total_income,
        'importanceTotals'   : dict(importance_totals),
        'importanceLeftover' : importance_leftover,
        'frequencyTotals'    : dict(frequency_totals),
        'frequencyLeftover'  : frequency_leftover
    }

    # ── 6. Stats for the top cards ─────────────────────────────
    dashboard_stats = {
        'totalIncome'      : total_income,
        'totalExpenditure' : total_expenditure,
        'netIncome'        : net_income,
        'runRate'          : run_rate_months,
        'availableFunds'   : available_funds,
        'assetsData'       : assets_data
    }

    # ── 7. Render visualise.html with all the pieces ───────────
    return render_template(
        'visualise.html',
        title=f"{owner_name}'s Dashboard",
        report              = shared,        # so the template knows it’s shared
        user_expenses       = owner_expenses,
        assets_data         = assets_data,
        chart_data          = chart_data,
        dashboard_stats     = dashboard_stats,
        total_income        = total_income,
        total_expenditure   = total_expenditure,
        net_income          = net_income,
        run_rate_months     = run_rate_months,
        available_funds     = available_funds
        
    )




@main.route('/revoke/<int:report_id>', methods=['POST'])
@login_required
def revoke_report(report_id):
    report = SharedReport.query.get_or_404(report_id)

    if report.sender_id != current_user.id:
        flash("❌ You can only revoke reports you shared.", "error")
        return redirect(url_for('main.share_data'))

    db.session.delete(report)
    db.session.commit()
    flash("✅ Report access revoked.", "success")
    return redirect(url_for('main.share_data'))

@main.route('/shared-with-me')
@login_required
def shared_with_me():
    # Reports shared TO you
    received_reports = (
        SharedReport.query
        .filter_by(recipient_username=current_user.username)
        .order_by(SharedReport.timestamp.desc())
        .all()
    )

    # Reports YOU shared
    sent_reports = (
        SharedReport.query
        .filter_by(owner_id=current_user.id)
        .order_by(SharedReport.timestamp.desc())
        .all()
    )

    return render_template(
        'shared_with_me.html',
        shared_reports=received_reports,
        sent_reports=sent_reports
    
    )
