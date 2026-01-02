import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import NotificationDropdown from "../../components/header/NotificationDropdown";
import UserDropdown from "../../components/header/UserDropdown";
import { Globe } from "lucide-react";
import HeaderBreadcrumb from "../../components/common/HeaderBreadcrumb";

const InternalAppHeader = () => {
    const [langOpen, setLangOpen] = useState(false);
  const { i18n } = useTranslation();



  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };
  
  return (
    <header className="sticky top-0 mx-auto  bg-white border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Breadcrumb - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex flex-1 min-w-0 ml-4">
            <HeaderBreadcrumb />
          </div>
          
          <Link to="/" className="flex items-center  ">
            <img className="w-30" src="/logo.jpeg" alt="Logo" />
            <div className="flex -ml-5 flex-col">
              {/* <h1 className="text-4xl font-semibold text-[#094C81]">EAII</h1> */}
              <h1 className="text-lg text-[#094C81] font-semibold">Ethiopian Artificial Intelligence Institute</h1>
            </div>
          </Link>
        </div>

        <div className="items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-300 hover:bg-gray-100 transition-all duration-200"
            >
              <span
                className={`transition-transform duration-300 ${
                  langOpen ? "rotate-90" : ""
                }`}
              >
                <Globe className="w-5 h-5 text-[#094C81]" />
              </span>
              {i18n.language.toUpperCase()}
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white shadow-xl rounded-xl border border-gray-200 py-2 z-20 animate-fadeScale">
                <button
                  onClick={() => changeLanguage("en")}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("am")}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <ThemeToggleButton /> */}
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default InternalAppHeader;
