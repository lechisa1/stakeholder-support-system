import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Avater from "../../assets/avater.jpg";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, User2Icon, UserRound } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user,  logout } = useAuth();
  const navigate = useNavigate();
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  if (!user) return  <UserRound className="h-8 w-8 text-[#094C81]" />;

  const userRole = user.roles?.[0]?.role?.name || "N/A";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span className="overflow-hidden rounded-full h-11 w-11 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
          {user.profile_image ? (
            <img
              src={user.profile_image }
              alt="User"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-8 w-8 text-[#094C81]" />
          )}
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-300/30 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30 transition-all"
      >
        {/* User Info */}
        <div className="flex flex-col px-3 gap-1 pb-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-gray-800 dark:text-gray-100 font-semibold text-sm">
            {user.full_name}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {user.email}
          </span>
        </div>

        {/* Dropdown Items */}
        <ul className="flex flex-col pt-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-4 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => {
                logout();
                closeDropdown();
                navigate("/login");
              }}
              tag="button"
              className="flex items-center gap-3 px-4 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Sign out
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}

