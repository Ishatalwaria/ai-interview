import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebase_user_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar_url: {
        type: String,
        default: null
    },
    tier: {
        type: String,
        enum: ['basic', 'pro', 'ultimate'],
        default: 'basic',
        required: true
    },
    address: {
        type: String,
        default: ""
    },
    profile_links: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" }
    },
    resume_link: {
        type: String,
        default: null,
    },
    resume_updated_at: {
        type: Date,
    },
    resume_summary: {
        type: String,
        default: null,
    },
    profile_details: {
        education: { type: String, default: "" },
        projects: { type: String, default: "" },
        projects_links: { type: String, default: "" },
        experience: { type: String, default: "" },
        experience_company: { type: String, default: "" },
        last_company: { type: String, default: "" },
        skills: { type: String, default: "" },
        skills_expertise: { type: String, default: "" },
        achievements: { type: String, default: "" },
        achievements_links: { type: String, default: "" },
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

const User = mongoose.model('User', userSchema);
export default User;