'use client'

import { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'

interface ProtectedEmailProps {
  email: string
  subject?: string
  className?: string
  displayText?: string
}

export default function ProtectedEmail({ 
  email, 
  subject = '', 
  className = '', 
  displayText 
}: ProtectedEmailProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEmailClick = () => {
    if (!isClient) return
    
    const mailtoLink = subject 
      ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
      : `mailto:${email}`
    
    window.location.href = mailtoLink
  }

  // Show placeholder during SSR to protect from bots
  if (!isClient) {
    return (
      <span className={className}>
        [البريد الإلكتروني محمي]
      </span>
    )
  }

  return (
    <button
      onClick={handleEmailClick}
      className={`inline-flex items-center hover:text-emerald-600 transition-colors ${className}`}
      title={`انقر لإرسال بريد إلكتروني إلى ${displayText || email}`}
    >
      <Mail className="h-5 w-5" />
      <span>{displayText || email}</span>
    </button>
  )
}