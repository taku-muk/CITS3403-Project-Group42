# app/__init__.py
from flask import Flask
from .extensions import db, login_manager, migrate  # ✅ merge into one line
from .models import User
from flask_migrate import Migrate  # ✅ Fix typo: was 'Migrat'

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///studysync.db'
    app.config['WTF_CSRF_ENABLED'] = True

    db.init_app(app)
    migrate.init_app(app, db)  # ✅ Connect Migrate to app and db
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from .routes_new import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
