import { Link, useNavigate, useParams } from "react-router-dom";
import Logo from "../../assets/logo-aii.png";
import LooperBg from "../../assets/Looper-bg.svg";
import { useGetIssueByTicketNumberQuery } from "../../redux/services/issueApi";
import { FaCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TrackPageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: issue, isLoading, isError } = useGetIssueByTicketNumberQuery(id!);
  const navigate = useNavigate();
  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg font-medium">Loading, please wait...</p>
        </div>
      </div>
    );
  
  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="    p-10 max-w-md w-full text-center">
          <div className="flex flex-col items-center gap-4">
            <FaExclamationTriangle className="text-red-600 text-6xl" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Ticket Number Not Found
            </h2>
            <p className="text-gray-600">
              We could not find a support request with Ticket Number{" "}
              <span className="font-medium text-gray-800">{id}</span>.
            </p>
            <p className="text-gray-500">
              Please verify the ticket number and try again.
            </p>
            <button
              onClick={() => navigate("/track_request")}
              className="mt-6 w-full px-6 py-3 bg-[#0C4A6E] text-white font-medium rounded-md shadow hover:bg-[#083b56] transition"
            >
              Back to Track Request
            </button>
          </div>
        </div>
      </div>
    );
  
  
  const timelineItems = [
    { label: "Created", date: issue?.created_at, icon: <FaCircle className="text-[#1E516A]" /> },
    issue.history.find(h => h.action === "accepted") && {
      label: "Accepted",
      date: issue.history.find(h => h.action === "accepted")?.created_at,
      icon: <FaCheckCircle className="text-green-500" />,
    },
    issue.resolved_at && {
      label: "Resolved",
      date: issue.resolved_at,
      icon: <FaCheckCircle className="text-blue-500" />,
    },
    issue.history.find(h => h.action === "closed") && {
      label: "Closed",
      date: issue.history.find(h => h.action === "closed")?.created_at,
      icon: <FaTimesCircle className="text-red-500" />,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F5F8FA] to-white relative overflow-hidden font-sans">

      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">

        <img src={LooperBg} alt="Background" className="w-full h-full object-cover opacity-20" />
      </div>

      <div className="fixed inset-0 mt-16 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.06 }}>
        <img src={Logo} alt="Organization Logo" className="w-[700px] h-[700px] object-contain" />
      </div>

      {/* Navigation */}
      <header className="w-full z-20 bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200 fixed top-0 left-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-10 h-10" />
            <h1 className="text-xl font-semibold text-[#1E516A]">Support Request Management System</h1>
          </Link>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/login" className="min-w-24 py-2 px-4 text-white bg-[#0C4A6E] rounded-md shadow hover:bg-[#083b56] text-center transition">Login</Link>
            <Link to="/track_request" className="min-w-36 py-2 px-4 border border-[#0C4A6E] bg-white text-[#0C4A6E] rounded-md shadow hover:bg-slate-100 transition">Track Request</Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex justify-center items-start min-h-screen pt-40 pb-20 px-4 z-10 relative">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-gray-200 p-10 animate-[fadeIn_0.5s_ease]">

          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 border-b border-gray-200 pb-6">
            <div>
              <p className="text-gray-500 font-medium">Project</p>
              <p className="text-[#1E516A] font-semibold">{issue.project?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Category</p>
              <p className="text-[#1E516A] font-semibold">{issue.category?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Priority</p>
              <p className="text-[#1E516A] font-semibold" style={{ color: issue.priority?.color_value }}>
                {issue.priority?.name}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Occurred At</p>
              <p className="text-[#1E516A] font-semibold">{formatDateTime(issue.issue_occured_time)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Description</p>
              <p className="text-gray-700 mt-1">{issue.description || "No description provided."}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6">
            <p className="text-xl font-semibold text-[#1E516A] mb-6">Timeline</p>
            <div className="flex items-center justify-between">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center relative">
                  {idx !== timelineItems.length - 1 && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-gray-300 z-0"></div>
                  )}
                  <div className="z-10">{item.icon}</div>
                  <p className="mt-2 font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatDateTime(item.date)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="mt-14">
            <p className="text-xl font-semibold text-[#1E516A] mb-6">History</p>
            <div className="space-y-4">
              {issue.history.map((item) => (
                <div key={item.history_id} className="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition">
                  <p className="font-semibold text-gray-900 capitalize">{item.action}</p>
                  <p className="text-gray-700 text-sm mt-1">{item.notes}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDateTime(item.created_at)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TrackPageDetail;
