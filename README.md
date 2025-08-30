# Company Website

This is a Flask-based company website that includes contact and career forms with database integration, as well as styled static pages using custom CSS and JS.

## 🌟 Features

- Contact form (stores submissions in MySQL)
- Career form with resume and portfolio uploads
- Clean, modular CSS,JS for each page
- Dynamic rendering with Jinja templates
- Organized folder structure for scalability

## 🛠 Technologies Used

- Python (Flask)
- MySQL (Workbench)
- HTML5, CSS3
- JavaScript
- VS Code

## 📁 Project Structure

## COMPANY_WEBSITE/
│
├── 📁static/
│ ├── 📁css/
│ │ ├── about.css
│ │ ├── achievement.css
│ │ ├── blog.css
│ │ ├── carrer.css
│ │ ├── contact.css
│ │ ├── digital.css
│ │ ├── get.css
│ │ ├── index.css
│ │ ├── products.css
│ │ └── styles.css
│ └── 📁Images/
│
│ └── 📁videos/
|
|
├── 📁templates/
│ ├── 📁digitals/
│ │ ├── CloudMigration.html
│ │ ├── DigitalBusiness.html
│ │ ├── OracleCommunication.html
│ │ ├── StaffAugmentation.html
│ │ ├── TailoredBillingPlatform.html
│ │ └── TailoredCRM.html
│ │
│ ├── 📁Products/
│ │ ├── E-InvoicingSoftware.html
│ │ ├── Fiber_optics.html
│ │ ├── HRMS.html
│ │ ├── LoanManagement.html
│ │ └── MXCloud_AI.html
│ │
│ ├── about.html
│ ├── achievement.html
│ ├── blog.html
│ ├── career.html
│ ├── contact.html
│ ├── digital.html
│ ├── index.html
│ └── innovation.html
│ └── jobApplication.html
│ └── products.html
│ └── userContacts.html
│
|── database.sql # database structure
├── app.py # Main Flask application
├── requirements.txt # Python dependencies
└── README.md # Project description


 pip install email-validator


 Changes Made:

Modified the .scroll-down-box styles:
Changed bottom: 40px to bottom: 60px to move the scroll-down box slightly upward.
Kept background: none to ensure no white background.
Ensured no border or box-shadow (previously removed) to avoid any white elements.
Retained padding: 10px, display: inline-flex, align-items: center, and justify-content: center for SVG centering.
Kept the animation: bounce-subtle 2.5s infinite for visual feedback.
Ensured .scroll-down-box svg maintains width: 24px and height: 24px, with the SVG’s fill="white" respected.
Updated the responsive media query at 768px:
Changed bottom: 20px to bottom: 30px to maintain a slight upward shift on smaller screens.
Kept padding: 8px and SVG size at width: 20px and height: 20px.