**CostScope – Personal Finance Dashboard**

CostScope is a full-stack Flask web application that lets users track expenses, visualize spending habits, and run powerful financial simulations like "What-if I lived in another city?". Users can upload data manually or via CSV, receive personalized visual dashboards, and share reports with friends.


**Features**
 - User authentication and registration
 - Manual and CSV expense input
 - Interactive visualisation with Tailwind CSS + Chart.js
 - What-if City Simulator with income brackets
 - Shareable dashboards (with recipient-specific views)
 - Modular front-end with Jinja templates + reusable JS components


**Setup Instructions**

1. Clone the Repo
git clone https://github.com/taku-muk/CITS3403-Project-Group42.git
cd CostScope

2. Create and Activate Virtual Environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

**3. Install Requirements**
pip install -r requirements.txt

**4. Run the App**
flask run

Visit: http://127.0.0.1:5000


**Running Tests**

**Technologies Used**
- HTML, CSS, JavaScript
- TailwindCSS
- Flask (including Flask-WTF, Flask-Login, Flask-Migrate)
- SQLite (via SQLAlchemy)
- Chart.js for graphing
- PapaParse (for CSV parsing)
- Jinja2 templating + AJAX


**Group Members**

| UWA ID   | Name                 | GitHub Username |
| ---------| -------------------- | --------------- |
| 23847285 | Lucas De Melo Veloso | velosoz         |
| 23086947 | Aditya Budhavaram    | adibud          |
| 24182634 | Taku Mukwekwezeke    | taku-muk        |
