const { User, UserType, RoleSubRolePermission } = require("../models");
const {
  getInternalUserDashboardWithStats,
} = require("../services/dashboadService");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user with their type
    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserType,
          as: "userType",
          attributes: ["user_type_id", "name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let dashboardData;

    // Check user type and fetch appropriate data
    if (user.userType.name === "internal_user") {
      const result = await getInternalUserDashboardWithStats();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch dashboard data",
          error: result.error,
        });
      }

      dashboardData = result.data;
    } else {
      // For other user types (external users)
      // You can add different logic here later
      dashboardData = [];
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully.",
      data: dashboardData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
