module.exports = (req, res, next) => {
  // only active in development (don't risk production)
  if (process.env.NODE_ENV === "production") return next();

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // use Authorization: Bearer DEV_TOKEN to trigger bypass
  if (token === "DEV_TOKEN") {
    req.user = {
      user_id: "00000000-0000-4000-8000-000000000000",
      email: "dev@example.com",
      full_name: "Developer User",
      institute_id: null,
      user_type_id: null,
      user_type: "developer",
      roles: ["admin", "manager", "tester"],
      permissions: [
        "project:create",
        "project:read",
        "project:update",
        "hierarchy:create",
        "hierarchy:read",
        "hierarchy:update",
        "issue:create",
        "issue:read",
        "issue:update",
        "issue:delete",
      ],
      project_roles: [],
    };
    console.log("⚠️  Dev auth bypass active — fake user injected");
  }

  next();
};
