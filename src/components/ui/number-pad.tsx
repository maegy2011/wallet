'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface NumberPadProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  className?: string
  onInputClick?: () => void
}

export default function NumberPad({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = '0',
  disabled = false,
  maxLength,
  className = '',
  onInputClick
}: NumberPadProps) {
  const [displayValue, setDisplayValue] = useState(value || '')

  useEffect(() => {
    setDisplayValue(value || '')
  }, [value])

  const handleNumberClick = (num: string) => {
    if (disabled) return
    
    let newValue = displayValue
    
    if (num === '.') {
      // Only allow one decimal point
      if (!newValue.includes('.')) {
        newValue = newValue + num
      }
    } else {
      // Handle leading zeros
      if (newValue === '0' && num !== '0') {
        newValue = num
      } else if (newValue === '0') {
        newValue = '0'
      } else {
        newValue = newValue + num
      }
    }
    
    // Check max length
    if (maxLength && newValue.length > maxLength) {
      return
    }
    
    setDisplayValue(newValue)
    onChange(newValue)
    
    // Vibration feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleBackspace = () => {
    if (disabled || displayValue.length === 0) return
    
    const newValue = displayValue.slice(0, -1)
    setDisplayValue(newValue)
    onChange(newValue)
    
    // Vibration feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleClear = () => {
    if (disabled) return
    
    setDisplayValue('')
    onChange('')
    onClear()
    
    // Vibration feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
  }

  const handleSubmit = () => {
    if (disabled || !onSubmit) return
    onSubmit()
    
    // Vibration feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50])
    }
  }

  return (
    <Card className={`w-full max-w-sm mx-auto ${className}`}>
      <CardContent className="p-4">
        {/* Number Pad Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Row 1 */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('1')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('2')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            2
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('3')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            3
          </Button>

          {/* Row 2 */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('4')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            4
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('5')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            5
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('6')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            6
          </Button>

          {/* Row 3 */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('7')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            7
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('8')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            8
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('9')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            9
          </Button>

          {/* Row 4 */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('.')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            .
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('0')}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            0
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleBackspace}
            disabled={disabled}
            className="text-lg font-semibold"
          >
            ←
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={disabled}
          >
            مسح
          </Button>
          {onSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={disabled || !displayValue || parseFloat(displayValue) <= 0}
            >
              تأكيد
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}