const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { resolve6 } = require("dns");
const app = express();
const PORT = 3000;
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to your frontend origin
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: "ZXCVBNM",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // Adjust secure if you're using HTTPS in production
  })
);
connectDB();

app.use('/api', authRoutes);
// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ronak@orufy.com",
    pass: "qvgq mmed qmmo jklg", // Replace with real password
  },
});

// OTP generation
const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString(); // Generate 4-digit OTP
};

// Send OTP API
app.post("/api/send-verification-otp", (req, res) => {
  const { emailId } = req.body;

  const otp = generateOTP();
  req.session.OTP = otp; // Store OTP in session
  req.session.save((err) => {
    if (err) {
      console.log("Failed to save session:", err);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Failed to save session" });
    }
    // Mail options
    const mailOptions = {
      from: "ronak@orufy.com",
      to: emailId,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res
          .status(500)
          .json({ isSuccess: false, message: "Failed to send email" });
      }
      console.log("Email sent: " + info.response);
      res
        .status(200)
        .json({ isSuccess: true, message: "OTP sent successfully" });
    });
  });
});

// Verify OTP API
app.post("/api/verify-otp", (req, res) => {
  const { userInputOtp } = req.body;
  console.log("session----",req.session)
  console.log("User input OTP:", userInputOtp);
  console.log("Session OTP:", req.session.OTP);



  // Compare session OTP with user input
  if (req.session.OTP === userInputOtp) {
    return res.json({
      isSuccess: true,
      message: "OTP Verified Successfully",
    });
  }

  return res.json({
    isSuccess: false,
    message: "Invalid OTP",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
