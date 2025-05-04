# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, FloatField, SelectField, FieldList, FormField
from wtforms.validators import InputRequired, Length, EqualTo

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired(), Length(min=4, max=25)])
    password = PasswordField('Password', validators=[InputRequired(), Length(min=6)])
    confirm = PasswordField('Confirm Password', validators=[InputRequired(), EqualTo('password')])
    submit = SubmitField('Register')

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    password = PasswordField('Password', validators=[InputRequired()])
    submit = SubmitField('Login')

class TransactionForm(FlaskForm):
    name = StringField('Name', validators=[InputRequired()])
    type = SelectField('Type', choices=[('expense', 'Expense'), ('income', 'Income')], validators=[InputRequired()])
    amount = FloatField('Amount', validators=[InputRequired()])
    frequency = SelectField('Frequency', choices=[('Recurring', 'Recurring'), ('Once-off', 'Once-off')])
    importance = SelectField('Importance', choices=[('Need', 'Need'), ('Want', 'Want'), ('Essential', 'Essential')])

class ExpenseForm(FlaskForm):
    transactions = FieldList(FormField(TransactionForm), min_entries=1)


    month = StringField('Month (e.g. 2025-07)', validators=[InputRequired()])

    rent = FloatField('Rent', default=0)
    utilities = FloatField('Utilities', default=0)
    groceries = FloatField('Groceries', default=0)
    eating_out = FloatField('Eating Out', default=0)
    transport = FloatField('Transport', default=0)
    entertainment = FloatField('Entertainment', default=0)
    subscriptions = FloatField('Subscriptions', default=0)
    health = FloatField('Health', default=0)
    education = FloatField('Education', default=0)
    insurance = FloatField('Insurance', default=0)
    debt_repayment = FloatField('Debt Repayment', default=0)
    travel = FloatField('Travel', default=0)
    gifts_donations = FloatField('Gifts/Donations', default=0)
    savings_investments = FloatField('Savings/Investments', default=0)
    pets = FloatField('Pets', default=0)
    other = FloatField('Other', default=0)

    city = SelectField('City', choices=[
        ('Perth', 'Perth'),
        ('Sydney', 'Sydney'),
        ('Melbourne', 'Melbourne'),
        ('Brisbane', 'Brisbane'),
        ('Adelaide', 'Adelaide')
    ], validators=[InputRequired()])

    submit = SubmitField('Submit')