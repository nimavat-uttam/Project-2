const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. MySQL Connection (XAMPP Default)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // XAMPP default user
    password: '',      // XAMPP default password empty hota hai
    database: 'portfolio_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error: ' + err.message);
        return;
    }
    console.log('MySQL Connected (XAMPP)...');
});

// 2. Email Setup (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Aapka Google App Password
    }
});

// 3. API Route
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // SQL Query to Insert Data
    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        // Email bhejne ka logic
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Application Received - Uttam Portfolio',
            text: `Hi ${name}, thank you for reaching out! Your message has been saved to our database.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error: " + error);
            }
            res.status(200).json({ success: true, message: "Data saved to SQL and Email sent!" });
        });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log("Backend received:", name, email); // Ye check karne ke liye ki data server tak pahuncha

    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("SQL Error:", err); // Agar SQL mein galti hai toh yahan dikhega
            return res.status(500).json({ success: false, error: err.message });
        }
        console.log("Data saved to SQL!"); 
        // ... baki email ka code
    });
});