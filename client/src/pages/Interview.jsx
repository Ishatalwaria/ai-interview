import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

import { FaMicrophone, FaArrowRight, FaExclamationTriangle, FaClock, FaVideo } from "react-icons/fa";

//new feature imports
import { analyzeSpeech } from "../utils/speechAnalysis";
import ConfidenceHeatmap from "../components/ConfidenceHeatmap";
import useObjectDetection from "../hooks/useObjectDetection";
import { useProctoring } from "../hooks/useProctoring";

const SpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function Interview() {
	const { interviewId } = useParams();
	const [questions, setQuestions] = useState([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [totalTime, setTotalTime] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});

	// new feature states
	const [transcriptWords, setTranscriptWords] = useState([]);
	const [analyzedWords, setAnalyzedWords] = useState([]);
	const [stats, setStats] = useState(null);

    // Proctoring states
    const videoRef = useRef(null);
    const [isTerminated, setIsTerminated] = useState(false);

    const handleCheatAttempt = (reason, count) => {
        if (isTerminated) return;

        const limit = 3;
        const remaining = limit - count;
        
        if (remaining >= 0) {
             showToast(`Warning: ${reason}. ${remaining} warning(s) remaining.`, "warning");
        }
        
        if (remaining < 0) { 
             if (count >= 3) {
                 setIsTerminated(true);
                 showToast(`Interview Terminated due to suspicious activity: ${reason}`, "error");
                 if(recognition) recognition.stop();
             }
        }
    };

    const { stream, isCameraActive } = useProctoring(handleCheatAttempt);
    
    // 🔍 Integrate Object Detection
    useObjectDetection({
        videoRef,
        onPhoneDetected: () => {
             showToast("⚠️ Phone Detected! Please remove prohibited devices.", "warning");
        }
    });

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, videoRef]);


	const { loading, setLoading } = useAuth();
	const navigate = useNavigate();

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const speakQuestion = (text) => {
        if (isTerminated) return;
		const utterance = new SpeechSynthesisUtterance(text);
		window.speechSynthesis.speak(utterance);
	};

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const res = await axios.get(
					`${
						import.meta.env.VITE_API_URL
					}/api/interview/${interviewId}`
				);
				setQuestions(res.data.questions);
				if (res.data.questions.length > 0) {
					speakQuestion(res.data.questions[0].question);
				}
			} catch (err) {
				showToast(err.message || "Failed to load questions.", "error");
			}
		};
		fetchQuestions();
	}, [interviewId]);

	useEffect(() => {
        if (isTerminated) return;
		const totalTimer = setInterval(() => {
			setTotalTime((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(totalTimer);
	}, [isTerminated]);

	const formatTotalTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return {
			hours: hours.toString().padStart(2, "0"),
			minutes: minutes.toString().padStart(2, "0"),
			seconds: remainingSeconds.toString().padStart(2, "0"),
		};
	};


	const startRecording = () => {
        if (isTerminated) return;
		if (!recognition) {
			showToast(
				"Speech Recognition not supported in this browser.",
				"error"
			);
			return;
		}

		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onstart = () => {
			setIsRecording(true);
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setIsRecording(false);
			showToast("Error during speech recognition", "error");
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

        recognition.onresult = (event) => {
            let newWords = [];

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                
                if (!result.isFinal) continue; // Only process finalized results

                const transcript = result[0].transcript;
                const confidence = result[0].confidence;

                const words = transcript.trim().split(/\s+/);
                const baseTime = Date.now() / 1000;

                words.forEach((word, idx) => {
                newWords.push({
                    word,
                    confidence,
                    time: baseTime + idx * 0.4, // simulate time per word
                });
                });
            }

            if (newWords.length === 0) return;

            setTranscriptWords((prev) => {
                const combined = [...prev, ...newWords];
                const { analyzedWords, stats } = analyzeSpeech(combined);
                setAnalyzedWords(analyzedWords);
                setStats(stats); 
                return combined;
            });

            setAnswer((prev) => prev + " " + newWords.map(w => w.word).join(" "));
        };

		recognition.start();
	};

	const submitAnswer = async () => {
        if (isTerminated) return;
		try {
			setLoading(true);
			await axios.post(
				`${
					import.meta.env.VITE_API_URL
				}/api/interview/${interviewId}/answer`,
				{
					questionId: currentQuestionIndex,
					answer,
				}
			);

			if (currentQuestionIndex < questions.length - 1) {
				const nextIndex = currentQuestionIndex + 1;
			    setCurrentQuestionIndex(nextIndex);
                setAnswer("");
                setTranscriptWords([]);
                setAnalyzedWords([]);
                setStats(null);
                speakQuestion(questions[nextIndex].question);
			} else {
				showToast("Interview Completed!", "success");
				navigate(`/interview/report/${interviewId}`);
			}
		} catch (err) {
			showToast(err.message || "Failed to submit answer.", "error");
		} finally {
			setLoading(false);
		}
	};

	const totalTimeFormatted = formatTotalTime(totalTime);
	const currentQuestion = questions[currentQuestionIndex];

	if (loading) {
		return <LoadingScreen message="Processing your response..." showProgress />;
	}

	return (
		<div className="min-h-screen relative overflow-hidden font-sans">
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

            {/* Camera Feed - Floating */}
            <div className="fixed top-24 right-8 w-56 bg-black rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden z-50 transition-all hover:scale-105 group">
                <div className="relative aspect-video bg-slate-900">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                    {!isCameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 text-xs">
                            <FaVideo className="w-8 h-8 mb-2 opacity-50" />
                            <span>Camera Off</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                         <span className="text-[10px] font-bold text-white tracking-wider">REC</span>
                    </div>
                </div>
            </div>

            {/* Termination Overlay */}
            {isTerminated && (
                <div className="absolute inset-0 bg-red-50/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md text-center border border-red-100 transform scale-100 animate-bounce-in">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaExclamationTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Interview Terminated</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            We detected suspicious activity during your session. 
                            To ensure the integrity of the interview process, the session has been automatically stopped.
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full bg-red-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                        >
                            Return to Safe Zone
                        </button>
                    </div>
                </div>
            )}

			<main className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 transition-all duration-500 ${isTerminated ? 'blur-sm grayscale' : ''}`}>
				<div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
                            Interview Session
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-4">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/20 flex items-center gap-4">
                            <FaClock className="text-primary w-5 h-5" />
                            <div className="flex items-center gap-1 font-mono text-xl font-bold text-slate-700">
                                <span className="w-8 text-center">{totalTimeFormatted.hours}</span>
                                <span className="opacity-30">:</span>
                                <span className="w-8 text-center">{totalTimeFormatted.minutes}</span>
                                <span className="opacity-30">:</span>
                                <span className="w-8 text-center">{totalTimeFormatted.seconds}</span>
                            </div>
                        </div>
                    </div>
				</div>

				{(!questions || questions.length === 0) && !loading && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No Questions Found</h2>
                        <p className="text-slate-500 mb-6">Unable to load interview questions. Please try again later.</p>
                         <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

				{currentQuestion && (
					<div className="space-y-6">
                        {/* Question Card */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-8 md:p-10 relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary"></div>
                             <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed">
								{currentQuestion.question}
							</h2>
                        </div>

						<div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
							<div className="mb-6">
								 <textarea
    								disabled={isRecording || isTerminated}
    								value={answer}
    								onChange={(e) => setAnswer(e.target.value)}
    								placeholder="Speak or type your answer here..."
    								className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-inner text-lg leading-relaxed"
    							/> 

                                {/* heatmap component */}
                                {!isRecording && analyzedWords.length > 0 && (
                                    <div className="mt-6 animate-fade-in">
                                         <ConfidenceHeatmap analyzedWords={analyzedWords} />
                                    </div>
                                )}
                                
                                {/* confidence summary */}
                                {!isRecording && stats && (
                                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap gap-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Filler Words</span>
                                        <span className="text-slate-800 font-bold text-lg">{stats.fillerCount}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Pauses</span>
                                        <span className="text-slate-800 font-bold text-lg">{stats.pauseCount}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Low Confidence</span>
                                        <span className="text-slate-800 font-bold text-lg">{stats.lowConfidenceCount}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Confidence Level</span>
                                        <span className={`font-bold text-lg ${stats.confidenceLevel === 'High' ? 'text-green-500' : stats.confidenceLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {stats.confidenceLevel}
                                        </span>
                                    </div>
                                </div>
                                )}
							</div>

							<div className="flex justify-between items-center pt-2">
								<button
									onClick={() => {
                                      if (isRecording) {
                                        recognition.stop();
                                      } else {
                                        startRecording();
                                      }
                                    }}
                                    disabled={isTerminated}
									className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${
										isRecording
											? "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 animate-pulse"
											: "bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-slate-50"
									} ${isTerminated ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									<FaMicrophone
										className={`w-5 h-5 ${
											isRecording
												? "text-white"
												: "text-slate-400 group-hover:text-primary"
										}`}
									/>
									<span>
										{isRecording
											? "Stop Recording"
											: "Record Answer"}
									</span>
								</button>

								<button
									onClick={submitAnswer}
									disabled={!answer.trim() || isTerminated}
									className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/30 text-white rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
								>
									<span>
										{currentQuestionIndex >=
										questions.length - 1
											? "Finish Interview"
											: "Next Question"}
									</span>
									<FaArrowRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
