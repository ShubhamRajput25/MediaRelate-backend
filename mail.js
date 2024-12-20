const nodemailer = require("nodemailer");
// const { serverurl } = require("./constant");
// const serverurl='';
// require(".env").config()

const transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com", // Replace with your SMTP server host
    // port: 465, // Replace with your SMTP server port
    // secure: true, // true for 465, false for other ports
    host: "smtp.gmail.com", // SMTP server address
    port: 587, // SMTP port (587 for TLS, 465 for SSL)
    secure: false, // Use true for port 465, false for 587 
    auth: {
        user: process.env.APP_EMAIL, // Replace with your SMTP server username
        pass: process.env.EMAIL_PASS, // Replace with your SMTP server password
    },
}); 

const sendMail = ({ to, subject, html, from = "MediaRelate <shubhamrajput638509@gmail.com>" }) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'MediaRelate <shubhamrajput638509@gmail.com>',
            to,
            subject,
            html,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};



exports.sendOtpForUserSignup = async (data) => {
    const { name, otp, email } = data;

    const body = `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your recovery email</title>
    <style>
        body {
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid gainsboro;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .logo {
            margin-bottom: 20px;
        }

        .title {
            font-size: 24px;
            color: black;
            font-weight: 500;
            margin-top: 5%;
            margin-bottom: 5%;
        }

        .message {
            font-size: 16px;
            color: #272727;
            margin-bottom: 20px;
            line-height: 1.5;
            text-align: left;
        }

        .code {
            font-size: 36px;
            color: black;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }

        .note {
            font-size: 14px;
            color: #272727;
            text-align: left;
            margin-top: 20px;
            margin-bottom: 5%;
            line-height: 1.5;
        }

        .footer{
            color: #4a4a4a;
            font-size: 12px;
            max-width: 600px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="container">
            <div class="logo">
                <img src={'./public/images/MediaRelate.png'}style="width: 180px;"
                    alt="MediaRelate Logo">
            </div>
            <div class="title">Verify your Email</div>
            <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
            <div class="message">
                MediaRelate has received a request to verify <strong>${email}</strong>.
                <br><br>
                Use this code to safely verify your email:
            </div>
            <div class="code">${otp}</div>
           <p class="footer">All rights reserved © 2024 | MediaRelate | 6-67, Gwalior, Madhya Pradesh</p>
        </div>
    </div>
</body>

</html>
  `
    const subject = "Verify your Email";
    return await sendMail({ to: email, subject, html: body });
};
