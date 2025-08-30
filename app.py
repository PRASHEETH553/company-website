import os
import logging
from io import BytesIO
from flask import Flask, render_template, request, redirect, url_for
from flask_mail import Mail, Message
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField, SelectField
from wtforms.validators import DataRequired, Email
import mysql.connector
from mysql.connector import Error, pooling
from dotenv import load_dotenv
import re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Ensure static directory exists
if not os.path.exists('static'):
    os.makedirs('static')

# Configure logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    logger.error("SECRET_KEY not set in .env file")
    raise ValueError("SECRET_KEY must be set in the .env file")

# Flask-Mail configuration for Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

# Validate email configuration
if not all([app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD']]):
    logger.error("MAIL_USERNAME or MAIL_PASSWORD not set in .env file")
    raise ValueError("MAIL_USERNAME and MAIL_PASSWORD must be set in the .env file")

mail = Mail(app)

# Database connection pool configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD', 'your_secure_db_password'),
    'database': 'jhaishna'
}

try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        **db_config
    )
    logger.info("Database connection pool created successfully")
except Error as e:
    logger.error(f"Error creating database connection pool: {e}")
    raise

def get_db_connection():
    """Get a connection from the pool."""
    try:
        conn = connection_pool.get_connection()
        return conn
    except Error as e:
        logger.error(f"Error getting database connection: {e}")
        return None

# Validation functions
def is_valid_email(email):
    """Validate email format."""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def is_valid_phone(phone):
    """Validate phone number format."""
    phone_pattern = r'^\+?\d{10,15}$'
    return re.match(phone_pattern, phone) is not None if phone else True

# PDF generation functions
def generate_contact_pdf(name, email, subject, message):
    """Generate a PDF for contact form submission."""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica", 12)
    p.drawString(100, 750, "Jhainsha Technologies Contact Submission")
    p.drawString(100, 730, "-" * 50)
    p.drawString(100, 710, f"Name: {name}")
    p.drawString(100, 690, f"Email: {email}")
    p.drawString(100, 670, f"Subject: {subject}")
    p.drawString(100, 650, "Message:")
    y = 630
    for line in message.split('\n'):
        p.drawString(100, y, line[:80])
        y -= 20
        if y < 50:
            p.showPage()
            y = 750
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

def generate_career_pdf(fullname, email, phone, location, position, experience, resume, portfolio, coverletter, startdate, salary):
    """Generate a PDF for career form submission."""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica", 12)
    p.drawString(100, 750, "Jhainsha Technologies Career Application")
    p.drawString(100, 730, "-" * 50)
    p.drawString(100, 710, f"Full Name: {fullname}")
    p.drawString(100, 690, f"Email: {email}")
    p.drawString(100, 670, f"Phone: {phone}")
    p.drawString(100, 650, f"Location: {location or 'Not provided'}")
    p.drawString(100, 630, f"Position: {position}")
    p.drawString(100, 610, f"Experience: {experience or 'Not provided'}")
    p.drawString(100, 590, f"Resume URL: {resume}")
    p.drawString(100, 570, f"Portfolio: {portfolio or 'Not provided'}")
    p.drawString(100, 550, f"Cover Letter: {coverletter or 'Not provided'}")
    p.drawString(100, 530, f"Start Date: {startdate or 'Not provided'}")
    p.drawString(100, 510, f"Salary Expectation: {salary or 'Not provided'}")
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

# Flask-WTF forms
class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    subject = StringField('Subject', validators=[DataRequired()])
    message = TextAreaField('Message', validators=[DataRequired()])
    submit = SubmitField('Send Message')

class CareerForm(FlaskForm):
    fullname = StringField('Full Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Phone', validators=[DataRequired()])
    location = StringField('Current Location')
    position = SelectField('Position Applying For', choices=[
        ('', 'Select a position'),
        ('software', 'Software Development'),
        ('consulting', 'IT Consulting'),
        ('cloud', 'Cloud Services'),
        ('ai', 'AI Solutions'),
        ('other', 'Other')
    ], validators=[DataRequired()])
    experience = SelectField('Years of Experience', choices=[
        ('', 'Select experience'),
        ('0-1', '0-1 years'),
        ('1-3', '1-3 years'),
        ('3-5', '3-5 years'),
        ('5-10', '5-10 years'),
        ('10+', '10+ years')
    ], validators=[DataRequired()])
    resume = StringField('Resume URL', validators=[DataRequired()])
    portfolio = StringField('Portfolio/LinkedIn')
    coverletter = TextAreaField('Cover Letter')
    startdate = StringField('Earliest Start Date')
    salary = StringField('Expected Salary')
    submit = SubmitField('Submit Application')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/digital')
