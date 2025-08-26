import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Generate available slots for the next 14 days
    const availableSlots = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1) // Start from tomorrow

    for (let day = 0; day < 14; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)

      // Skip weekends for this demo
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue
      }

      // Generate time slots (9 AM to 5 PM, 20-minute slots)
      for (let hour = 9; hour < 17; hour++) {
        for (const minute of [0, 20, 40]) {
          const slotTime = new Date(currentDate)
          slotTime.setHours(hour, minute, 0, 0)

          // Skip slots that are too close to current time
          if (slotTime.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
            availableSlots.push({
              datetime: slotTime.toISOString(),
              display_time: slotTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              location: "Virtual Consultation",
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      slots: availableSlots.slice(0, 50), // Limit to first 50 slots
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
