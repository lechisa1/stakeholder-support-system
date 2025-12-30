import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  UserRound,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Bell,
  CheckCheck,
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

// Helper function to get notification icon based on type
const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "ISSUE_CREATED":
      return <Bell className="h-5 w-5 text-blue-500" />;
    case "ISSUE_RESOLVED":
    case "ISSUE_CONFIRMED":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "ISSUE_REJECTED":
    case "ISSUE_REOPENED":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "ISSUE_COMMENTED":
      return <MessageSquare className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Helper function to get priority color
const getPriorityColor = (priority: Notification["priority"]) => {
  switch (priority) {
    case "HIGH":
    case "URGENT":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "LOW":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

// Helper function to format time
const formatTime = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Recently";
  }
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default function NotificationDropdown() {
  const { user } = useAuth();
  const userId = user?.user_id;

  const [isOpen, setIsOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  // RTK Query hooks
  const {
    data: notificationsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsByUserIdQuery(
    {
      userId: userId!,
      params: {
        page: 1,
        pageSize: 10,
        is_read: "false", // Show unread by default when dropdown opens
      },
    },
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: stats } = useGetNotificationStatsQuery(undefined, {
    skip: !userId,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = stats?.unreadCount || 0;

  // Sync local unread count with stats
  useEffect(() => {
    if (stats) {
      setLocalUnreadCount(stats.unreadCount);
    }
  }, [stats]);

  // Refetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      refetch();
    }
  }, [isOpen, userId, refetch]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notification_id: notificationId }).unwrap();
      // Update local count
      setLocalUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      setLocalUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.notification_id);
    }
    closeDropdown();
    // You can add navigation logic here based on notification type
    // For example: navigate to issue page if issue_id exists
  };

  // Calculate badge count (show up to 99+)
  const badgeCount = localUnreadCount > 99 ? "99+" : localUnreadCount;
  const showBadge = localUnreadCount > 0;

  if (!userId) {
    return null; // Don't show notification dropdown if user is not logged in
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        aria-label="Notifications"
      >
        <span
          className={`absolute -top-1 -right-1 z-10 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-semibold text-white bg-orange-500 rounded-full ${
            !showBadge ? "hidden" : "flex"
          }`}
        >
          {badgeCount}
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            {showBadge && (
              <span className="flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded-full">
                {badgeCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && showBadge && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 transition-colors bg-gray-100 rounded hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
            <button
              onClick={closeDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Close notifications"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="text-red-500">Failed to load notifications</div>
              <button
                onClick={() => refetch()}
                className="px-3 py-1 text-sm text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Bell className="w-12 h-12 text-gray-300" />
              <div className="text-gray-500">No notifications</div>
              <div className="text-sm text-gray-400">You're all caught up!</div>
            </div>
          ) : (
            <ul className="flex flex-col flex-1 h-auto overflow-y-auto custom-scrollbar">
              {notifications.map((notification) => (
                <li key={notification.notification_id}>
                  <DropdownItem
                    onItemClick={() => handleNotificationClick(notification)}
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                      !notification.is_read
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800">
                        {notification.sender?.avatar ? (
                          <img
                            width={40}
                            height={40}
                            src={notification.sender.avatar}
                            alt={notification.sender?.full_name || "User"}
                            className="w-full overflow-hidden rounded-full"
                          />
                        ) : (
                          <div className="relative">
                            {getNotificationIcon(notification.type)}
                            {notification.sender && (
                              <UserRound className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-gray-200 p-1 text-gray-600 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {!notification.is_read && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full dark:border-gray-900"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800 truncate dark:text-white/90">
                            {notification.title}
                          </span>
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(
                              notification.priority
                            )}`}
                            title={`${notification.priority} priority`}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {truncateText(notification.message, 100)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-800">
                            {notification.type.replace("_", " ")}
                          </span>
                          {notification.project?.name && (
                            <span className="truncate max-w-[120px]">
                              {notification.project.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.sender?.full_name && (
                            <span className="truncate max-w-[80px]">
                              {notification.sender.full_name}
                            </span>
                          )}
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{formatTime(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </DropdownItem>
                </li>
              ))}
            </ul>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {notifications.length} of{" "}
                {notificationsResponse?.meta.total || 0} notifications
              </div>
              {showBadge && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
            <Link
              to="/notifications"
              className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              View All Notifications
            </Link>
          </div>
        )}
      </Dropdown>
    </div>
  );
}
