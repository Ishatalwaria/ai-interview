import { Link } from "react-router-dom";
import { SiX } from "react-icons/si";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaBrain } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-md">
                    <FaBrain className="w-5 h-5" />
                </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">PrepBuddy</span>
            </div>
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              Master your interview skills with AI-powered practice sessions, real-time feedback, 
              and personalized insights to help you land your dream job.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com/Ishatalwaria/ai-interview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-primary transition-colors duration-200 hover:-translate-y-1 transform"
                aria-label="GitHub"
              >
                <FaGithub className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/Ishatalwaria"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-primary transition-colors duration-200 hover:-translate-y-1 transform"
                aria-label="Twitter"
              >
                <SiX className="h-5 w-5 mt-0.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/isha-talwaria-59015b256"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-primary transition-colors duration-200 hover:-translate-y-1 transform"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:ishatalwaria2020@gmail.com"
                className="text-slate-400 hover:text-primary transition-colors duration-200 hover:-translate-y-1 transform"
                aria-label="Email"
              >
                <FaEnvelope className="h-6 w-6" />
              </a>
            </div>
          </div>
		  
		  {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/interview/setup" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Practice
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-slate-500">
            © {new Date().getFullYear()} PrepBuddy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="text-slate-500 hover:text-primary transition-colors duration-200">
              Privacy
            </Link>
            <Link to="#" className="text-slate-500 hover:text-primary transition-colors duration-200">
              Terms
            </Link>
            <Link to="#" className="text-slate-500 hover:text-primary transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
