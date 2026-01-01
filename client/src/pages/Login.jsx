import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaGoogle, FaEyeSlash, FaEye, FaLock } from "react-icons/fa";
import Toast from "../components/Toast";
import {useAuth} from "../context/AuthContext"
import {
	auth,
	googleProvider,
	signInWithPopup,
	signInWithEmailAndPassword,
} from "../firebase";
import { GithubAuthProvider } from "firebase/auth";
import axios from "axios";

export default function Login() {
	const githubProvider = new GithubAuthProvider();
	const {	user, setUser } = useAuth();

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

	const navigate = useNavigate();

	const validateEmail = (value) => {
		if (value.trim() === "") return "empty";
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) ? "valid" : "invalid";
	};

	const validatePassword = (value) => {
		if (value === "") return "empty";
		return "valid";
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

	const handleEmailLogin = async () => {
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		setValidation({
			email: emailValidation,
			password: passwordValidation,
		});

		if (emailValidation !== "valid" || passwordValidation !== "valid") {
			showToast("Please fill in all fields correctly", "error");
			return;
		}

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const idToken = await userCredential.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/login`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			setUser(userCredential.user);
			console.log("User logged in:", user);
			showToast("Logged in successfully!", "success");
			setTimeout(() => {
				navigate("/");
			}, 500);
		} catch (err) {
			console.error("Firebase login error:", err.code, err.message);
            showToast(err.code || err.message || "An error occurred during login", "error");
		}
	};

	const handleGoogleLogin = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const idToken = await result.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/login`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				}
			);

			setUser(result.user);
			console.log("User logged in:", user);
			showToast("Logged in successfully!", "success");
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (err) {
			showToast(
				err.message || "An error occurred during Google login",
				"error"
			);
		}
	};

	//for github login
	const handleGithubLogin = async () => {
		try {
			const result = await signInWithPopup(auth, githubProvider);
			const credential = GithubAuthProvider.credentialFromResult(result);
			const token = credential.accessToken;

			const idToken = await result.user.getIdToken();
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/login`,
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
		} catch (err) {
			const msg =
			err?.code === "auth/account-exists-with-different-credential" 
				? "An account already exists with the same email using a different sign-in method. Please log in with that provider." 
				: (err?.message || "An error occurred during GitHub login");
			showToast(msg, "error");
		}
	};

	return (
		<div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

            <div className="w-full max-w-md">
                <div className="glass p-8 rounded-2xl border border-white/60 shadow-xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                            <FaLock size={20} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Login to access your personalized interview prep.
                        </p>
                    </div>

                    <form
                        className="space-y-5"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                                <p className="mt-1.5 text-xs text-red-500 font-medium">
                                    Please enter a valid email address
                                </p>
                            )}
                            {validation.email === "empty" && (
                                <p className="mt-1.5 text-xs text-orange-500 font-medium">
                                    Email is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                                <p className="mt-1.5 text-xs text-red-500 font-medium">
                                    Password must be at least 6 characters
                                    long
                                </p>
                            )}
                            {validation.password === "empty" && (
                                <p className="mt-1.5 text-xs text-orange-500 font-medium">
                                    Password is required
                                </p>
                            )}
                            <div className="text-right mt-2">
                                <Link
                                    to="#"
                                    className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleEmailLogin}
                            className="btn-primary w-full py-2.5 shadow-lg shadow-primary/25"
                        >
                            Sign In
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
                                onClick={handleGithubLogin}
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
                            {"Don't have an account? "}
                            <Link
                                to="/signup"
                                className="font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
		</div>
	);
}
