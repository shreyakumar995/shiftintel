from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from models import db
import os




load_dotenv()


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

from routes import api
app.register_blueprint(api)

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables created")
    print("Shiftintel backend is running on port 5000")
    app.run(debug=True, port=5000)