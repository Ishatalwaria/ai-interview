import { Link } from "react-router-dom";
import {
	FaArrowRight,
	FaRobot,
	FaMicrophone,
	FaChartLine,
	FaUsers,
	FaUserPlus,
	FaCog,
	FaPlay,
	FaChartBar,
	FaTrophy,
	FaGithub,
	FaStar,
} from "react-icons/fa";

export default function About() {
	const features = [
		{
			icon: <FaRobot className="w-6 h-6" />,
			title: "AI-Powered Questions",
			description:
				"Get personalized interview questions tailored to your role and experience level.",
		},
		{
			icon: <FaMicrophone className="w-6 h-6" />,
			title: "Voice Analysis",
			description:
				"Practice speaking and receive feedback on your communication skills.",
		},
		{
			icon: <FaChartLine className="w-6 h-6" />,
			title: "Performance Analytics",
			description:
				"Track your progress with detailed insights and improvement suggestions.",
		},
		{
			icon: <FaUsers className="w-6 h-6" />,
			title: "Mock Interviews",
			description:
				"Experience realistic interview simulations in a safe environment.",
		},
	];

	const steps = [
		{
			icon: <FaUserPlus className="w-5 h-5" />,
			title: "Sign Up",
			description:
				"Create your free account and set up your profile with your career goals.",
			color: "bg-green-500",
		},
		{
			icon: <FaCog className="w-5 h-5" />,
			title: "Customize Your Prep",
			description:
				"Choose your target role, company, and interview type.",
			color: "bg-purple-500",
		},
		{
			icon: <FaPlay className="w-5 h-5" />,
			title: "Start Practicing",
			description:
				"Begin your mock interviews with AI-generated questions.",
			color: "bg-blue-500",
		},
		{
			icon: <FaChartBar className="w-5 h-5" />,
			title: "Review & Improve",
			description:
				"Analyze your performance with detailed reports.",
			color: "bg-orange-500",
		},
		{
			icon: <FaTrophy className="w-5 h-5" />,
			title: "Ace Your Interview",
			description:
				"Apply your learnings in real interviews with confidence!",
			color: "bg-red-500",
		},
	];
	return (
		<div className="min-h-screen">
            {/* Hero Section */}
			<section className="py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-1 md:order-1 animate-fade-in">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 tracking-wide border border-blue-100">
                                ABOUT US
                            </div>

                            <h1 className="text-4xl lg:text-5xl mb-6 font-bold text-slate-900 leading-tight">
                                Empowering Your <br/>
                                <span className="text-gradient">Interview Success</span>
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-8">
                                PrepBuddy is a cutting-edge platform designed
                                to revolutionize interview preparation. We leverage advanced AI
                                technology to provide personalized feedback,
                                realistic simulations, and comprehensive
                                learning materials.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/signup"
                                    className="btn-primary flex items-center justify-center gap-2"
                                >
                                    Get Started
                                    <FaArrowRight />
                                </Link>

                                <a
                                    href="#what-is"
                                    className="px-6 py-3 rounded-xl bg-white text-slate-700 font-medium border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 flex items-center justify-center"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>

                        <div className="order-2 md:order-2 relative">
                             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-float"></div>
                             <div className="relative glass p-6 rounded-2xl border border-white/40 shadow-xl tilt-card">
                                 <img
                                    src="/about.png"
                                    alt="PrepEdge AI platform illustration"
                                    className="w-full h-auto object-contain rounded-lg"
                                />
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
			<section id="what-is" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
							What is PrepBuddy?
						</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Your personal interview coach, powered by artificial intelligence.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div key={index} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
								<div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
									<div className="text-primary text-xl">
										{feature.icon}
									</div>
								</div>
								<h3 className="text-lg font-bold text-slate-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-slate-600 leading-relaxed text-sm">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

            {/* How It Works */}
			<section className="py-20 bg-slate-50 relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
							How to Use PrepBuddy
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							Simple steps to your dream job.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
							{steps.map((step, index) => (
								<div
									key={index}
									className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
								>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center text-white shadow-md`}>
                                            {step.icon}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 0{index + 1}</span>
                                    </div>
									
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
								</div>
							))}
					</div>

					<div className="text-center mt-16">
						<Link
							to="/signup"
							className="btn-primary inline-flex items-center px-8 py-4 text-lg shadow-xl shadow-primary/20"
						>
							Start Your Journey Today
						</Link>
					</div>
				</div>
			</section>

            {/* Star Section */}
			<section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block p-3 rounded-full bg-white/10 backdrop-blur-md mb-6 animate-bounce-slow">
                        <FaStar className="text-yellow-400 text-2xl" />
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                        Love what we're building?
                    </h3>
                    <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        If PrepBuddy helped you prepare, consider starring our repository. It motivates us to keep improving!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://github.com/Ishatalwaria/ai-interview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3.5 rounded-xl bg-slate-800 text-white font-medium border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 flex items-center"
                        >
                            <FaGithub className="mr-2" />
                            View on GitHub
                        </a>
                        <a
                            href="https://github.com/Ishatalwaria/ai-interview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3.5 rounded-xl bg-yellow-500 text-slate-900 font-bold hover:bg-yellow-400 transition-all duration-300 flex items-center shadow-lg shadow-yellow-500/20"
                        >
                            <FaStar className="mr-2" />
                            Star the Repo
                        </a>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-800">
                        <p className="text-slate-500 text-sm italic">
                            "Built for people chasing offers." <br/>
                            <span className="text-primary font-medium not-italic mt-2 inline-block">— Isha</span>
                        </p>
                    </div>
				</div>
			</section>
		</div>
	);
}
