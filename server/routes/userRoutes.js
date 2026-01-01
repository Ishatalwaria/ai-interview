import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import pdfParse from "pdf-parse";

import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import admin from "firebase-admin";
import User from "../models/UserModel.js";
import cloudinary from "../utils/cloudinary.js";
import { summarizeResumeText } from "../services/aiService.js";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
});

const mapUserResponse = (user) => {
    const rawLinks = user.profile_links?.toObject
        ? user.profile_links.toObject()
        : user.profile_links || {};
    const rawDetails = user.profile_details?.toObject
        ? user.profile_details.toObject()
        : user.profile_details || {};

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        address: user.address,
        avatar_url: user.avatar_url || null,
        profile_links: {
            linkedin: rawLinks.linkedin || "",
            github: rawLinks.github || "",
            portfolio: rawLinks.portfolio || "",
        },
        resume_link: user.resume_link,
        resume_updated_at: user.resume_updated_at,
        resume_summary: user.resume_summary,
        profile_details: {
            education: rawDetails.education || "",
            projects: rawDetails.projects || "",
            projects_links: rawDetails.projects_links || "",
            experience: rawDetails.experience || "",
            experience_company: rawDetails.experience_company || "",
            last_company: rawDetails.last_company || "",
            skills: rawDetails.skills || "",
            skills_expertise: rawDetails.skills_expertise || "",
            achievements: rawDetails.achievements || "",
            achievements_links: rawDetails.achievements_links || "",
        },
        created_at: user.created_at,
    };
};

const sanitizeLink = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const extractProfileDetails = (summaryText = "") => {
    const getSection = (label) => {
        const regex = new RegExp(`-\s*${label}\s*:\s*([\s\S]*?)(?=\n-\s*[A-Z]|$)`, "i");
        const match = summaryText.match(regex);
        return match ? match[1].trim() : "";
    };
    return {
        education: getSection("Education"),
        projects: getSection("Projects"),
        experience: getSection("Experience"),
        skills: getSection("Skills"),
        achievements: getSection("Achievements"),
    };
};

router.get("/me", firebaseAuthMiddleware, async (req, res) => {
	try {
		const firebaseUID = req.firebaseUser?.uid;
		if (!firebaseUID) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const user = await User.findOne({ firebase_user_id: firebaseUID });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(mapUserResponse(user));
	} catch (err) {
		console.error("Failed to fetch profile:", err);
		res.status(500).json({ error: "Failed to load profile" });
	}
});

router.put("/me", firebaseAuthMiddleware, upload.fields([{ name: "avatar", maxCount: 1 }]), async (req, res) => {
	try {
		const firebaseUID = req.firebaseUser?.uid;
		if (!firebaseUID) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		let user = await User.findOne({ firebase_user_id: firebaseUID });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

        const updates = {};
		if (req.body?.name) {
			updates.name = req.body.name;
		}

        if (typeof req.body?.address === "string") {
            updates.address = req.body.address.trim();
        }

        const linkFields = ["linkedin", "github", "portfolio"];
        const currentLinksRaw = user.profile_links?.toObject
            ? user.profile_links.toObject()
            : user.profile_links || {};
        const linksUpdate = { ...currentLinksRaw };
        let linksChanged = false;
        linkFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                const sanitized = sanitizeLink(req.body[field]);
                linksUpdate[field] = sanitized;
                linksChanged = true;
            }
        });
        if (linksChanged) {
            updates.profile_links = linksUpdate;
        }

        // Profile details directly from user text input
        const pd = updates.profile_details || {};
        const detailFields = [
            "education",
            "projects",
            "projects_links",
            "experience",
            "experience_company",
            "last_company",
            "skills",
            "skills_expertise",
            "achievements",
            "achievements_links",
        ];
        let detailsChanged = false;
        detailFields.forEach((f) => {
            if (Object.prototype.hasOwnProperty.call(req.body, f)) {
                pd[f] = (req.body[f] || "").toString();
                detailsChanged = true;
            }
        });
        if (detailsChanged) {
            updates.profile_details = {
                education: pd.education || "",
                projects: pd.projects || "",
                experience: pd.experience || "",
                skills: pd.skills || "",
                achievements: pd.achievements || "",
            };
        }

        // Avatar upload
        const avatarFile = req.files && Array.isArray(req.files.avatar) ? req.files.avatar[0] : undefined;
        if (avatarFile && avatarFile.buffer) {
            const uploadAvatar = () =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "image",
                            folder: "prepEdge/avatars",
                            format: "jpg",
                            transformation: [{ width: 512, height: 512, crop: "fill", gravity: "faces" }],
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    streamifier.createReadStream(avatarFile.buffer).pipe(stream);
                });
            try {
                const result = await uploadAvatar();
                updates.avatar_url = result.secure_url;
            } catch (e) {
                console.error("Avatar upload failed:", e);
            }
        }

		if (Object.keys(updates).length === 0) {
			return res.json(mapUserResponse(user));
		}

        user = await User.findOneAndUpdate(
			{ firebase_user_id: firebaseUID },
			{ $set: updates },
			{ new: true }
		);

		res.json(mapUserResponse(user));
	} catch (err) {
		console.error("Failed to update profile:", err);
		res.status(500).json({ error: "Failed to update profile" });
	}
});

// Allow viewing resume inline via iframe using either Authorization header or token query param
import https from "https";

router.get("/me/resume", async (req, res) => {
    try {
        let decoded;
        const authHeader = req.headers.authorization;
        const queryToken = req.query.token;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            decoded = await admin.auth().verifyIdToken(token);
        } else if (typeof queryToken === "string" && queryToken.length > 0) {
            decoded = await admin.auth().verifyIdToken(queryToken);
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findOne({ firebase_user_id: decoded.uid });
        if (!user || !user.resume_link) {
            return res.status(404).json({ error: "Resume not found" });
        }

        const resumeUrl = user.resume_link;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=resume.pdf");
        res.setHeader("Cache-Control", "private, max-age=3600");

        https.get(resumeUrl, (proxied) => {
            if (proxied.statusCode && proxied.statusCode >= 400) {
                res.status(502);
            }
            proxied.on("error", () => {
                try { res.end(); } catch {}
            });
            proxied.pipe(res);
        }).on("error", (e) => {
            console.error("HTTPS fetch error:", e);
            res.status(502).json({ error: "Failed to fetch resume" });
        });
    } catch (err) {
        console.error("Failed to proxy resume:", err);
        res.status(500).json({ error: "Failed to load resume" });
    }
});

router.get("/me/summary", firebaseAuthMiddleware, async (req, res) => {
    try {
        const firebaseUID = req.firebaseUser?.uid;
        const user = await User.findOne({ firebase_user_id: firebaseUID });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({
            resume_summary: user.resume_summary || "",
            profile_details: user.profile_details || {
                education: "",
                projects: "",
                experience: "",
                skills: "",
                achievements: "",
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to load summary" });
    }
});

export default router;

