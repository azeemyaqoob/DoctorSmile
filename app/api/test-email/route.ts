import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
    const ownerEmail = process.env.OWNER_EMAIL

    console.log("🔍 Testing email configuration:")
    console.log("GMAIL_EMAIL:", gmailEmail || "NOT SET")
    console.log("GMAIL_APP_PASSWORD:", gmailAppPassword ? "SET" : "NOT SET")
    console.log("OWNER_EMAIL:", ownerEmail || "NOT SET")

    if (!gmailEmail || !gmailAppPassword || !ownerEmail) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: {
          GMAIL_EMAIL: !!gmailEmail,
          GMAIL_APP_PASSWORD: !!gmailAppPassword,
          OWNER_EMAIL: !!ownerEmail
        }
      }, { status: 500 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailEmail,
        pass: gmailAppPassword,
      },
    })

    // Test connection
    await transporter.verify()
    console.log("✅ Email server connection verified")

    // Send test email
    const testEmail = await transporter.sendMail({
      from: `"DoctorSmile Test" <${gmailEmail}>`,
      to: ownerEmail,
      subject: "Test Email from DoctorSmile",
      text: "This is a test email to verify your configuration is working.",
      html: "<h1>Test Email</h1><p>This is a test email to verify your configuration is working.</p>"
    })

    console.log("✅ Test email sent successfully:", testEmail.messageId)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: testEmail.messageId,
      config: {
        from: gmailEmail,
        to: ownerEmail
      }
    })

  } catch (error) {
    console.error("❌ Email test failed:", error)
    
    let errorMessage = "Unknown error"
    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error details:", error.stack)
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      config: {
        GMAIL_EMAIL: process.env.GMAIL_EMAIL ? "SET" : "NOT SET",
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "SET" : "NOT SET",
        OWNER_EMAIL: process.env.OWNER_EMAIL ? "SET" : "NOT SET"
      }
    }, { status: 500 })
  }
}