import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import faqData from "../data/faqData";

export default function Contact() {
	return (
		<div className="min-h-screen relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-slate-50 -z-20"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

			<section className="py-16 lg:py-24 relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
					<h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
						Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Touch</span>
					</h1>
					<p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
						Have questions about PrepBuddy? We're here to help you master your interview skills.
					</p>
				</div>
			</section>

			<section className="pb-20 relative z-10" id="contact-form">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl transform transition-all hover:shadow-primary/5">
                        <ContactForm />
                    </div>
				</div>
			</section>

			<section className="py-20 bg-white/50 backdrop-blur-sm">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-slate-600">Quick answers to common questions about PrepBuddy.</p>
                    </div>
					<FAQ
						faqs={faqData}
						allowMultipleOpen={false}
					/>
				</div>
			</section>
		</div>
	);
}
