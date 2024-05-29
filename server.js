const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    console.log('Received request to send email:', req.body);

    const { emailContent, recipientEmail } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ntthanesh@gmail.com', // your email address to send from
            pass: 'nfkzhvhpmcesftup', // your app-specific password
        },
    });

    let mailOptions = {
        from: 'ntthanesh@gmail.com', // sender address
        to: recipientEmail, // list of receivers
        subject: 'Your Cart Items', // Subject line
        text: emailContent, // plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email: ' + error.toString());
        }
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent: ' + info.response);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
