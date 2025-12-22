import { Link } from "react-router-dom";
import Logo from "../../assets/logo-aii.png";
import LooperBg from "../../assets/Looper-bg.svg";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F5F8FA] to-white relative overflow-hidden font-sans">
      {/* Looper Background (like Next.js) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <img
          src={LooperBg}
          alt="Looper Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Watermark Logo */}
      <div
        className="fixed inset-0 mt-16 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: 0.06 }}
      >
        <img
          src={Logo}
          alt="Organization Logo"
          className="w-[700px] h-[700px] object-contain"
        />
      </div>

      {/* Navigation */}
      <header className="w-full z-20 bg-white/70 backdrop-blur-md shadow-md border-gray-200 fixed top-0 left-0">
        <div className="px-20 w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 ">
            <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-semibold text-[#1E516A] tracking-wide">
              Support Request Management System
            </h1>
          </div>

          <div className="flex  items-center gap-6 text-gray-700 font-medium">
            <Link
              to="/login"
              className="w-full min-w-24 py-2 text-center px-2 border border-transparent rounded-md shadow-sm text-base font-semibold text-white 
               bg-[#0C4A6E] hover:bg-[#083b56] focus:outline-none focus:ring-2 focus:ring-offset-2 
               focus:ring-[#0C4A6E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </Link>
            <Link
              to="/track_request"
              className="w-full min-w-36 py-2 text-center px-4 rounded-md shadow-sm text-base font-semibold 
      border border-[#0C4A6E] text-[#0C4A6E] bg-white
      hover:bg-slate-100  transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C4A6E]"
            >
              Track Request
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex justify-center items-center min-h-screen z-10 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 leading-tight">
            <span className="block text-[#1E516A] mt-2">
              Support Request and Maintenance System
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-5xl text-[#073954] mx-auto mt-6 leading-relaxed">
            Manage support requests and maintenance requests seamlessly with a
            platform designed for clarity, accountability, and organizational
            productivity. It helps you to track your support requests and
            maintenance requests.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
         
            <Link
              to="/track_request"
              className="px-10 py-4 bg-[#0C4A6E] text-white font-semibold rounded-xl border border-[#1E516A] shadow-sm hover:bg-[#083b56] transition-all duration-200 text-lg tracking-wide"
            >
              Track Your Support Requests
            </Link>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default LandingPage;
