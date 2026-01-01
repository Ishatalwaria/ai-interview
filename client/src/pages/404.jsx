import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaArrowLeft, FaHome } from "react-icons/fa"

export default function Animated404() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div
        className={`text-center relative z-10 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 animate-float">
            4<span className="inline-block animate-bounce delay-100">0</span>
            <span className="inline-block animate-bounce delay-200">4</span>
          </h1>
          <div className="w-32 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-widen"></div>
          </div>
        </div>

        <div className="mb-10 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Space Not Found</h2>
          <p className="text-xl opacity-80 mb-2 text-slate-300">The destination you're looking for doesn't exist.</p>
          <p className="text-lg opacity-60 text-slate-400">Let's steer you back to safety.</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-500"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
          <Link
            to="/"
            className="px-8 py-3 bg-white text-primary hover:bg-slate-100 shadow-xl shadow-primary/20 rounded-xl flex items-center gap-2 text-base font-bold transition-all duration-200 transform hover:scale-105"
          >
            <FaHome className="w-5 h-5" />
            Return Home
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault()
              history.back()
            }}
            className="px-8 py-3 border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 shadow-lg rounded-xl flex items-center gap-2 text-base font-medium transition-all duration-200 transform hover:scale-105"
          >
            <FaArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
