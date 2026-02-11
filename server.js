const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path'); // આ લાઈન ઉમેરવી જરૂરી છે
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // આ લાઈન CSS અને ઈમેજ લોડ કરવા માટે છે

// 1. MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'portfolio_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error: ' + err.message);
        return;
    }
    console.log('MySQL Connected (XAMPP)...');
});

// 2. Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- નવો ફેરફાર: localhost:5000 ખોલવા માટે ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Portfuliyo.html'));
});

// 3. API Route (ફક્ત એક જ વાર રાખવી)
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log("Backend received:", name, email);

    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        console.log("Data saved to SQL!");

        // Email મોકલવાનો લોજિક
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Application Received - Uttam Portfolio',
            text: `Hi ${name}, thank you for reaching out! Your message has been saved.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error: " + error);
                // જો ઈમેઈલ ન જાય તો પણ ડેટાબેઝમાં સેવ થઈ ગયો છે
                return res.status(200).json({ success: true, message: "Saved to DB, but email failed." });
            }
            res.status(200).json({ success: true, message: "Data saved and Email sent!" });
        });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));