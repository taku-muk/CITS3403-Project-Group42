# app/models.py
from flask_login import UserMixin
from .extensions import db  

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    expenses = db.relationship('Expense', backref='user', lazy=True)



from datetime import date


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)          # transaction name
    type = db.Column(db.String(20), nullable=False)           # expense, income, investment, etc.
    amount = db.Column(db.Float, nullable=False)
    tags = db.Column(db.Text)                                  # NEW: combined JSON (frequency + importance)
    notes = db.Column(db.String(200))                          # optional (keep if you want)
    created_at = db.Column(db.Date, default=date.today)        # optional: when the record was created



