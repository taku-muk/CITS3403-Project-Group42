# app/forms.py

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, FloatField, DateField 
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

from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, SelectField, SubmitField
from wtforms.validators import InputRequired

class ExpenseForm(FlaskForm):
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
