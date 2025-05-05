# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, FloatField, SelectField, FieldList, FormField,   DecimalField
from wtforms.validators import InputRequired, Length, EqualTo, DataRequired


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
    type = SelectField(
        'Type',
        choices=[
            ('expense', 'Expense'),
            ('income', 'Income'),
            ('investment', 'Investment'),
            ('debt', 'Debt'),
            ('savings', 'Savings')
        ],
        validators=[InputRequired()]
    )
    amount = DecimalField('Amount', validators=[InputRequired()])
    tags = StringField('Tags (JSON)', validators=[DataRequired()])

   

class ExpenseForm(FlaskForm):
    transactions = FieldList(FormField(TransactionForm), min_entries=1)
    submit = SubmitField('Submit')