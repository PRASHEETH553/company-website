create database Jhaishna;
use Jhaishna;

CREATE TABLE details_contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL
);

CREATE TABLE job_applications_career (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    resume VARCHAR(255) NOT NULL,
    portfolio VARCHAR(255),
    coverletter TEXT,
    startdate DATE,
    salary VARCHAR(50)
);