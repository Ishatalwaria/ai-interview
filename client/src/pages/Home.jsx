import Card from "../components/Card";
import FAQ from "../components/FAQ";
import faqData from "../data/faqData";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaMicrophone, FaDesktop, FaChartLine, FaCheckCircle, FaStar } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in shadow-sm">
                      <FaStar className="text-yellow-400 mr-2" />
                      <span className="text-sm font-medium text-slate-700"> #1 AI Interview Prep Platform</span>
                  </div>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    Ace Your <br/>
                    <span className="text-gradient">Next Interview</span>
                  </h1>
                  
                  <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Master your interview skills with our intelligent AI coach. 
                    Get real-time feedback, personalized questions, and detailed analytics to land your dream job.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => navigate("/interview/setup")}
                      className="btn-primary flex items-center justify-center gap-2 group"
                    >
                      Start Practicing Free
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                    <button
                      onClick={() => navigate("/about")}
                      className="px-8 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-lg shadow-gray-200/50 hover:bg-gray-50 transition-all duration-300"
                    >
                      How it works
                    </button>
                  </div>
                  
                  <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium">
                      <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500" /> No credit card required
                      </div>
                      <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500" /> 10+ Tech stacks
                      </div>
                  </div>
              </div>

              {/* Hero Image/Graphic */}
              <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-30 blur-3xl rounded-full animate-float"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 sm:p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FaRobot className="text-2xl text-primary" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900">AI Interviewer</h3>
                                  <p className="text-xs text-green-500 font-medium">● Online Now</p>
                              </div>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">00:45</div>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                          <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-100">
                              <p className="text-slate-700 text-sm leading-relaxed">
                                  Could you explain the trade-offs between using a relation database versus a NoSQL solution for a high-scale chat application?
                              </p>
                          </div>
                          <div className="bg-primary/5 p-4 rounded-xl rounded-tr-none border border-primary/10 ml-8">
                              <div className="flex gap-2 items-center mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-xs font-medium text-primary">Recording Answer...</span>
                              </div>
                              <div className="h-8 flex items-end gap-1 select-none">
                                  {[40, 60, 45, 70, 90, 60, 50, 70, 55, 40].map((h, i) => (
                                      <div key={i} className="w-1 bg-primary/40 rounded-full transition-all duration-300" style={{ height: `${h}%` }}></div>
                                  ))}
                              </div>
                          </div>
                      </div>

                       <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                           <div className="text-xs text-slate-400">Microphone Active</div>
                           <button className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-110 transition-transform">
                              <FaMicrophone size={16} />
                           </button>
                       </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to <span className="text-gradient">succeed</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
               Our platform combines advanced AI with proven interview techniques to give you the competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <FaDesktop className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Specific Questions</h3>
                <p className="text-slate-600 leading-relaxed">
                   Questions tailored to your target role, from Software Engineer to Product Manager, matched to your experience level.
                </p>
             </div>

             <div className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                   <FaMicrophone className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Speech Analysis</h3>
                <p className="text-slate-600 leading-relaxed">
                   Get instant feedback on your pacing, filler words, clarity, and confidence levels to sound more professional.
                </p>
             </div>

             <div className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                   <FaChartLine className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Performance Tracking</h3>
                <p className="text-slate-600 leading-relaxed">
                   Visualize your progress over time with detailed dashboards and actionable insights for improvement.
                </p>
             </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-24">
         <div className="max-w-4xl mx-auto px-4">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                 <p className="text-slate-600">Got questions? We've got answers.</p>
             </div>
             
             <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <FAQ
                  faqs={faqData}
                  allowMultipleOpen={false}
                />
             </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="max-w-5xl mx-auto px-4 relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Ready to land your dream job?</h2>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                  Join thousands of candidates who are using PrepBuddy to boost their confidence and interview skills.
              </p>
              <button 
                onClick={() => navigate("/interview/setup")}
                className="btn-primary text-lg px-8 py-4 shadow-xl shadow-primary/30"
              >
                  Start Your Free Interview
              </button>
          </div>
      </section>
    </main>
  );
}
