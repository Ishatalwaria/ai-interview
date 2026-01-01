import { Link } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";
import resources from "../data/resourcesData";
import featuredResources from "../data/featuredResourcesData";
import { FaBookOpen, FaVideo, FaCode, FaCheckCircle } from "react-icons/fa";

export default function Resources() {
	return (
		<div className="min-h-screen bg-slate-50">
			{/* Hero Section */}
			<section className="relative overflow-hidden pt-20 pb-32 bg-slate-900 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-900 to-slate-900 opacity-90"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
					<div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-sm font-medium text-green-300">
                             <FaCheckCircle /> Curated Interview Materials
                        </div>
						<h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
							Ace Your Interviews with <br/>
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-secondary">Expert Resources</span>
						</h1>
						<p className="text-xl text-slate-300 mb-10 leading-relaxed">
							Unlock a wealth of curated resources to help
							you prepare for your next interview. From
							coding challenges to behavioral questions,
							we've got you covered.
						</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-10">
                            {[
                                { label: "Resources", val: "50+" },
                                { label: "Topics", val: "10+" },
                                { label: "Formats", val: "3" },
                                { label: "Free", val: "100%" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="text-xl font-bold text-white">{stat.val}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href="#all-resources"
								className="px-8 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-lg"
							>
								Explore Library
							</a>
							<Link
								to="/interview/setup"
								className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
							>
								Start Practicing
							</Link>
						</div>
					</div>
				</div>
			</section>

            {/* Featured Section */}
            <section id="featured-resources" className="relative -mt-20 z-20 pb-16">
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="glass rounded-2xl p-8 border border-white/40 shadow-xl">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Featured Resources</h2>
                                <p className="text-slate-500">Handpicked items to jumpstart your preparation.</p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaVideo /></div>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaBookOpen /></div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FaCode /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredResources.map((resource) => (
                                <div key={resource.id} className="transition-transform hover:-translate-y-1 duration-300">
                                     <ResourceCard {...resource} />
                                </div>
                            ))}
                        </div>
                    </div>
				</div>
			</section>

			<section id="all-resources" className="py-16 bg-slate-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">All Resources</h2>
                        <div className="h-1 w-20 bg-primary rounded-full md:mx-0 mx-auto"></div>
                    </div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{resources.map((resource) => (
							<ResourceCard key={resource.id} {...resource} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
