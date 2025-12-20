'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function MobileMenuToggle() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        const sidebar = document.querySelector('#mobile-sidebar')
        if (sidebar) {
          sidebar.classList.add('hidden')
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const toggleSidebar = () => {
    const sidebar = document.querySelector('#mobile-sidebar')
    const desktopSidebar = document.querySelector('.lg\\:block')
    
    if (sidebar) {
      sidebar.classList.toggle('hidden')
    }
    
    // Also toggle desktop sidebar
    if (desktopSidebar) {
      desktopSidebar.classList.toggle('hidden')
    }
    
    setIsOpen(!isOpen)
  }

  return (
    <button
      className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
      onClick={toggleSidebar}
      aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-gray-600" />
      ) : (
        <Menu className="w-6 h-6 text-gray-600" />
      )}
    </button>
  )
}