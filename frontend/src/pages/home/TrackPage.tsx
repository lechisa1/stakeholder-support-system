import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo-aii.png";
import LooperBg from "../../assets/Looper-bg.svg";
import { useState } from "react";
import { toast } from "sonner";

const TrackPage = () => {
  const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>()
  const [id, setId] = useState("");
  const handleTrackRequest = () => {
    if (id) {
      navigate(`/track_request/${id}`);
      setId("");
    }
    else {
      toast.error("Please enter a valid request ID");
      setId("");
    }
  };
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

      {/* Navigation */}
      <header className="w-full z-20 bg-white/70 backdrop-blur-md shadow-md border-gray-200 fixed top-0 left-0">
        <div className="px-20 w-full mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 ">
            <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-semibold text-[#1E516A] tracking-wide">
              Support Request Management System
            </h1>
          </Link>

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
      <main className="flex justify-center items-center min-h-screen z-10 relative px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* OUTER CIRCLE */}
        <div
          className="w-[860px] h-[860px] relative bg-white/80 backdrop-blur-md shadow-lg z-10
    rounded-full border border-gray-200 p-10 animate-fadeIn flex items-center justify-center"
        >
          {/* Background Logo inside circle */}
          <img
            src={Logo}
            alt="Organization Logo"
            className="absolute inset-0 m-auto w-[860px] h-[860px] opacity-40 object-contain pointer-events-none"
          />

          {/* INNER CIRCLE */}
          <div
            className="w-[645px] flex flex-col items-center justify-center h-[645px] relative bg-white backdrop-blur-md shadow-lg 
      rounded-full border border-gray-200 p-10 animate-fadeIn flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold text-center text-[#1E516A] mb-6">
              Track Your Support Request
            </h2>

            <p className="text-center text-gray-600 mb-8">
              Enter your Request ID to check the status of your support ticket.
            </p>

            {/* Input Field */}
            <div className="mb-6 flex justify-center w-full  max-w-xl items-center">
              <div className="flex flex-col items-center w-full">
                <label className="block text-sm font-medium text-[#1E516A] mb-2">
                  Request / Ticket ID
                </label>
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  type="text"
                  placeholder="Enter Request ID"
                  className="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 
          focus:outline-none focus:ring-2 focus:ring-[#0C4A6E] focus:border-[#0C4A6E] transition"
                />
              </div>
            </div>

            {/* Track Button */}
            <button
              onClick={handleTrackRequest}
              className="w-full max-w-sm py-3 bg-[#0C4A6E] text-white font-semibold rounded-lg shadow-md 
        hover:bg-[#083b56] transition-all duration-200 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-[#0C4A6E]"
            >
              Track Request
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              If you lost your Request ID, please contact support for
              assistance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackPage;
