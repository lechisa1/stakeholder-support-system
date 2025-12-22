import React from "react";

interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onClick?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  buttonText = "View",
  onClick,
}) => {
  return (
    <div className="flex gap-5 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-b from-[#F9FBFC] to-[#EFF6FB] rounded-[35px] justify-between items-center p-4 bg-white  border border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-full ">
      <div className="flex items-center gap-5">
        {icon && <div className="text-blue-600 dark:text-blue-400 ">{icon}</div>}
        <div className="flex-1 ">
          <h3 className="text-lg font-semibold mb-1 text-black dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-[#094C81] dark:text-[#094C81]">
            {description}
          </p>
        </div>
      </div>
      {onClick && (
        <div className="flex justify-center h-fit items-center">
          <button
            onClick={onClick}
            className="px-5 py-1.5 bg-[#094C81] text-white text-sm font-medium rounded-lg hover:bg-[#07365c] transition"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default InfoCard;
