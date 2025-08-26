import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { clientData, beforeAfterImages } = await request.json()

    const ownerEmail = process.env.OWNER_EMAIL || "yaqoobazeem740email@gmail.com"
    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

      console.log("[Email] Config check - Email:", !!gmailEmail, "App Password:", !!gmailAppPassword)
      
    if (!gmailEmail || !gmailAppPassword) {
      return NextResponse.json(
        { success: false, error: "Email configuration missing" },
        { status: 500 }
      )
    }

    console.log("[Email] Sending owner notification to:", ownerEmail)
    console.log("[Email] Client:", clientData.name)

    // Create transporter
const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailEmail,
        pass: gmailAppPassword,
      },
    })

    // Email content
    const mailOptions = {
      from: `DoctorSmile <${gmailEmail}>`,
      to: ownerEmail,
      subject: `New Smile Design Application - ${clientData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f3f4f6; padding: 20px; text-align: center; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
            .client-details { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Client Application Received</h2>
            </div>
            
            <div class="content">
              <div class="client-details">
                <h3>Client Details:</h3>
                <ul>
                  <li><strong>Name:</strong> ${clientData.name}</li>
                  <li><strong>Email:</strong> ${clientData.email}</li>
                  <li><strong>Phone:</strong> ${clientData.mobile}</li>
                  <li><strong>City:</strong> ${clientData.city}</li>
                  <li><strong>Budget:</strong> ${clientData.budget}</li>
                  <li><strong>Timeline:</strong> ${clientData.timeline}</li>
                </ul>
              </div>
              
              <h3>Smile Goals:</h3>
              <p>${clientData.goals}</p>
              
              ${beforeAfterImages ? "<p><strong>AI-Generated Preview:</strong> Before/after images were uploaded</p>" : ""}
              
              <p><strong>Status:</strong> $150 deposit secured - ready for consultation booking</p>
              
              <p>Please follow up with the client within 24 hours to schedule their consultation.</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from DoctorSmile.ca application system</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("[Email] Owner notification sent:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Owner notification email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("[Email] Owner email failed:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}