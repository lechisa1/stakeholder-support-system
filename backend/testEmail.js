require("dotenv").config();
const { sendEmail } = require("./utils/sendEmail");

(async () => {
  try {
    console.log("🔍 Testing email configuration...");

    await sendEmail(
      process.env.EMAIL_USER, 
      "✅ Email Configuration Test",
      "This is a test email from your Issue Tracking System."
    );

    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
  }
})();
