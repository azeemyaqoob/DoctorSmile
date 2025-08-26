"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, CheckCircle, Phone } from "lucide-react"

interface CalendarBookingProps {
  isOpen: boolean
  onClose: () => void
  applicationData: any
  onBookingComplete: (details: any) => void
}

export function CalendarBooking({ isOpen, onClose, applicationData, onBookingComplete }: CalendarBookingProps) {
  const [bookingStep, setBookingStep] = useState("calendar") // 'calendar', 'confirmation', 'complete'
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [timezone, setTimezone] = useState("America/Toronto")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSlots()
    }
  }, [isOpen])

  const fetchAvailableSlots = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/funnel/available-slots")
      const result = await response.json()

      if (result.success) {
        setAvailableSlots(result.slots)
      }
    } catch (error) {
      console.error("Error fetching slots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedSlot) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/funnel/book-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: applicationData.application_id,
          selected_slot: selectedSlot,
          timezone: timezone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setBookingDetails(result)
        setBookingStep("confirmation")

        // Send confirmation email/SMS
        await sendConfirmation(result.booking_id)
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Booking failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendConfirmation = async (bookingId: string) => {
    try {
      await fetch("/api/funnel/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ booking_id: bookingId }),
      })
    } catch (error) {
      console.error("Error sending confirmation:", error)
    }
  }

  const handleComplete = () => {
    setBookingStep("complete")
    setTimeout(() => {
      onBookingComplete(bookingDetails)
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {bookingStep === "calendar" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Schedule Your Consultation</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Video className="w-5 h-5 mr-2 text-amber-600" />
                    Virtual Smile Design Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>20 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>One-on-one consultation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Your Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                    <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                    <SelectItem value="America/Edmonton">Mountain Time (Edmonton)</SelectItem>
                    <SelectItem value="America/Winnipeg">Central Time (Winnipeg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading available slots...</p>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot: any, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot.datetime)}
                        className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                          selectedSlot === slot.datetime ? "border-amber-600 bg-amber-50" : "border-gray-200"
                        }`}
                      >
                        <div className="font-medium">{slot.display_time}</div>
                        <div className="text-sm text-gray-600">{slot.location}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={!selectedSlot || isLoading}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}

        {bookingStep === "confirmation" && bookingDetails && (
          <div className="p-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600">Your consultation has been scheduled</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-amber-600" />
                  <span>{bookingDetails.confirmation.date_time}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-amber-600" />
                  <span>{bookingDetails.confirmation.duration}</span>
                </div>
                <div className="flex items-center">
                  <Video className="w-5 h-5 mr-3 text-amber-600" />
                  <span>{bookingDetails.confirmation.type}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-amber-600" />
                  <span>Backup: {bookingDetails.confirmation.phone_backup}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bookingDetails.next_steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-semibold mb-2">📧 Confirmation Sent</p>
              <p className="text-amber-700 text-sm">
                Check your email and phone for confirmation details and the Zoom meeting link.
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3">
              Complete Booking
            </Button>
          </div>
        )}

        {bookingStep === "complete" && (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">All Set!</h3>
            <p className="text-gray-600 mb-4">
              Your Smile Design Session is confirmed. We look forward to helping you achieve your perfect smile!
            </p>
            <p className="text-sm text-gray-500">This window will close automatically...</p>
          </div>
        )}
      </div>
    </div>
  )
}