def digital():
    return render_template('digital.html')

@app.route('/Products/<product>')
def Productsf(product):
    try:
        return render_template(f'Productsf/software&hardware/{product}.html')
    except Exception as e:
        logger.error(f"Error loading product page {product}: {e}")
        return render_template('404.html'), 404

@app.route('/Digitals/<digital>')
def Digitalsf(digital):
    try:
        return render_template(f'Productsf/digitals/{digital}.html')
    except Exception as e:
        logger.error(f"Error loading digital service page {digital}: {e}")
        return render_template('404.html'), 404

@app.route('/blog')
def blog():
    try:
        return render_template('blog.html')
    except Exception as e:
        logger.error(f"Error loading blog page: {e}")
        return render_template('404.html'), 404

@app.route('/emerging_leader')
def emerging_leader():
    try:
        return render_template('emerging_leader.html')
    except Exception as e:
        logger.error(f"Error loading emerging_leader page: {e}")
        return render_template('404.html'), 404

@app.route('/mes_power')
def mes_power():
    try:
        return render_template('mes_power.html')
    except Exception as e:
        logger.error(f"Error loading mes_power page: {e}")
        return render_template('404.html'), 404

@app.route('/our_vision')
def our_vision():
    try:
        return render_template('our_vision.html')
    except Exception as e:
        logger.error(f"Error loading our_vision page: {e}")
        return render_template('404.html'), 404

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        name = form.name.data.strip()
        email = form.email.data.strip()
        subject = form.subject.data.strip()
        message = form.message.data.strip()

        # Save to database
        sql = """
            INSERT INTO details_contact
            (name, email, subject, message)
            VALUES (%s, %s, %s, %s)
        """
        values = (name, email, subject, message)
        
        conn = get_db_connection()
        if not conn:
            logger.error("Contact form submission failed: Database connection unavailable")
            return render_template('contact.html', form=form, error="Database connection failed")

        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, values)
                conn.commit()
                logger.info(f"Contact form data saved for {email}")

            # Generate PDF for admin
            pdf_buffer = generate_contact_pdf(name, email, subject, message)
            
            # Send user confirmation email
            try:
                msg = Message(
                    subject="Thank You for Contacting Jhainsha Technologies",
                    recipients=[email],
                    body=f"""
Dear {name},

Thank you for reaching out to Jhainsha Technologies. We have received your message and will get back to you soon.

Best regards,
Jhainsha Technologies Team
jobs@jhainsha.com
"""
                )
                mail.send(msg)
                logger.info(f"Confirmation email sent to {email}")
            except Exception as e:
                logger.error(f"Error sending confirmation email to {email}: {e}")
                try:
                    admin_msg = Message(
                        subject="Failed to Send Contact Confirmation Email",
                        recipients=[app.config['MAIL_USERNAME']],
                        body=f"""
Failed to send confirmation email to {email}.
Error: {str(e)}
Contact Details:
Name: {name}
Email: {email}
Subject: {subject}
Message: {message}
"""
                    )
                    mail.send(admin_msg)
                    logger.info("Admin notified of email failure")
                except Exception as admin_e:
                    logger.error(f"Error sending admin notification: {admin_e}")

            # Send admin email with PDF
            try:
                admin_msg = Message(
                    subject=f"New Contact Form Submission from {name}",
                    recipients=[app.config['MAIL_USERNAME']],
                    body=f"""
New contact form submission received:

Name: {name}
Email: {email}
Subject: {subject}
Message: {message}

Please find the details in the attached PDF.
"""
                )
                pdf_buffer.seek(0)
                admin_msg.attach(
                    f"contact_{name.replace(' ', '_')}_{email}.pdf",
                    'application/pdf',
                    pdf_buffer.read()
                )
                mail.send(admin_msg)
                logger.info(f"Admin email with PDF sent for {email}")
            except Exception as e:
                logger.error(f"Error sending admin email with PDF for {email}: {e}")

            return redirect(url_for('success'))
        except Error as e:
            logger.error(f"Database error during contact form submission: {e}")
            return render_template('contact.html', form=form, error="An error occurred while submitting your form. Please try again.")
        finally:
            conn.close()

    return render_template('contact.html', form=form)
@app.route('/usercontacts')
def usercontacts():
    conn = get_db_connection()
    if not conn:
        logger.error("Failed to fetch user contacts: Database connection unavailable")
        return render_template('userContacts.html', error="Database connection failed")
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name, email, subject, message FROM details_contact")
            data = cursor.fetchall()
        logger.info("User contacts fetched successfully")
        return render_template('userContacts.html', submissions=data)
    except Error as e:
        logger.error(f"Database error fetching user contacts: {e}")
        return render_template('userContacts.html', error="An error occurred while fetching submissions.")
    finally:
        conn.close()

