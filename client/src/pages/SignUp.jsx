import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaGoogle, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import {
	auth,
	googleProvider,
	signInWithPopup,
	createUserWithEmailAndPassword,
	updateProfile,
} from "../firebase";
import { GithubAuthProvider } from "firebase/auth";
import axios from "axios";

export default function SignUp() {
	const githubProvider = new GithubAuthProvider();
	const { user, setUser } = useAuth();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [validation, setValidation] = useState({
		name: "untouched",
		email: "untouched",
		password: "untouched",
	});
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const [passwordStrength, setPasswordStrength] = useState("");

	const navigate = useNavigate();

	const validateName = (value) => {
		if (value.trim() === "") return "empty";
		if (value.trim().length < 2) return "invalid";
		return "valid";
	};

	const validateEmail = (value) => {
		if (value.trim() === "") return "empty";
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? "valid" : "invalid";
	};

	const validatePassword = (value) => {
		if (value === "") return "empty";
		if (value.length < 6) return "invalid";
		return "valid";
	};

	const calculatePasswordStrength = (value) => {
		let strength = "Weak";
		let strengthScore = 0;

		if (value.length >= 6) strengthScore++;
		if (/[A-Z]/.test(value)) strengthScore++;
		if (/[0-9]/.test(value)) strengthScore++;
		if (/[^A-Za-z0-9]/.test(value)) strengthScore++;

		if (strengthScore >= 4) strength = "Strong";
		else if (strengthScore >= 2) strength = "Medium";

		return strength;
	};

	const handleNameChange = (value) => {
		setName(value);
		setValidation((prev) => ({
			...prev,
			name: validateName(value),
		}));
	};

	const handleEmailChange = (value) => {
		setEmail(value);
		setValidation((prev) => ({
			...prev,
			email: validateEmail(value),
		}));
	};

	const handlePasswordChange = (value) => {
		setPassword(value);
		setValidation((prev) => ({
			...prev,
			password: validatePassword(value),
		}));
		setPasswordStrength(calculatePasswordStrength(value));
	};

	const getRingColor = (fieldValidation) => {
		switch (fieldValidation) {
			case "empty":
				return "focus:ring-orange-500/50 border-orange-500/50";
			case "invalid":
				return "focus:ring-red-500/50 border-red-500/50";
			case "valid":
				return "focus:ring-primary/50 border-primary/50";
			default:
				return "focus:ring-primary/50 border-slate-200 focus:border-primary/50";
		}
	};

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	const handleEmailSignUp = async () => {
		const nameValidation = validateName(name);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		setValidation({
			name: nameValidation,
			email: emailValidation,
			password: passwordValidation,
		});

		if (
			nameValidation !== "valid" ||
			emailValidation !== "valid" ||
			passwordValidation !== "valid"
		) {
			showToast("Please fill in all fields correctly", "error");
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			await updateProfile(userCredential.user, { displayName: name });

			const idToken = await userCredential.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/register`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			showToast("Account created successfully!", "success");
			setTimeout(() => {
				navigate("/login");
			}, 500);
		} catch (err) {
			showToast(
				err.message || "An error occurred during sign up",
				"error"
			);
		}
	};

	//for google
	const handleGoogleLogin = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const idToken = await result.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/register`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			setUser(result.user);
			console.log("User signed in:", result.user);

			showToast("Successfully signed in with Google!", "success");
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (err) {
            console.error("Google Signup Error:", err);
            let msg = err.message || "An error occurred during Google sign in";
            if (err.code === 'auth/popup-closed-by-user') msg = "Sign in cancelled by user";
            if (err.code === 'auth/popup-blocked') msg = "Sign in popup blocked. Please allow popups for this site.";
			showToast(msg, "error");
		}
	};

	//for Github
	const handleGithub = async () => {
		try {
			const result = await signInWithPopup(auth, githubProvider);
			const credential = GithubAuthProvider.credentialFromResult(result);
			const token = credential?.accessToken;

			const idToken = await result.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/register`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			setUser(result.user); // Set the authenticated user
			showToast("Successfully signed in with GitHub!", "success");

			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (error) {
			console.error("GitHub login failed:", error);
            let msg = error.message || "GitHub login failed";
             if (error.code === 'auth/account-exists-with-different-credential') msg = "An account already exists with the same email using a different sign-in method. Please log in with that provider.";
			showToast(msg, "error");
			// setTimeout(() => {
			// 	navigate("/");
			// }, 2000);
		}
	};

	return (
		<div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
             {/* Background Gradients */}
            <div className="absolute inset-0 bg-slate-50 -z-20"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

            <div className="w-full max-w-md">
                <div className="glass p-8 rounded-2xl border border-white/60 shadow-xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                            <FaUserPlus size={20} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Create Account
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Join PrepBuddy to start your interview journey.
                        </p>
                    </div>

                    <form
                        className="space-y-4"
                        onSubmit={handleEmailSignUp}
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="Full Name"
                                className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-4 focus:ring-opacity-20 ${getRingColor(
                                    validation.name
                                )}`}
                            />
                            {validation.name === "invalid" && (
                                <p className="mt-1 text-xs text-red-500 font-medium">
                                    Name must be at least 2 characters long
                                </p>
                            )}
                            {validation.name === "empty" && (
                                <p className="mt-1 text-xs text-orange-500 font-medium">
                                    Name is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    handleEmailChange(e.target.value)
                                }
                                placeholder="name@example.com"
                                className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-4 focus:ring-opacity-20 ${getRingColor(
                                    validation.email
                                )}`}
                            />
                            {validation.email === "invalid" && (
                                <p className="mt-1 text-xs text-red-500 font-medium">
                                    Please enter a valid email address
                                </p>
                            )}
                            {validation.email === "empty" && (
                                <p className="mt-1 text-xs text-orange-500 font-medium">
                                    Email is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={
                                        showPassword ? "text" : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        handlePasswordChange(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border bg-white/50 backdrop-blur-sm transition-all focus:outline-none focus:ring-4 focus:ring-opacity-20 ${getRingColor(
                                        validation.password
                                    )}`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash size={18} />
                                    ) : (
                                        <FaEye size={18} />
                                    )}
                                </button>
                            </div>
                            {validation.password === "invalid" && (
                                <p className="mt-1 text-xs text-red-500 font-medium">
                                    Password must be at least 6 characters
                                    long
                                </p>
                            )}
                            {validation.password === "empty" && (
                                <p className="mt-1 text-xs text-orange-500 font-medium">
                                    Password is required
                                </p>
                            )}
                            {password && validation.password !== "empty" && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-300 ${
                                                passwordStrength === "Weak" ? "w-1/3 bg-red-500" :
                                                passwordStrength === "Medium" ? "w-2/3 bg-yellow-500" : "w-full bg-green-500"
                                            }`}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                        passwordStrength === "Weak" ? "text-red-500" :
                                        passwordStrength === "Medium" ? "text-yellow-500" : "text-green-500"
                                    }`}>
                                        {passwordStrength}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            onClick={handleEmailSignUp}
                            className="btn-primary w-full py-2.5 shadow-lg shadow-primary/25 mt-2"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-white/50 backdrop-blur-xl text-slate-500 font-medium tracking-wider">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={handleGithub}
                                className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <FaGithub className="w-5 h-5 mr-2" />
                                Github
                            </button>
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
                                Google
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600">
                            {"Already have an account? "}
                            <Link
                                to="/login"
                                className="font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
		</div>
	);
}
