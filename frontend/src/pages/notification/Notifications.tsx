import React, { useMemo, useState } from "react";
import { Bell, AlertCircle, User, Shield } from "lucide-react";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetNotificationsByUserIdQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../redux/services/notificationApi";
import { useAuth } from "../../contexts/AuthContext";

export const CATEGORY_MAP = {
  ISSUE: [
    "ISSUE_CREATED",
    "ISSUE_ASSIGNED",
    "ISSUE_UNASSIGNED",
    "ISSUE_RESOLVED",
    "ISSUE_CONFIRMED",
    "ISSUE_REJECTED",
    "ISSUE_REOPENED",
    "ISSUE_ESCALATED",
    "ISSUE_COMMENTED",
  ],
  USER: [
    "PASSWORD_UPDATED",
    "LOGIN_ALERT",
    "USER_DEACTIVATED",
    "USER_REACTIVATED",
    "PROFILE_UPDATED",
  ],
  SYSTEM: ["SYSTEM_ALERT", "BROADCAST_MESSAGE"],
} as const;

type Category = keyof typeof CATEGORY_MAP;
type StatusFilter = "ALL" | "UNREAD" | "READ";

const getIcon = (type: string) => {
  if (type.startsWith("ISSUE")) return <AlertCircle className="h-5 w-5 text-[#073954]" />;
  if (CATEGORY_MAP.USER.includes(type as any)) return <User className="h-5 w-5 text-[#073954]" />;
  return <Shield className="h-5 w-5 text-[#073954]" />;
};

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.user_id;

  const [activeCategory, setActiveCategory] = useState<Category>("ISSUE");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data: apiNotifications, refetch } = useGetNotificationsByUserIdQuery(
    { userId: userId! },
    { skip: !userId, refetchOnMountOrArgChange: true }
  );

  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();

  const notifications = useMemo(() => {
    if (!apiNotifications?.data) return [];
    return apiNotifications.data.map((n: any) => ({
      notification_id: n.notification_id,
      type: n.type,
      title: n.title,
      message: n.message,
      is_read: n.is_read,
      created_at: n.created_at,
      issue: n.issue
        ? {
            issue_id: n.issue.issue_id,
            ticket_number: n.issue.ticket_number,
          }
        : undefined,
    }));
  }, [apiNotifications]);

  // MARK ALL AS READ
  const handleMarkAllAsRead = async () => {
    try {
      if (userId) await markAllNotificationsAsRead({ userId }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // MARK SINGLE NOTIFICATION AS READ
 // MARK SINGLE NOTIFICATION AS READ
 const handleNotificationClick = async (notification: any) => {
  if (!notification.is_read) {
    try {
      // Only send notification_id
      await markNotificationAsRead({ notification_id: notification.notification_id }).unwrap();
      refetch(); // refresh the list
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  // if (notification.issue) {
  //   navigate(`/task/${notification.issue.issue_id}`);
  // }
};




  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const categoryMatch = CATEGORY_MAP[activeCategory].includes(n.type as any);
      const statusMatch =
        statusFilter === "ALL" ||
        (statusFilter === "UNREAD" && !n.is_read) ||
        (statusFilter === "READ" && n.is_read);
      return categoryMatch && statusMatch;
    });
  }, [notifications, activeCategory, statusFilter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#073954] flex items-center gap-2 mb-5">
        <Bell className="h-6 w-6" />
        Notifications
      </h1>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(Object.keys(CATEGORY_MAP) as Category[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={clsx(
                "px-5 py-1.5 text-sm rounded-lg transition",
                activeCategory === category
                  ? "bg-[#073954] text-white"
                  : "bg-gray-100 border text-gray-700 hover:bg-gray-200"
              )}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#073954] focus:border-[#073954] transition"
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          <button
            onClick={handleMarkAllAsRead}
            className="text-sm px-4 py-1.5 rounded-lg bg-[#073954] text-white hover:bg-[#073954]/90"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 && (
          <div className="text-center text-gray-500 py-12">No notifications found</div>
        )}

        {filteredNotifications.map((n) => (
          <div
            key={n.notification_id}
            onClick={() => handleNotificationClick(n)}
            className={clsx(
              "flex gap-4 p-4 rounded-xl border transition cursor-pointer  hover:bg-blue-100",
              n.is_read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"
            )}
          >
            <div className="mt-1">{getIcon(n.type)}</div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={clsx("text-sm", n.is_read ? "font-medium" : "font-semibold")}>
                  {n.title}
                </h3>
                {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {n.issue?.ticket_number ? (
                  <>
                    {n.message.split(n.issue.ticket_number)[0]}
                    <Link
                      to={`/task/${n.issue.issue_id}`}
                      className="text-[#073954] font-medium hover:underline"
                      title="View issue"
                    >
                      {n.issue.ticket_number}
                    </Link>
                    {n.message.split(n.issue.ticket_number)[1]}
                  </>
                ) : (
                  n.message
                )}
              </p>

              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
