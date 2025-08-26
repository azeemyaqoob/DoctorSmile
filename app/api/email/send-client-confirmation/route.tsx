import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { clientData, beforeAfterImages } = await request.json()

    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

      console.log("[Email] Config check - Email:", !!gmailEmail, "App Password:", !!gmailAppPassword)
      
    if (!gmailEmail || !gmailAppPassword) {
      return NextResponse.json(
        { success: false, error: "Email configuration missing" },
        { status: 500 }
      )
    }

    console.log("[Email] Sending client confirmation to:", clientData.email)

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
      to: clientData.email,
      subject: "Your DoctorSmile.ca Session is Confirmed!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #fef3c7; padding: 20px; text-align: center; }
            .content { background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
            .steps { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .step { margin-bottom: 10px; }
            .contact { background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank you ${clientData.name}!</h2>
              <p>Your smile design session has been secured with a $150 deposit.</p>
            </div>
            
            <div class="content">
              <p>We're excited to help you achieve your perfect smile! Your deposit has been received and your application is being reviewed by our team.</p>
              
              <div class="steps">
                <h3>Next Steps:</h3>
                <div class="step">
                  <strong>1. Consultation Scheduling</strong><br>
                  Our team will contact you within 24 hours to schedule your virtual consultation.
                </div>
                <div class="step">
                  <strong>2. Preparation</strong><br>
                  We'll send preparation materials via email before your consultation.
                </div>
                <div class="step">
                  <strong>3. Virtual Consultation</strong><br>
                  Your 20-minute virtual consultation will be scheduled at your convenience.
                </div>
              </div>
              
              ${beforeAfterImages ? "<p>Your AI-generated smile preview has been saved and will be discussed during your consultation.</p>" : ""}
              
              <div class="contact">
                <h3>Questions?</h3>
                <p>Reply to this email or call us at <strong>(519) 123-4567</strong></p>
                <p>Our team is available Monday-Friday, 9AM-5PM EST</p>
              </div>
            </div>
            
            <div class="footer">
              <p>DoctorSmile.ca - Transforming Smiles, Changing Lives</p>
              <p>This email was sent in response to your application submission</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("[Email] Client confirmation sent:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Client confirmation email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("[Email] Client email failed:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}