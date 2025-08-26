import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const paymentIntentId = data.payment_intent_id

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 })
    }

    // In production, verify payment with Stripe
    // For demo, assume payment is successful
    const paymentStatus = "succeeded"

    if (paymentStatus === "succeeded") {
      return NextResponse.json({
        success: true,
        status: "payment_confirmed",
        redirect_to_calendar: true,
        calendar_url: `/calendar-booking?application_id=${paymentIntentId}`,
      })
    } else {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
