"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  onError?: (error: string) => void
}

export function Captcha({ onVerify, onError }: CaptchaProps) {
  const [captchaId, setCaptchaId] = useState<string>("")
  const [captchaImage, setCaptchaImage] = useState<string>("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const fetchCaptcha = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/captcha")
      const id = response.headers.get("X-Captcha-Id")
      const image = await response.text()
      
      setCaptchaId(id || "")
      setCaptchaImage(image)
      setAnswer("")
      setIsVerified(false)
    } catch (error) {
      onError?.("فشل تحميل الكابتشا")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCaptcha = async () => {
    if (!captchaId || !answer) {
      onError?.("يرجى إدخال رمز التحقق")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: captchaId, answer }),
      })

      const data = await response.json()

      if (data.valid) {
        setIsVerified(true)
        onVerify(true)
      } else {
        onError?.("رمز التحقق غير صحيح")
        onVerify(false)
        fetchCaptcha() // Refresh captcha on error
      }
    } catch (error) {
      onError?.("فشل التحقق من الكابتشا")
      onVerify(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  if (isVerified) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm text-green-600">تم التحقق بنجاح</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="captcha">رمز التحقق</Label>
      <div className="flex items-center space-x-3 space-x-reverse">
        <div 
          className="border rounded p-2 bg-gray-50"
          dangerouslySetInnerHTML={{ __html: captchaImage }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchCaptcha}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <Input
          id="captcha"
          placeholder="أدخل الرمز الظاهر"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-32"
          maxLength={4}
        />
        <Button
          type="button"
          onClick={verifyCaptcha}
          disabled={isLoading || !answer}
          size="sm"
        >
          تحقق
        </Button>
      </div>
    </div>
  )
}