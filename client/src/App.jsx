import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* This will render the current page */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
