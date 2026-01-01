

import express from "express";
import Interview from "../models/InterviewModel.js";
import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import pdfParse from "pdf-parse";
import {
	summarizeResumeText,
	generateQuestions,
	analyzeAnswer,
	interviewSummary,
	buildInterviewInsights,
} from "../services/aiService.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Simple health check to verify this router is mounted
router.get("/health", (req, res) => {
	res.json({ ok: true, route: "/api/interview" });
});

router.post(
	"/setup",
	firebaseAuthMiddleware,
	upload.single("resume"),
	async (req, res) => {
		try {
			if (!req.body || !req.body.interviewName) {
				return res
					.status(400)
					.json({ error: "Incomplete form submission" });
			}
			const {
				interviewName,
				numOfQuestions,
				interviewType,
				role,
				experienceLevel,
				companyName,
				companyDescription,
				jobDescription,
				focusAt,
			} = req.body;
			const firebaseUID = req.firebaseUser?.uid;
			const user = await User.findOne({ firebase_user_id: firebaseUID });
			if (!user) return res.status(404).json({ error: "User not found" });

			let resume_link = null;
			let resume_text = null;
			if (req.file && req.file.buffer) {
				const streamUpload = () =>
					new Promise((resolve, reject) => {
						const stream = cloudinary.uploader.upload_stream(
							{
								resource_type: "raw",
								folder: "prepEdge/resumes",
							},
							(error, result) => {
								if (error) return reject(error);
								resolve(result);
							}
						);
						streamifier
							.createReadStream(req.file.buffer)
							.pipe(stream);
					});

				try {
					const result = await streamUpload();
					resume_link = result.secure_url;
				} catch (uploadErr) {
					return res
						.status(500)
						.json({ error: "Cloudinary upload failed" });
				}
				const pdfData = await pdfParse(req.file.buffer);
				resume_text = pdfData.text.slice(0, 4000);
			}

			let resumeSummary = null;
			if (resume_text) {
				try {
					resumeSummary = await summarizeResumeText(resume_text);
				} catch (err) {
					return res
						.status(500)
						.json({ error: "Resume summarization failed" });
				}
			}

			let questions;
			try {
				questions = await generateQuestions({
					num_of_questions: Number(numOfQuestions) || 3,
					interview_type: (interviewType || "mixed").toLowerCase(),
					role: role || "Software Engineer",
					experience_level: (experienceLevel || "Fresher").toLowerCase(),
					company_name: companyName || "",
					company_description: companyDescription || "",
					job_description: jobDescription || "",
					focus_area: focusAt || "",
				});
			} catch (err) {
				console.error("Question generation failed:", err?.message || err);
				return res.status(500).json({ error: "Failed to generate questions" });
			}

			if (!questions || questions.length === 0) {
				return res
					.status(400)
					.json({ error: "Failed to generate questions" });
			}

			const interview = new Interview({
				user_id: user._id,
				interview_name: interviewName,
				num_of_questions: Number(numOfQuestions) || 3,
				interview_type: (interviewType || "mixed").toLowerCase(),
				role: role || "Software Engineer",
				experience_level: (experienceLevel || "fresher").toLowerCase(),
				company_name: companyName || "",
				company_description: companyDescription || "",
				job_description: jobDescription || "",
				resume_link,
				focus_area: focusAt || "",
				questions,
			});
			await interview.save();

			res.status(201).json({
				message: "Interview setup successfully",
				interview,
			});
		} catch (err) {
			res.status(500).json({ error: "Failed to set up interview" });
		}
	}
);

router.get("/:interviewId", async (req, res) => {
	try {
		const interview = await Interview.findById(req.params.interviewId);
		if (!interview) return res.status(404).json({ error: "Interview not found" });
		res.json(interview);
	} catch (err) {
		console.error("Error fetching interview:", err);
		res.status(500).json({ error: "Failed to fetch interview" });
	}
});

router.post("/:interviewId/answer", async (req, res) => {
	const { questionId, answer } = req.body;
	const interview = await Interview.findById(req.params.interviewId);
	const question = interview.questions[questionId];

	// Analyze user's answer using AI
	const { score, feedback } = await analyzeAnswer({
		question: question.question,
		userAnswer: answer,
		preferredAnswer: question.preferred_answer,
		role: interview.role,
		experience_level: interview.experience_level,
		interview_type: interview.interview_type,
	});

	// create or update the report
	let report = await Report.findOne({ interviewId: req.params.interviewId });
	if (!report) {
		report = new Report({
			interviewId: req.params.interviewId,
			userId: interview.user_id,
			answers: [],
		});
	}

	// Add the answers' analysis to the report
	report.answers.push({
		question: question.question,
		userAnswer: answer,
		preferredAnswer: question.preferred_answer,
		score,
		feedback,
	});

	// if all answers are analyzed, calculate final score and summary
	const totalQuestions = interview.num_of_questions;
	const totalAnswered = report.answers.length;
	if (totalAnswered === totalQuestions) {
		const totalScore = report.answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
		const averageScore = Math.round((totalScore / report.answers.length) * 10) / 10;

		let summaryOutput = "";
		let strengthsOutput = "";
		let areasOutput = "";

		try {
			const summaryText = await interviewSummary(report.answers);

			const extractSection = (label) => {
				const match = summaryText?.match(
					new RegExp(
						`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`,
						"i"
					)
				);
				return match ? match[1].trim() : "";
			};

			summaryOutput = extractSection("Overall Summary") || `Overall performance: ${averageScore}/100. Review your answers to identify areas for improvement.`;
			strengthsOutput = extractSection("Strengths") || "- Complete the interview to see your strengths.";
			areasOutput = extractSection("Areas of Improvement") || "- Complete the interview to see improvement areas.";
		} catch (err) {
			console.error("Interview summary parsing failed:", err?.message || err);
			const insights = buildInterviewInsights(report.answers);
			summaryOutput = insights.summary;
			strengthsOutput = insights.strengths;
			areasOutput = insights.areas;
		}

		report.finalScore = averageScore;
		report.summary = summaryOutput;
		report.strengths = strengthsOutput;
		report.areaOfImprovement = areasOutput;
	}

	await report.save();
	res.status(201).json({ success: true });
});

router.get("/", firebaseAuthMiddleware, async (req, res) => {
	const decodedToken = req.firebaseUser;
	if (!decodedToken || !decodedToken.uid) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	const user = await User.findOne({
		firebase_user_id: decodedToken.uid,
	});
	if (!user) {
		// No user profile yet; return empty list instead of throwing on user._id
		return res.json([]);
	}
	const interviews = await Interview.find({ user_id: user._id });
	res.json(interviews);
});

export default router;


