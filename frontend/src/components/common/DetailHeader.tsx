import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "lucide-react";

interface Crumb {
  title?: string;
  link?: string; // if no link = not clickable
  className?: string;
}

const DetailHeader = ({ breadcrumbs = [], className = "" }: { breadcrumbs: Crumb[], className?: string }) => {
  const navigate = useNavigate();

  return (
    <div className={className}>
      {/* Breadcrumb Section */}
      {/* <div className="flex items-center gap-2 text-sm text-gray-600 mb-5">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center ">
            {crumb.link ? (
              <Link
                to={crumb.link}
                className="text-[#094C81]  hover:font-medium hover:text-[#073954]"
              >
                {crumb.title}
              </Link>
            ) : (
              <span className="font-medium text-gray-800">{crumb.title}</span>
            )}

            <span>
              <ChevronRightIcon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div> */}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex  hover:bg-slate-300 hover:text-[#073954]
    transition-colors bg-slate-200 px-5 py-1 rounded-md items-center gap-2 text-[#094C81]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back</span>
      </button>
    </div>
  );
};

export default DetailHeader;
