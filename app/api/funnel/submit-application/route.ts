import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ["name", "email", "mobile", "city", "goals", "timeline", "budget"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create mock payment intent
    const paymentIntent = {
      id: "pi_mock_" + Date.now(),
      client_secret: "pi_mock_secret_" + Date.now(),
      status: "requires_payment_method",
    }

    const applicationData = {
      payment_intent_id: paymentIntent.id,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      city: data.city,
      goals: data.goals,
      timeline: data.timeline,
      budget: data.budget,
      beforeAfterImages: data.beforeAfterImages || null,
      created_at: new Date().toISOString(),
      status: "application_submitted",
    }

    // Send emails directly instead of making internal API calls
    const emailSuccess = await sendEmailsDirectly(applicationData)

    return NextResponse.json({
      success: true,
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      application_id: paymentIntent.id,
      email_sent: emailSuccess,
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendEmailsDirectly(applicationData: any): Promise<boolean> {
  try {
    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
    const ownerEmail = process.env.OWNER_EMAIL

    console.log("Email config:", {
      gmailEmail: gmailEmail ? "Set" : "Missing",
      gmailAppPassword: gmailAppPassword ? "Set" : "Missing",
      ownerEmail: ownerEmail ? "Set" : "Missing"
    })

    if (!gmailEmail || !gmailAppPassword || !ownerEmail) {
      console.error("Email configuration missing:")
      console.error("GMAIL_EMAIL:", gmailEmail || "Not set")
      console.error("GMAIL_APP_PASSWORD:", gmailAppPassword ? "Set" : "Not set")
      console.error("OWNER_EMAIL:", ownerEmail || "Not set")
      return false
    }

    // Create transporter with better configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailEmail,
        pass: gmailAppPassword,
      },
      // Add these settings for better reliability
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    })

    // Verify connection configuration
    await transporter.verify()
    console.log("Email server connection verified")

    // Send client confirmation email
    const clientMailOptions = {
      from: `"DoctorSmile" <${gmailEmail}>`,
      to: applicationData.email,
      subject: "Your DoctorSmile.ca Session is Confirmed!",
      html: generateClientEmailHtml(applicationData),
      // Add text version as fallback
      text: generateClientEmailText(applicationData)
    }

    const clientInfo = await transporter.sendMail(clientMailOptions)
    console.log("Client email sent:", clientInfo.messageId, "to:", applicationData.email)

    // Send owner notification email
    const ownerMailOptions = {
      from: `"DoctorSmile" <${gmailEmail}>`,
      to: ownerEmail,
      subject: `New Smile Design Application: ${applicationData.name}`,
      html: generateOwnerEmailHtml(applicationData),
      text: generateOwnerEmailText(applicationData)
    }

    const ownerInfo = await transporter.sendMail(ownerMailOptions)
    console.log("Owner email sent:", ownerInfo.messageId, "to:", ownerEmail)

    return true
  } catch (error) {
    console.error("Email sending error:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    return false
  }
}

function generateClientEmailText(applicationData: any): string {
  const hasImages = applicationData.beforeAfterImages && 
                   applicationData.beforeAfterImages.before && 
                   applicationData.beforeAfterImages.after;
  
  return `
Thank you ${applicationData.name}!

Your smile design session has been secured with a $150 deposit.

We're excited to help you achieve your perfect smile! Your deposit has been received and your application is being reviewed by our team.

${hasImages ? "Your AI-generated smile preview has been saved and will be discussed during your consultation. View it in the HTML version of this email." : ""}

Next Steps:
1. Consultation Scheduling
   Our team will contact you within 24 hours to schedule your virtual consultation.

2. Preparation
   We'll send preparation materials via email before your consultation.

3. Virtual Consultation
   Your 20-minute virtual consultation will be scheduled at your convenience.

Questions?
Reply to this email or call us at (519) 123-4567
Our team is available Monday-Friday, 9AM-5PM EST

DoctorSmile.ca - Transforming Smiles, Changing Lives
This email was sent in response to your application submission
  `.trim()
}

function generateOwnerEmailText(applicationData: any): string {
  const hasImages = applicationData.beforeAfterImages && 
                   applicationData.beforeAfterImages.before && 
                   applicationData.beforeAfterImages.after;
  
  return `
New Smile Design Application Received!
Application ID: ${applicationData.payment_intent_id}

Applicant Details:
- Name: ${applicationData.name}
- Email: ${applicationData.email}
- Mobile: ${applicationData.mobile}
- City: ${applicationData.city}
- Timeline: ${applicationData.timeline}
- Budget: ${applicationData.budget}
- Submitted: ${new Date(applicationData.created_at).toLocaleString()}

Smile Goals:
${applicationData.goals}

${hasImages ? "Note: Applicant uploaded photos with AI-generated preview. View images in the HTML version of this email." : "No photos were uploaded by the applicant."}

Next Action: Contact applicant within 24 hours to schedule consultation
  `.trim()
}

function generateClientEmailHtml(applicationData: any): string {
  const hasImages = applicationData.beforeAfterImages && 
                   applicationData.beforeAfterImages.before && 
                   applicationData.beforeAfterImages.after;
  
  return `
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
        .image-comparison { display: flex; gap: 10px; margin: 20px 0; }
        .image-container { flex: 1; text-align: center; }
        .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Thank you ${applicationData.name}!</h2>
          <p>Your smile design session has been secured with a $150 deposit.</p>
        </div>
        
        <div class="content">
          <p>We're excited to help you achieve your perfect smile! Your deposit has been received and your application is being reviewed by our team.</p>
          
          ${hasImages ? `
          <div>
            <h3>Your AI Smile Preview:</h3>
            <div class="image-comparison">
              <div class="image-container">
                <p><strong>Before</strong></p>
                <img src="${applicationData.beforeAfterImages.before}" alt="Your current smile" />
              </div>
              <div class="image-container">
                <p><strong>Potential After</strong></p>
                <img src="${applicationData.beforeAfterImages.after}" alt="AI-generated smile preview" />
              </div>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">
              *This is an AI-generated preview. Actual results may vary and will be discussed during your consultation.
            </p>
          </div>
          ` : ''}
          
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
  `
}

function generateOwnerEmailHtml(applicationData: any): string {
  const hasImages = applicationData.beforeAfterImages && 
                   applicationData.beforeAfterImages.before && 
                   applicationData.beforeAfterImages.after;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dcfce7; padding: 20px; text-align: center; }
        .content { background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; }
        .application-details { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .detail-item { margin-bottom: 8px; }
        .image-comparison { display: flex; gap: 10px; margin: 20px 0; }
        .image-container { flex: 1; text-align: center; }
        .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Smile Design Application Received!</h2>
          <p>Application ID: ${applicationData.payment_intent_id}</p>
        </div>
        
        <div class="content">
          <h3>Applicant Details:</h3>
          <div class="application-details">
            <div class="detail-item"><strong>Name:</strong> ${applicationData.name}</div>
            <div class="detail-item"><strong>Email:</strong> ${applicationData.email}</div>
            <div class="detail-item"><strong>Mobile:</strong> ${applicationData.mobile}</div>
            <div class="detail-item"><strong>City:</strong> ${applicationData.city}</div>
            <div class="detail-item"><strong>Timeline:</strong> ${applicationData.timeline}</div>
            <div class="detail-item"><strong>Budget:</strong> ${applicationData.budget}</div>
            <div class="detail-item"><strong>Submitted:</strong> ${new Date(applicationData.created_at).toLocaleString()}</div>
          </div>
          
          <h3>Smile Goals:</h3>
          <p>${applicationData.goals}</p>
          
          ${hasImages ? `
          <div>
            <h3>AI-Generated Smile Preview:</h3>
            <div class="image-comparison">
              <div class="image-container">
                <p><strong>Before</strong></p>
                <img src="${applicationData.beforeAfterImages.before}" alt="Before" />
              </div>
              <div class="image-container">
                <p><strong>Potential After</strong></p>
                <img src="${applicationData.beforeAfterImages.after}" alt="AI-generated after" />
              </div>
            </div>
          </div>
          ` : '<p>No photos were uploaded by the applicant.</p>'}
          
          <p><strong>Next Action:</strong> Contact applicant within 24 hours to schedule consultation</p>
        </div>
      </div>
    </body>
    </html>
  `
}