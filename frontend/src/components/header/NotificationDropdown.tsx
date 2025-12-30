import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  CheckCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsByUserIdQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetNotificationStatsQuery,
  Notification,
} from "../../redux/services/notificationApi";
import { CATEGORY_MAP } from "../../pages/notification/Notifications";

export const getNotificationIcon = (type: Notification["type"]) => {
  switch (true) {
    // ISSUE notifications
    case CATEGORY_MAP.ISSUE.includes(type):
      switch (type) {
        case "ISSUE_CREATED":
        case "ISSUE_ASSIGNED":
          return <Bell className="h-5 w-5 text-blue-500" />;
        case "ISSUE_RESOLVED":
        case "ISSUE_CONFIRMED":
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case "ISSUE_REJECTED":
        case "ISSUE_REOPENED":
        case "ISSUE_ESCALATED":
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case "ISSUE_COMMENTED":
          return <MessageSquare className="h-5 w-5 text-purple-500" />;
        default:
          return <Bell className="h-5 w-5 text-gray-500" />;
      }

    // USER notifications
    case CATEGORY_MAP.USER.includes(type as any):
      return <User className="h-5 w-5 text-indigo-500" />;

    // SYSTEM notifications
    case CATEGORY_MAP.SYSTEM.includes(type as any):
      return <Shield className="h-5 w-5 text-gray-700" />;

    // fallback
    default:
      return <Bell className="h-5 w-5 text-gray-400" />;
  }
};

const formatTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Recently";
  }
};

const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.substring(0, maxLength) + "...";

// Notification item component
const NotificationItem = ({
  notification,
  onClick,
  onXClick,
}: {
  notification: Notification;
  onClick: (n: Notification) => void;
  onXClick: (n: Notification) => void;
}) => {
  return (
    <DropdownItem
      onClick={(e) => {
        e.stopPropagation(); // Prevent Dropdown from closing
        onClick(notification); // still mark as read / handle click
      }}
      className={`flex relative group border bg-blue-50 gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {getNotificationIcon(notification.type)}
        {!notification.is_read && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full dark:border-gray-900"></span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-800 truncate dark:text-white/90">
            {notification.title}
          </span>
          <X
            onClick={(e) => {
              e.stopPropagation();
              onXClick(notification);
            }}
            className="hidden group-hover:flex hover:cursor-pointer hover:text-red-500 text-[#073954] w-5 h-5 absolute top-2 right-2"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {truncateText(notification.message, 40)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(notification.created_at)}</span>
        </div>
      </div>
    </DropdownItem>
  );
};

export default function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.user_id;
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    []
  );

  const { data: notificationsResponse, refetch } =
    useGetNotificationsByUserIdQuery(
      { userId: userId!, params: { is_read: "false" } },
      { skip: !userId, refetchOnMountOrArgChange: true }
    );

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  // Sync notifications to local state
  useEffect(() => {
    if (notificationsResponse?.data) {
      setLocalNotifications(notificationsResponse.data);
    }
  }, [notificationsResponse]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Optimistic mark as read
  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markAsRead({
        notification_id: notification.notification_id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
    closeDropdown();
    // Optional: navigation logic
  };

  const handleMarkAllAsRead = async () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error(err);
    }
  };
  // mark a single notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await markAsRead({
        notification_id: notification.notification_id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = useMemo(
    () => localNotifications.length,
    [localNotifications]
  );

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-semibold text-white bg-orange-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-[400px]   bg-white border rounded-2xl shadow-lg p-3 flex flex-col dark:bg-gray-900 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <ul className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {localNotifications.length !== 0 &&
            localNotifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onClick={handleNotificationClick}
                onXClick={handleMarkAsRead}
              />
            ))}
        </ul>

        {/* close the dropdown and navigate to the notifications page */}
        <DropdownItem
          onClick={() => {
            closeDropdown();
            navigate("/notifications");
          }}
          className="mt-3 w-full text-center text-sm text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 flex justify-center"
        >
          View All Notifications
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
