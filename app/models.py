from flask_login import UserMixin
from .extensions import db
from datetime import date, datetime  # ✅ already imported

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    expenses = db.relationship('Expense', backref='user', lazy=True)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)          # transaction name
    type = db.Column(db.String(20), nullable=False)           # expense, income, investment, etc.
    amount = db.Column(db.Float, nullable=False)
    tags = db.Column(db.Text)                                 # NEW: combined JSON (frequency + importance)
    notes = db.Column(db.String(200))                         # optional (keep if you want)
    created_at = db.Column(db.Date, default=date.today)       # optional: when the record was created

# ✅ New class for shared reports
class SharedReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_username = db.Column(db.String(100), nullable=False)
    report_title = db.Column(db.String(100), nullable=False)
    permission = db.Column(db.String(20), default='view')  # Can be 'view' or 'comment'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship('User', backref='shared_reports')


