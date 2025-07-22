import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg' 
          : 'backdrop-blur-sm bg-white/60'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo-lahermosa.png" 
              alt="La Hermosa Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Packaging & Palletizing Optimizer
              </p>
            </div>
          </div>

          {/* Optional: Add navigation or user menu here */}
          <div className="flex items-center gap-4">
            {/* You can add navigation items or user menu here */}
          </div>
        </div>
      </div>
    </header>
  )
}