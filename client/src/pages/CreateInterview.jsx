import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import {
	FaArrowRight,
	FaArrowLeft,
	FaUpload,
	FaFileAlt,
	FaTimes,
	FaBriefcase,
	FaClipboardList,
	FaLayerGroup
} from "react-icons/fa";
import Toast from "../components/Toast";

export default function SetupForm() {
	const { user, loading, setLoading } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [drag, setDrag] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const fileInputRef = useRef(null);

	useEffect(() => {
		// console.log("--------\nCurrent user from context:", user, "\n--------");
	}, [user]);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		interviewName: "",
		numOfQuestions: 3,
		interviewType: "Technical",
		role: "",
		experienceLevel: "Fresher",
		companyName: "",
		companyDescription: "",
		jobDescription: "",
		resume: null,
		focusAt: "",
	});

	const totalSteps = 3;
	const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

	const handleNext = () => {
		if (currentStep < totalSteps) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(currentStep + 1);
				setIsTransitioning(false);
			}, 300);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(currentStep - 1);
				setIsTransitioning(false);
			}, 300);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDrag(true);
		} else if (e.type === "dragleave") {
			setDrag(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDrag(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			if (file.type === "application/pdf") {
				handleInputChange("resume", file);
			} else {
                showToast("Only PDF files are allowed", "error");
            }
		}
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (file.type === "application/pdf") {
				handleInputChange("resume", file);
			} else {
                 showToast("Only PDF files are allowed", "error");
            }
		}
	};

	const removeFile = () => {
		handleInputChange("resume", null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) {
			console.error("❌ User is null in CreateInterview.jsx");
			return;
		}
		const API_BASE = import.meta.env.VITE_API_URL;
		if (!API_BASE) {
			showToast("API not configured. Please set VITE_API_URL.", "error");
			return;
		}
		setLoading(true);
		const token = await user.getIdToken();

		const data = new FormData();
		Object.keys(formData).forEach((key) => {
			if (formData[key]) {
				data.append(key, formData[key]);
			}
		});
		
		const url = `${API_BASE}/api/interview/setup`;

		try {
			const res = await axios.post(
				url,
				data,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			showToast("Interview setup complete!", "success");
			const interviewId = res.data.interview._id;
			navigate(`/interview/${interviewId}`);
		} catch (err) {
			const status = err.response?.status;
			const data = err.response?.data;
			console.error("Interview setup failed", { url, status, data, err });
			if (status === 404) {
				showToast("API route not found.", "error");
			} else if (typeof data?.error === "string") {
				showToast(data.error, "error");
			} else {
				showToast("Something went wrong", "error");
			}
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<LoadingScreen
				message="Configuring your interview environment..."
			/>
		);
	}

	return (
		<div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-slate-50 -z-20"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

			<div className="max-w-3xl w-full mx-auto relative z-10 transition-all duration-500 ease-in-out">
                {/* Header Section */}
				<div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2 animate-fade-in">
                        Configure Interview
                    </h1>
					<div className="flex items-center justify-center gap-2 text-sm text-slate-500">
						<span>Step {currentStep} of {totalSteps}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{Math.round(progressPercentage)}% Complete</span>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mb-8 mx-4">
					<div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
						<div
							className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
							style={{ width: `${progressPercentage}%` }}
						></div>
					</div>
				</div>

				{/* Glass Form Container */}
				<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 transform hover:shadow-primary/5">
					<div
						className={`transition-all duration-300 ${
							isTransitioning
								? "opacity-0 scale-95 transform translate-x-4"
								: "opacity-100 scale-100 transform translate-x-0"
						}`}
					>
						{/* Step 1: Interview Basics */}
						{currentStep === 1 && (
							<div className="p-8 md:p-12">
								<div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary text-2xl transition-transform hover:scale-110">
                                        <FaLayerGroup />
                                    </div>
									<h2 className="text-2xl font-bold text-slate-800 mb-2">
										Interview Basics
									</h2>
                                    <p className="text-slate-500">Define the core parameters of your session.</p>
								</div>

								<div className="space-y-6">
									<div className="group">
										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
											Interview Name
										</label>
										<input
											type="text"
											value={formData.interviewName}
											onChange={(e) =>
												handleInputChange(
													"interviewName",
													e.target.value
												)
											}
											placeholder="e.g. Frontend Specialist Role"
											className={`w-full px-5 py-4 bg-white/50 border ${formData.interviewName!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm group-hover:bg-white`}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                                Number of Questions
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.numOfQuestions}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "numOfQuestions",
                                                            Number.parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer group-hover:bg-white"
                                                >
                                                    {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                        <option key={num} value={num}>
                                                            {num} Questions
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group">
    										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
    											Interview Type
    										</label>
    										<div className="flex bg-slate-100 p-1 rounded-xl">
    											{["Technical", "Behavioral", "Mixed"].map((type) => (
    												<button
    													key={type}
    													type="button"
    													onClick={() => handleInputChange("interviewType", type)}
    													className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
    														formData.interviewType === type
    															? "bg-white text-primary shadow-md transform scale-[1.02]"
    															: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
    													}`}
    												>
    													{type}
    												</button>
    											))}
    										</div>
                                        </div>
									</div>
								</div>

								<div className="flex justify-end mt-12">
									<button
										onClick={handleNext}
										disabled={formData.interviewName === ""}
										className={`px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 transform active:scale-95 ${formData.interviewName==="" ? "opacity-50 cursor-not-allowed grayscale" :""}`}
									>
										<span>Next Step</span>
										<FaArrowRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}

						{/* Step 2: Job Details */}
						{currentStep === 2 && (
							<div className="p-8 md:p-12">
								<div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-secondary text-2xl transition-transform hover:scale-110">
                                        <FaBriefcase />
                                    </div>
									<h2 className="text-2xl font-bold text-slate-800 mb-2">
										Role Context
									</h2>
									<p className="text-slate-500">
										Details about the position you are targeting.
									</p>
								</div>

								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
    										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
    											Target Role
    										</label>
    										<input
    											type="text"
    											value={formData.role}
    											onChange={(e) =>
    												handleInputChange("role", e.target.value)
    											}
    											placeholder="e.g. Senior Backend Engineer"
    											className={`w-full px-5 py-4 bg-white/50 border ${formData.role!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm group-hover:bg-white`}
    										/>
                                        </div>
                                        <div className="group">
    										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
    											Company
    										</label>
    										<input
    											type="text"
    											value={formData.companyName}
    											onChange={(e) =>
    												handleInputChange("companyName", e.target.value)
    											}
    											placeholder="e.g. Acme Corp"
    											className={`w-full px-5 py-4 bg-white/50 border ${formData.companyName!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm group-hover:bg-white`}
    										/>
                                        </div>
									</div>

									<div className="group">
										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
											Experience Level
										</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {["Fresher", "Junior", "Mid", "Senior"].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => handleInputChange("experienceLevel", type)}
                                                    className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                                                        formData.experienceLevel === type
                                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-slate-800"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
									</div>

									<div className="group">
										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
											Company Description
										</label>
										<textarea
											value={formData.companyDescription}
											onChange={(e) =>
												handleInputChange(
													"companyDescription",
													e.target.value
												)
											}
											placeholder="Briefly describe the company's domain, culture, or mission..."
											rows={3}
											className={`w-full px-5 py-4 bg-white/50 border ${formData.companyDescription!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none group-hover:bg-white`}
										/>
									</div>

									<div className="group">
										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
											Job Description / Key Requirements
										</label>
										<textarea
											value={formData.jobDescription}
											onChange={(e) =>
												handleInputChange(
													"jobDescription",
													e.target.value
												)
											}
											placeholder="Paste the JD here or list key technical and behavioral requirements..."
											rows={5}
											className={`w-full px-5 py-4 bg-white/50 border ${formData.jobDescription!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none group-hover:bg-white`}
										/>
									</div>
								</div>

								<div className="flex justify-between mt-12">
									<button
										onClick={handleBack}
										className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center space-x-2"
									>
										<FaArrowLeft className="w-4 h-4" />
										<span>Back</span>
									</button>
									<button
										onClick={handleNext}
										disabled={(formData.jobDescription==="") || (formData.companyDescription==="") || (formData.companyName==="") || (formData.role==="")}
										className={`px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 transform active:scale-95 ${((formData.jobDescription==="") || (formData.companyDescription==="") || (formData.companyName==="") || (formData.role===""))? "opacity-50 cursor-not-allowed grayscale" :""}`}
									>
										<span>Next Step</span>
										<FaArrowRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}

						{/* Step 3: Resume & Focus */}
						{currentStep === 3 && (
							<div className="p-8 md:p-12">
								<div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 text-2xl transition-transform hover:scale-110">
                                        <FaClipboardList />
                                    </div>
									<h2 className="text-2xl font-bold text-slate-800 mb-2">
										Final Details
									</h2>
									<p className="text-slate-500">
										Upload your resume and set specific focus areas.
									</p>
								</div>

								<div className="space-y-8">
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-4 ml-1">
											Resume (PDF)
										</label>

										{!formData.resume ? (
											<div
												className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
													drag
														? "border-primary bg-primary/5 scale-[1.02]"
														: "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
												}`}
												onDragEnter={handleDrag}
												onDragLeave={handleDrag}
												onDragOver={handleDrag}
												onDrop={handleDrop}
											>
												<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                                    <FaUpload className="w-6 h-6" />
                                                </div>
												<div className="space-y-2">
													<button
														type="button"
														onClick={() =>
															fileInputRef.current?.click()
														}
														className="text-primary hover:text-purple-700 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 transition-all hover:shadow"
													>
														Select PDF
													</button>
													<p className="text-slate-500">
														or drag and drop here
													</p>
												</div>
												<p className="text-xs text-slate-400 mt-4">
													Maximum file size: 5MB
												</p>
												<input
													ref={fileInputRef}
													type="file"
													accept=".pdf"
													onChange={handleFileSelect}
													className="hidden"
												/>
											</div>
										) : (
											<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fade-in-up">
												<div className="flex items-center space-x-4">
													<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
                                                        <FaFileAlt className="w-6 h-6" />
                                                    </div>
													<div>
														<p className="font-semibold text-slate-800 truncate max-w-[200px] md:max-w-xs">
															{formData.resume.name}
														</p>
														<p className="text-xs text-slate-500">
															{(
																formData.resume.size /
																1024 /
																1024
															).toFixed(2)}{" "}
															MB
														</p>
													</div>
												</div>
												<button
													onClick={removeFile}
													className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
												>
													<FaTimes className="w-5 h-5" />
												</button>
											</div>
										)}
									</div>

									<div className="group">
										<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
											Specific Focus Areas
										</label>
										<textarea
											value={formData.focusAt}
											onChange={(e) =>
												handleInputChange(
													"focusAt",
													e.target.value
												)
											}
											placeholder="e.g. Please focus on Hash Maps, System Design patterns, and soft skills."
											rows={4}
											className={`w-full px-5 py-4 bg-white/50 border ${formData.focusAt!==""? "border-slate-200" : "border-red-300"} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm resize-none group-hover:bg-white`}
										/>
									</div>
								</div>

								<div className="flex justify-between mt-12">
									<button
										onClick={handleBack}
										className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center space-x-2"
									>
										<FaArrowLeft className="w-4 h-4" />
										<span>Back</span>
									</button>
									<button
										onClick={handleSubmit}
										disabled={(formData.focusAt==="") || (!formData.resume)}
										className={`px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${((formData.focusAt==="") || (!formData.resume)) ? "opacity-50 cursor-not-allowed grayscale" :""}`}
									>
										Start Interview
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
                
                {/* Footer Note */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    <p>Designed for premium interview preparation</p>
                </div>
			</div>
		</div>
	);
}
