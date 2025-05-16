**CostScope – Personal Finance Dashboard**

CostScope is a full-stack Flask web application that lets users track expenses, visualize spending habits, and run powerful financial simulations like "What-if I lived in another city?". Users can upload data manually or via CSV, receive personalized visual dashboards, and share reports with friends.


**Features**
 - User authentication and registration
 - Manual and CSV expense input
 - Interactive visualisation with Tailwind CSS + Chart.js
 - What-if City Simulator with income brackets
 - Shareable dashboards (with recipient-specific views)
 - Modular front-end with Jinja templates + reusable JS components


**File Structure**
CITS3403-Project-Group42-main/
├── .gitignore
├── README.md
├── debug-home.png
├── jest.config.cjs
├── package-lock.json
├── package.json
├── python
├── requirements.txt
├── run.py
├── __pycache__/
│   └── *.pyc (compiled Python files)
├── __tests__/
│   ├── loginFlow.e2e.test.js
│   └── tagParser.test.js
├── app/
│   ├── __init__.py
│   ├── extensions.py
│   ├── forms.py
│   ├── models.py
│   ├── routes.py
│   ├── __pycache__/
│   │   └── *.pyc
│   ├── static/
│   │   ├── data/
│   │   │   └── estimated_city_spending.json
│   │   ├── js/
│   │   │   ├── assets_liabilities.js
│   │   │   ├── assets_liabilities_projection.js
│   │   │   ├── attachmentTooltip.js
│   │   │   ├── import.js
│   │   │   ├── prefillTemplates.js
│   │   │   ├── rowDeleteConfirm.js
│   │   │   ├── test-import.html
│   │   │   └── top_cards.js
│   │   └── templates/
│   │       ├── empty_template.csv
│   │       └── finances_template.csv
│   └── templates/
│       ├── base.html
│       ├── home.html
│       ├── layout.html
│       ├── login.html
│       ├── register.html
│       ├── share.html
│       ├── shared_with_me.html
│       ├── upload.html
│       ├── visualise.html
│       └── visualise_components/
│           ├── cashflow_items.html
│           ├── cashflow_list.html
│           └── cashflow_ring.html
├── instance/
│   └── studysync.db
└── migrations/
    ├── README
    ├── alembic.ini
    ├── env.py
    ├── script.py.mako
    ├── __pycache__/
    │   └── env.cpython-313.pyc
    └── versions/
        ├── 7039e8323eca_add_sharedreport_model.py
        └── __pycache__/
            └── 7039e8323eca_add_sharedreport_model.cpython-313.pyc



**Setup Instructions**

1. Clone the Repo
git clone https://github.com/your-username/CostScope.git
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
