"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Star, Calendar, Award, ChevronLeft, ChevronRight, Upload, Play, Loader2 } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import { CalendarBooking } from "@/components/calendar-booking"
import { DeepAISmileEnhancer } from "@/components/ai-smile-preview"

export default function DoctorSmilePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showApplication, setShowApplication] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [applicationData, setApplicationData] = useState(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [beforeAfterImages, setBeforeAfterImages] = useState<{ before: string; after: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    goals: "",
    timeline: "",
    budget: "",
    photo: null,
  })

  // Before/After carousel data
  const beforeAfterSlides = [
    {
      before: "/person-before-dental-treatment.png",
      after: "/person-after-dental-veneers-perfect-smile.png",
      name: "Sarah M.",
      age: "34",
      treatment: "18 Porcelain Veneers",
    },
    {
      before: "/man-before-dental-treatment.png",
      after: "/man-after-dental-veneers-confident-smile.png",
      name: "Michael R.",
      age: "42",
      treatment: "16 Porcelain Veneers",
    },
    {
      before: "/placeholder.svg?height=300&width=400",
      after: "/placeholder.svg?height=300&width=400",
      name: "Jennifer L.",
      age: "38",
      treatment: "20 Porcelain Veneers",
    },
  ]

  // Testimonial videos data
  const testimonialVideos = [
    {
      thumbnail: "/placeholder.svg?height=200&width=300",
      name: "Sarah M.",
      location: "London, ON",
      quote: "The virtual consultation was so convenient, and my results look completely natural.",
    },
    {
      thumbnail: "/placeholder.svg?height=200&width=300",
      name: "Michael R.",
      location: "Oakville, ON",
      quote: "18 veneers and I couldn't be happier. The comprehensive aftercare package gives me peace of mind.",
    },
    {
      thumbnail: "/placeholder.svg?height=200&width=300",
      name: "Jennifer L.",
      location: "Toronto, ON",
      quote: "From virtual consultation to final result, the entire experience was premium.",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % beforeAfterSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + beforeAfterSlides.length) % beforeAfterSlides.length)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setFormData((prev) => ({ ...prev, photo: file }))

  setIsProcessingPhoto(true)
  try {
    const formData = new FormData()
    formData.append("photo", file)
    // Add parameters for more accurate smile generation
    formData.append("options", JSON.stringify({
      teethColor: "natural_white",
      smileStyle: "natural",
      enhancementLevel: "high"
    }))

    const response = await fetch("/api/ai/process-smile-photo", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    if (result.success) {
      setBeforeAfterImages({
        before: result.beforeImage,
        after: result.afterImage,
      })
    }
  } catch (error) {
    console.error("Photo processing error:", error)
  } finally {
    setIsProcessingPhoto(false)
  }
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const submissionData = {
      ...formData,
      beforeAfterImages,
      photo: null
    }

    console.log("Submitting application for:", formData.name)

    const response = await fetch("/api/funnel/submit-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Application submitted successfully")
      
      if (!result.email_sent) {
        console.warn("Emails failed to send, but application was submitted")
        // You might want to show a warning to the user
        alert("Application submitted! However, there was an issue sending confirmation emails. We'll contact you directly.")
      }
      
      setApplicationData(result)
      setShowApplication(false)
      setShowPayment(true)
    } else {
      console.error("Application submission failed:", result.error)
      alert("Application submission failed: " + result.error)
    }
  } catch (error) {
    console.error("Application error:", error)
    alert("Application submission failed. Please try again.")
  }
}

  const handlePaymentSuccess = (paymentResult: any) => {
    setShowPayment(false)
    setShowCalendar(true)
  }

  const handleBookingComplete = (bookingDetails: any) => {
    setShowCalendar(false)
    // Reset form for next user
    setFormData({
      name: "",
      email: "",
      mobile: "",
      city: "",
      goals: "",
      timeline: "",
      budget: "",
      photo: null,
    })
    setApplicationData(null)
    setBeforeAfterImages(null) // Reset AI-generated images
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-16 mx-auto mb-8 flex items-center justify-center">
              <div className="text-3xl font-bold text-amber-600">DoctorSmile.ca</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Natural-Looking Veneers
              <br />
              <span className="text-amber-600">Without the 'Fake' Look</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto text-pretty">
              Risk-free 20‑Minute Smile Design Session. $150 deposit credited if you're a fit.
            </p>

            {/* 3 Key Bullets */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <span className="text-lg font-semibold">Natural Aesthetics</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <span className="text-lg font-semibold">Seamless Journey</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <span className="text-lg font-semibold">Risk-Free Consult</span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 text-xl mb-6"
              onClick={() => setShowApplication(true)}
            >
              Start Your Smile Design
            </Button>

            {/* Guarantee */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-green-800 font-semibold">
                💰 Money-Back Guarantee: If you don't feel it was worth $500, we refund your $150.
              </p>
            </div>
          </div>

          {/* Before/After Carousel */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Real Patient Transformations</h2>
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Before</h3>
                  <img
                    src={beforeAfterSlides[currentSlide].before || "/placeholder.svg"}
                    alt="Before"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">After</h3>
                  <img
                    src={beforeAfterSlides[currentSlide].after || "/placeholder.svg"}
                    alt="After"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="text-center mt-6">
                <h4 className="text-lg font-semibold">
                  {beforeAfterSlides[currentSlide].name}, Age {beforeAfterSlides[currentSlide].age}
                </h4>
                <p className="text-gray-600">{beforeAfterSlides[currentSlide].treatment}</p>
              </div>

              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section - Video Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Patients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonialVideos.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-t-lg">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{video.name}</h3>
                    <p className="text-gray-600 mb-2">{video.location}</p>
                    <p className="text-gray-700 italic">"{video.quote}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Your Journey to a Perfect Smile</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Virtual Consult</h3>
              <p className="text-gray-600">
                20-minute video consultation to assess your candidacy and create your personalized treatment plan.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. In-Clinic Design</h3>
              <p className="text-gray-600">
                Visit our London or Oakville location for precise measurements and custom veneer design.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Transformation</h3>
              <p className="text-gray-600">
                Receive your custom veneers and comprehensive aftercare package for lasting results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Stack Tease */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">All-Inclusive Package Available</h2>
          <p className="text-xl text-gray-700 mb-8">
            Every transformation includes premium night guards, 5-year warranty, professional cleanings, and a complete
            oral care kit - over $13,000 in value included at no additional cost.
          </p>
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4"
            onClick={() => setShowApplication(true)}
          >
            Learn More About Your Package
          </Button>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Is the procedure painful?</h3>
              <p className="text-gray-700">
                Most patients experience minimal discomfort. We use local anesthesia during preparation, and any
                sensitivity typically subsides within a few days.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">How long do veneers last?</h3>
              <p className="text-gray-700">
                With proper care, porcelain veneers typically last 15-20 years. We include a 5-year warranty against
                breakage when you follow our aftercare protocol.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">What's the cost range?</h3>
              <p className="text-gray-700">
                Investment ranges from $32,000-$40,000 for a full smile transformation (16-20 veneers), including our
                comprehensive aftercare package worth over $13,000.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Do you offer financing?</h3>
              <p className="text-gray-700">
                Yes, we offer flexible payment plans and work with healthcare financing companies to make your dream
                smile affordable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Start Your Smile Design Session</h2>
                <button onClick={() => setShowApplication(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      ✓ I consent to receive SMS updates about my appointment
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="london">London, ON</SelectItem>
                        <SelectItem value="oakville">Oakville, ON</SelectItem>
                        <SelectItem value="toronto">Toronto, ON</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goals">What are your smile goals? *</Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => handleInputChange("goals", e.target.value)}
                    placeholder="Describe what you'd like to improve about your smile..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline">Preferred Timeline *</Label>
                    <Select onValueChange={(value) => handleInputChange("timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When would you like to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="6+months">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Readiness *</Label>
                    <Select onValueChange={(value) => handleInputChange("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Investment range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30-35k">$30,000 - $35,000</SelectItem>
                        <SelectItem value="35-40k">$35,000 - $40,000</SelectItem>
                        <SelectItem value="40k+">$40,000+</SelectItem>
                        <SelectItem value="financing">Need financing options</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

             


<div>
  <DeepAISmileEnhancer onImagesGenerated={(before, after) => {
    setBeforeAfterImages({ before, after })
  }} />
  
  {beforeAfterImages && (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold mb-3 text-center">AI-Enhanced Smile Preview</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Original</p>
          <img
            src={beforeAfterImages.before || "/placeholder.svg"}
            alt="Before"
            className="w-full h-48 object-contain rounded-lg bg-white border"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium mb-2">AI Enhanced</p>
          <img
            src={beforeAfterImages.after || "/placeholder.svg"}
            alt="AI Enhanced"
            className="w-full h-48 object-contain rounded-lg bg-white border"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">
        *Powered by AI image enhancement technology.
      </p>
    </div>
  )}
</div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Secure your session with a $150 deposit</li>
                    <li>Choose your preferred consultation time</li>
                    <li>Receive confirmation and preparation materials</li>
                  </ol>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 text-lg"
                >
                  Secure My Session - $150 Deposit
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  Your $150 deposit will be credited toward your treatment if you proceed. By submitting, you agree to
                  our terms and privacy policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        applicationData={applicationData}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Calendar Booking Modal */}
      <CalendarBooking
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        applicationData={applicationData}
        onBookingComplete={handleBookingComplete}
      />

      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden z-40">
        <Button
          size="lg"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => setShowApplication(true)}
        >
          Start Your Smile Design - $150
        </Button>
      </div>
    </div>
  )
}