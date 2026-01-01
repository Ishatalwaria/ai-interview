import { useEffect, useState } from "react";
import axios from "axios";
import { FaLinkedin, FaGithub, FaGlobe, FaCamera } from "react-icons/fa";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value) => {
	if (!value) return "";
	return new Date(value).toLocaleString();
};

export default function Profile() {
	const { user } = useAuth();
	const [profile, setProfile] = useState(null);
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
    const [links, setLinks] = useState({ linkedin: "", github: "", portfolio: "" });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState({ show: false, message: "", type: "success" });

	const API_BASE = import.meta.env.VITE_API_URL;

	const showToast = (message, type = "success") => setToast({ show: true, message, type });
	const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

    const syncProfileState = (data) => {
		setProfile(data);
		setName(data?.name || "");
		setAddress(data?.address || "");
		setLinks({
			linkedin: data?.profile_links?.linkedin || "",
			github: data?.profile_links?.github || "",
			portfolio: data?.profile_links?.portfolio || "",
		});
        setAvatarPreview(data?.avatar_url || "");
	};

	const fetchProfile = async () => {
		if (!user) return;
		if (!API_BASE) {
			showToast("API not configured. Set VITE_API_URL.", "error");
			setLoading(false);
			return;
		}
		try {
			const token = await user.getIdToken();
			const res = await axios.get(`${API_BASE}/api/user/me`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			syncProfileState(res.data);
		} catch (err) {
			console.error("Failed to load profile", err);
			showToast("Unable to load profile", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("Only image files are supported for profile picture", "error");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

	const handleSave = async (e) => {
		e.preventDefault();
		if (!user) return;
		if (!API_BASE) {
			showToast("API not configured. Set VITE_API_URL.", "error");
			return;
		}
		setSaving(true);
		try {
			const token = await user.getIdToken();
			const formData = new FormData();
			formData.append("name", name);
			formData.append("address", address);
			formData.append("linkedin", links.linkedin);
			formData.append("github", links.github);
			formData.append("portfolio", links.portfolio);
			const details = profile?.profile_details || {};
			formData.append("education", details.education || "");
			formData.append("projects", details.projects || "");
			formData.append("projects_links", details.projects_links || "");
			formData.append("experience", details.experience || "");
			formData.append("experience_company", details.experience_company || "");
			formData.append("last_company", details.last_company || "");
			formData.append("skills", details.skills || "");
			formData.append("skills_expertise", details.skills_expertise || "");
			formData.append("achievements", details.achievements || "");
			formData.append("achievements_links", details.achievements_links || "");
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

			const res = await axios.put(`${API_BASE}/api/user/me`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

            syncProfileState(res.data);
            setAvatarFile(null);
			showToast("Profile updated", "success");
		} catch (err) {
			console.error("Failed to update profile", err);
			const message = err.response?.data?.error || "Failed to update profile";
			showToast(message, "error");
		} finally {
			setSaving(false);
		}
	};

	const updateDetailField = (field, value) => {
		setProfile((prev) => {
			const current = prev || {};
			return {
				...current,
				profile_details: {
					...(current.profile_details || {}),
					[field]: value,
				},
			};
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="loader text-primary">Loading profile...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-float"></div>
			{toast.show && (
				<Toast message={toast.message} type={toast.type} onClose={hideToast} />
			)}
			<div className="max-w-6xl mx-auto space-y-8 relative z-10">
				<section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
					<div className="px-8 py-10 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                                        <img
                                            src={avatarPreview || profile?.avatar_url || "/placeholder.svg"}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <label htmlFor="avatar-input" className="absolute -bottom-2 -right-2 bg-white text-primary p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                                        <FaCamera size={14} />
                                    </label>
                                    <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                                </div>
								<div>
									<p className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-1">
										My Profile
									</p>
									<h1 className="text-3xl font-bold text-slate-900">{profile?.name || "Your Name"}</h1>
									<p className="text-sm text-slate-500 mt-1">
										{profile?.address || "Add your location"}
									</p>
								</div>
							</div>
                            <div className="flex gap-8 text-sm text-slate-600">
								<div>
									<p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Status</p>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
								</div>
								<div>
									<p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Member Since</p>
									<p className="font-medium text-slate-900">{formatDateTime(profile?.created_at).split(',')[0]}</p>
								</div>
							</div>
						</div>
					</div>

					<form className="px-8 py-10 sm:px-12 space-y-10" onSubmit={handleSave}>
						<div className="grid lg:grid-cols-2 gap-12">
                            {/* Left Column */}
							<div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Info</h3>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
									<input
										type="text"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										placeholder="City, Country"
										className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
									/>
								</div>

                                <div className="pt-4">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4">Social Links</h4>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLinkedin className="text-blue-600" />
                                            </div>
                                            <input
                                                type="url"
                                                value={links.linkedin}
                                                onChange={(e) => setLinks((prev) => ({ ...prev, linkedin: e.target.value }))}
                                                placeholder="LinkedIn URL"
                                                className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaGithub className="text-slate-700" />
                                            </div>
                                            <input
                                                type="url"
                                                value={links.github}
                                                onChange={(e) => setLinks((prev) => ({ ...prev, github: e.target.value }))}
                                                placeholder="GitHub URL"
                                                className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                                            />
                                        </div>
                                         <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaGlobe className="text-green-500" />
                                            </div>
                                            <input
                                                type="url"
                                                value={links.portfolio}
                                                onChange={(e) => setLinks((prev) => ({ ...prev, portfolio: e.target.value }))}
                                                placeholder="Portfolio URL"
                                                className="w-full pl-10 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
							</div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Professional Details</h3>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Experience</label>
                                    <textarea value={profile?.profile_details?.experience || ""} onChange={(e) => updateDetailField("experience", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all resize-none" placeholder="Brief summary of your experience" />
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <input type="text" placeholder="Current Company" value={profile?.profile_details?.experience_company || ""} onChange={(e) => updateDetailField("experience_company", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all text-sm" />
                                        <input type="text" placeholder="Previous Company" value={profile?.profile_details?.last_company || ""} onChange={(e) => updateDetailField("last_company", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Projects</label>
                                    <textarea value={profile?.profile_details?.projects || ""} onChange={(e) => updateDetailField("projects", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all resize-none" placeholder="Key projects you've worked on" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
                                    <textarea value={profile?.profile_details?.skills || ""} onChange={(e) => updateDetailField("skills", e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all resize-none" placeholder="React, Node.js, Python..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Education</label>
                                    <textarea value={profile?.profile_details?.education || ""} onChange={(e) => updateDetailField("education", e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all resize-none" placeholder="University, Degree, Year" />
                                </div>
                            </div>
						</div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
							<button
								type="submit"
								disabled={saving}
								className="btn-primary px-8 py-3 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{saving ? "Saving Changes..." : "Save Profile"}
							</button>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
}

