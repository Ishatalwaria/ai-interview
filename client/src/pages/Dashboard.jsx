import { useState, useEffect } from "react";
import axios from "axios";
import ScoreTrendChart from "../components/ScoreTrendChart";
import SummaryCard from "../components/SummaryCard";
import InterviewList from "../components/InterviewList";
import { useAuth } from "../context/AuthContext";
import { FaChartLine, FaHistory, FaTrophy } from "react-icons/fa";

export default function Dashboard() {
	const [interviews, setInterviews] = useState([]);
	const [summaryData, setSummaryData] = useState([]);
	const [chartData, setChartData] = useState([]);
	const { user } = useAuth();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = await user.getIdToken();
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/interview`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setInterviews(Array.isArray(response.data) ? response.data : response.data?.data || []);


				const reportResponse = await axios.get(
					`${import.meta.env.VITE_API_URL}/api/report`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const reports = Array.isArray(reportResponse.data)
  ? reportResponse.data
  : reportResponse.data?.data || [];

const chartData = reports.map((report) => ({
  date: new Date(report.createdAt).toLocaleDateString(),
  score: Number(report.finalScore) || 0,
  interviewName: report.interviewId?.interview_name || "N/A",
}));
setChartData(chartData);

				const bestScore = Math.max(
					...reports.map((i) => i.finalScore || 0)
				);

				const totalInterviews = response.data.length;
				const roleCounts = response.data
					.map((i) => i.role)
					.reduce((acc, role) => {
						acc[role] = (acc[role] || 0) + 1;
						return acc;
					}, {});
				const mostCommonRole =
					Object.entries(roleCounts).sort(
						(a, b) => b[1] - a[1]
					)[0]?.[0] || "N/A";

				setSummaryData([
					{ title: "Total Interviews", value: totalInterviews, icon: <FaHistory /> },
					{ title: "Best Score", value: bestScore.toFixed(2), icon: <FaTrophy /> },
					{ title: "Most Common Role", value: mostCommonRole, icon: <FaChartLine /> },
				]);
			} catch (error) {
				console.error("Failed to fetch interviews:", error);
			}
		};

		fetchData();
	}, [user]);

	return (
		<div className="min-h-screen relative bg-slate-50">
            {/* Background enhancement */}
             <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
				<div className="mb-10">
					<h1 className="text-3xl font-bold text-slate-900">
						Dashboard
					</h1>
                    <p className="text-slate-500 mt-1">Track your progress and performance.</p>
				</div>

                {/* Summary Cards */}
				<div className="mb-10">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{summaryData.map((item, index) => (
							<div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all duration-300">
                                <div>
                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">{item.title}</p>
                                    <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
							</div>
						))}
					</div>
				</div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Left Column: Chart */}
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h2>
                            <ScoreTrendChart chartData={chartData} />
                        </div>
                     </div>
                     
                     {/* Right Column: Recent Activity */}
                     <div className="space-y-8 text-black">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Recent Interviews</h2>
                                <button className="text-sm text-primary font-medium hover:text-primary-hover">View All</button>
                            </div>
                            <InterviewList interviews={interviews} itemsPerPage={3} />
                        </div>
                     </div>
                </div>
			</main>
		</div>
	);
}
