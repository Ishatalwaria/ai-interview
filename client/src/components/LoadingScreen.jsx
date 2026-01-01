import { FaBrain } from "react-icons/fa";

export default function LoadingScreen({
  message = "Loading..."
}) {

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center relative z-10 animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
              <FaBrain className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">PrepBuddy</span>
          </div>
          <p className="text-slate-500 font-medium">Preparing your personalized experience</p>
        </div>

        <div className="mb-8">
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse"></div>
          </div>

          <p className="text-lg font-bold text-slate-800 mb-2 animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  )
}
