"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Lock, CheckCircle } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  applicationData: any
  onPaymentSuccess: (result: any) => void
}

export function PaymentModal({ isOpen, onClose, applicationData, onPaymentSuccess }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState("payment") // 'payment', 'processing', 'success'
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCardInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const response = await fetch("/api/funnel/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_intent_id: applicationData.payment_intent_id,
          card_data: cardData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPaymentStep("success")
        setTimeout(() => {
          onPaymentSuccess(result)
        }, 2000)
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
      setPaymentStep("payment")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {paymentStep === "payment" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Secure Payment</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">256-bit SSL encrypted</span>
              </div>

              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Consultation Deposit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>20-minute Smile Design Session</span>
                    <span className="font-bold text-xl">$150 CAD</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">✓ Credited toward treatment if you proceed</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  value={cardData.name}
                  onChange={(e) => handleCardInputChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) => handleCardInputChange("number", formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={cardData.expiry}
                    onChange={(e) => handleCardInputChange("expiry", formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cardData.cvc}
                    onChange={(e) => handleCardInputChange("cvc", e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              {isProcessing ? "Processing..." : "Pay $150 CAD"}
            </Button>

            <p className="text-xs text-gray-600 text-center mt-4">
              Your payment is secure and encrypted. You will receive a confirmation email after payment.
            </p>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please don't close this window</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Your consultation deposit has been processed.</p>
            <p className="text-sm text-gray-500">Redirecting to calendar booking...</p>
          </div>
        )}
      </div>
    </div>
  )
}
