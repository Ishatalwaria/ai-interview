import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ContentSection from "../components/ContentSection";
import ReviewQuestion from "../components/QuestionReview";
import downloadPDF from "../utils/pdfDownload";
import { FaDownload, FaRedo, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function InterviewReport() {
	const navigate = useNavigate();
	const { interviewId } = useParams();
	const [report, setReport] = useState(null);
	const [interview, setInterview] = useState(null);

	useEffect(() => {
		const fetchReport = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/report/${interviewId}`
				);
				setReport(response.data);

				const interviewResponse = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/interview/${interviewId}`
				);
				setInterview(interviewResponse.data);
			} catch (error) {
				console.error("Error fetching report:", error);
			}
		};

		fetchReport();
	}, [interviewId]);

	const finalScore = report ? report.finalScore : 0;
	const summary = report ? report.summary : "";
	const improvementAreas = report ? report.areaOfImprovement : [];
	const strengths = report ? report.strengths : [];
	const reviewQuestions = report ? report.answers : [];

	
	return (
		<>
			{report && (
				<div className="min-h-screen bg-slate-50 relative">
                     <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

					<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                    Interview Report
                                </h1>
                                <p className="text-slate-500">
                                    Comprehensive analysis of your performance.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => downloadPDF({ report, interview })}
                                    className="px-6 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center shadow-sm"
                                >
                                    <FaDownload className="mr-2" /> Download PDF
                                </button>
                                <button
                                    onClick={() => navigate("/interview/setup")}
                                    className="btn-primary px-6 py-2.5 flex items-center shadow-lg shadow-primary/25"
                                >
                                    <FaRedo className="mr-2" /> Start New Interview
                                </button>
                            </div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                            {/* Score Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">
                                     <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                         {/* Circular Progress Placeholder - can receive actual circular progress component */}
                                         <div className="w-full h-full rounded-full border-8 border-slate-100 flex items-center justify-center">
                                             <span className={`text-4xl font-bold ${finalScore >= 70 ? 'text-green-500' : finalScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                 {finalScore}%
                                             </span>
                                         </div>
                                     </div>
                                     <h3 className="text-lg font-bold text-slate-900">Overall Score</h3>
                                     <p className="text-sm text-slate-500">Based on your answers</p>
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="lg:col-span-3">
                                 <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm h-full">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        Performance Summary
                                    </h3>
                                    <div className="prose prose-slate max-w-none text-slate-600">
                                        {/* Assuming summary is an array or string */}
                                        {Array.isArray(summary) ? summary.map((s, i) => <p key={i}>{s}</p>) : <p>{summary}</p>}
                                    </div>
                                 </div>
                            </div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center text-green-600">
                                    <FaCheckCircle className="mr-2" /> Key Strengths
                                </h3>
                                <ul className="space-y-3">
                                    {strengths.map((item, index) => (
                                        <li key={index} className="flex items-start text-slate-600 bg-green-50/50 p-3 rounded-lg">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center text-orange-500">
                                    <FaExclamationCircle className="mr-2" /> Areas for Improvement
                                </h3>
                                <ul className="space-y-3">
                                    {improvementAreas.map((item, index) => (
                                        <li key={index} className="flex items-start text-slate-600 bg-orange-50/50 p-3 rounded-lg">
                                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
						</div>

						<div className="mb-10">
							<h2 className="text-2xl font-bold text-slate-900 mb-6">
								Detailed Answer Review
							</h2>
							<div className="space-y-6">
                                {reviewQuestions.map((question, index) => (
                                    <div key={index} className="bg-white rounded-2xl border border-slate-100 p-1 shadow-sm overflow-hidden">
                                        <ReviewQuestion
                                            questionNumber={index + 1}
                                            question={question.question}
                                            userAnswer={question.userAnswer}
                                            preferredAnswer={
                                                question.preferredAnswer
                                            }
                                            score={question.score}
                                            feedback={question.feedback}
                                            defaultExpanded={false}
                                        />
                                    </div>
                                ))}
							</div>
						</div>
					</main>
				</div>
			)}
		</>
	);
}
