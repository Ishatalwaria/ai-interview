import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaUser, FaSignOutAlt, FaChevronDown, FaBars, FaTimes, FaBrain } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"


export default function Header() {
  const { user, isLoggedIn, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    setIsDropdownOpen(false)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
      <Link to="/" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">Home</Link>
      <Link to="/about" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">About</Link>
      {isLoggedIn && (
        <Link to="/interview/setup" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">Practice</Link>
      )}
      {isLoggedIn && (
        <Link to="/dashboard" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">Dashboard</Link>
      )}
      <Link to="/resources" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">Resources</Link>
    </div>
  )

  return (
    <>
  <header className="sticky top-0 z-50 glass transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    <FaBrain className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">PrepBuddy</span>
              </Link>
            </div>

            <nav className="hidden md:flex">
              <NavLinks />
            </nav>

            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-primary focus:outline-none"
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200">Log in</Link>
                  <Link to="/signup" className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5">Sign up</Link>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-primary/30 bg-white/50 hover:bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center overflow-hidden shadow-sm text-white font-bold text-sm">
                      {user?.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.name || user.email)
                      )}
                    </div>
                    <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 py-2 z-50 animate-fade-in ring-1 ring-black/5">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200" onClick={() => setIsDropdownOpen(false)}>
                          <FaUser className="w-4 h-4 mr-3 opacity-70" />
                          Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-left">
                          <FaSignOutAlt className="w-4 h-4 mr-3 opacity-70" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-2 space-y-2 pb-4 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 shadow-xl">
              <NavLinks />
              {!isLoggedIn ? (
                <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
                  <Link to="/login" className="block px-4 py-2 rounded-xl text-center text-gray-700 hover:bg-gray-50 font-medium">Log in</Link>
                  <Link to="/signup" className="block px-4 py-2 bg-primary text-white rounded-xl text-center font-medium shadow-lg shadow-primary/20">Sign up</Link>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
                  <Link to="/profile" className="block px-4 py-2 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary font-medium">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Confirm Logout</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