@app.route('/career', methods=['GET', 'POST'])
def career():
    form = CareerForm()
    if form.validate_on_submit():
        fullname = form.fullname.data.strip()
        email = form.email.data.strip()
        phone = form.phone.data.strip()
        location = form.location.data.strip() if form.location.data else None
        position = form.position.data.strip()
        experience = form.experience.data.strip()
        resume = form.resume.data.strip()
        portfolio = form.portfolio.data.strip() if form.portfolio.data else None
        coverletter = form.coverletter.data.strip() if form.coverletter.data else None
        startdate = form.startdate.data.strip() if form.startdate.data else None
        salary = form.salary.data.strip() if form.salary.data else None

        # Additional validation
        if not is_valid_phone(phone):
            logger.warning(f"Career form submission failed: Invalid phone {phone}")
            form.phone.errors.append("Invalid phone number")
            return render_template('career.html', form=form)

        # Save to database
        sql = """
            INSERT INTO job_applications_career
            (fullname, email, phone, location, position, experience, resume, portfolio, coverletter, startdate, salary)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (fullname, email, phone, location, position, experience, resume, portfolio, coverletter, startdate, salary)
        
        conn = get_db_connection()
        if not conn:
            logger.error("Career form submission failed: Database connection unavailable")
            return render_template('career.html', form=form, error="Database connection failed")

        try:
            with conn.cursor() as cursor:
                cursor.execute(sql, values)
                conn.commit()
                logger.info(f"Career application saved for {email}")

            # Generate PDF for admin
            pdf_buffer = generate_career_pdf(fullname, email, phone, location, position, experience, resume, portfolio, coverletter, startdate, salary)
            
            # Send user confirmation email
            try:
                msg = Message(
                    subject="Thank You for Applying to Jhainsha Technologies",
                    recipients=[email],
                    body=f"""
Dear {fullname},

Thank you for applying to the job at Jhainsha Technologies. We have received your application and will get back to you soon.

Best regards,
Jhainsha Technologies HR Team
jobs@jhainsha.com
"""
                )
                mail.send(msg)
                logger.info(f"Confirmation email sent to {email}")
            except Exception as e:
                logger.error(f"Error sending confirmation email to {email}: {e}")
                try:
                    admin_msg = Message(
                        subject="Failed to Send Career Confirmation Email",
                        recipients=[app.config['MAIL_USERNAME']],
                        body=f"""
Failed to send confirmation email to {email}.
Error: {str(e)}
Application Details:
Full Name: {fullname}
Email: {email}
Phone: {phone}
Position: {position}
Resume: {resume}
"""
                    )
                    mail.send(admin_msg)
                    logger.info("Admin notified of email failure")
                except Exception as admin_e:
                    logger.error(f"Error sending admin notification: {admin_e}")

            # Send admin email with PDF attachment
            try:
                admin_msg = Message(
                    subject=f"New Career Application from {fullname}",
                    recipients=[app.config['MAIL_USERNAME']],
                    body=f"""
New career application received:

Full Name: {fullname}
Email: {email}
Phone: {phone}
Position: {position}
Resume URL: {resume}

Please find the full application details in the attached PDF.
"""
                )
                pdf_buffer.seek(0)
                admin_msg.attach(
                    f"application_{fullname.replace(' ', '_')}_{email}.pdf",
                    'application/pdf',
                    pdf_buffer.read()
                )
                mail.send(admin_msg)
                logger.info(f"Admin email with PDF sent for {email}")
            except Exception as e:
                logger.error(f"Error sending admin email with PDF for {email}: {e}")
            
            return redirect(url_for('success'))
        except Error as e:
            logger.error(f"Database error during career form submission: {e}")
            return render_template('career.html', form=form, error="An error occurred while submitting your application.")
        finally:
            conn.close()

    return render_template('career.html', form=form)

@app.route('/jobApplications')
def jobApplications():
    conn = get_db_connection()
    if not conn:
        logger.error("Failed to fetch job applications: Database connection unavailable")
        return render_template('jobApplications.html', error="An error occurred while fetching job applications.")
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, fullname, email, phone, location, position, experience, resume, portfolio, coverletter, startdate, salary FROM job_applications_career ORDER BY fullname DESC")
            data = cursor.fetchall()
        logger.info("Job applications fetched successfully")
        return render_template('jobApplications.html', submissions=data)
    except Error as e:
        logger.error(f"Database error fetching job applications: {e}")
        return render_template('jobApplications.html', error="An error occurred while fetching applications.")
    finally:
        conn.close()

@app.route('/success')
def success():
    return render_template('success.html')

if __name__ == '__main__':
    app.run(debug=True)