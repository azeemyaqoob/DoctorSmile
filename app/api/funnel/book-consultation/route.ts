import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const requiredFields = ["application_id", "selected_slot", "timezone"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // In production, save booking to database and integrate with calendar system
    const bookingData = {
      booking_id: `booking_${Date.now()}`,
      application_id: data.application_id,
      selected_slot: data.selected_slot,
      timezone: data.timezone,
      status: "confirmed",
      created_at: new Date().toISOString(),
    }

    // Generate confirmation details
    const slotDateTime = new Date(data.selected_slot)

    return NextResponse.json({
      success: true,
      booking_id: bookingData.booking_id,
      confirmation: {
        date_time: slotDateTime.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        duration: "20 minutes",
        type: "Virtual Consultation",
        zoom_link: "https://zoom.us/j/mock-meeting-id",
        phone_backup: "+1-647-555-0123",
      },
      next_steps: [
        "Check your email for confirmation and Zoom link",
        "Prepare photos of your current smile",
        "List your smile goals and concerns",
        "Ensure good lighting for the video call",
      ],
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
