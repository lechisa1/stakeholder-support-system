const express = require("express");
require("./cronjobs");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");

dotenv.config();

const { swaggerUi, swaggerSpec } = require("./swagger");

// ================== Here Import Routes=================

const dashboardRoute = require("./routers/dashboardRoutes");
const userRoute = require("./routers/userRoutes");
const roleRoute = require("./routers/roleRoutes");
const projectMetricRoute = require("./routers/projectMetricRoute");
const rolePermissionRoute = require("./routers/rolePermissionRoutes");
const userRoleRoute = require("./routers/userRoleRoutes");
const authRoute = require("./routers/authRoutes");

const issueCategories = require("./routers/issueCategoryRoutes");
const issuePriorities = require("./routers/issuePriorityRoutes");
const issueResponseTimes = require("./routers/issueResponseTimeRoutes");

const issueRoutes = require("./routers/issueRoutes");
const issueAssignmentRoutes = require("./routers/issueAssignmentRoutes");
const issueEscalationRoutes = require("./routers/issueEscaltionRoute");
const issueResolutionRoutes = require("./routers/issueResolutionRoutes");
const issueReRaiseRoutes = require("./routers/issueReRaiseRoutes");
const issueRejectRoutes = require("./routers/issueRejectRoutes");

const instituteRoute = require("./routers/instituteRoutes");
const instituteProjectsRoute = require("./routers/instituteProjectRoutes");
const hierarchyNodeRoute = require("./routers/hierarchyNodeRoutes");
const internalNodeRoute = require("./routers/internalNodeRoute");
const hierarchyNodeOrganizationRoute = require("./routers/hierarchyNodeOrganizationRoutes");

const notificationRoutes = require("./routers/notificationRoutes");

const changePasswordRoutes = require("./routers/passwordChangeRoutes");

const issueFileAttachmentRoutes = require("./routers/issueAttachmentRoutes");
const fileAttachmentRoutes = require("./routers/attachementRoutes");

const permissionRoute = require("./routers/permissionRoutes");

const issueGuideLines = require("./routers/issueReportingGuidelineRoutes");
const getAssignedProjectRoute = require("./routers/getAssignedProjectRoute");

const app = express();
const appServer = http.createServer(app);

// ================== Middleware ==================
// const devAuthBypass = require("./middlewares/devAuthBypass");
// app.use(devAuthBypass);
// app.use(express.json());

// app.use(
//   express.json({
//     verify: (req, res, buf) => {
//       try {
//         JSON.parse(buf);
//       } catch (e) {
//         res.status(400).json({
//           message:
//             "Invalid JSON format. Please ensure all property names are double-quoted and JSON is valid.",
//         });
//         throw e;
//       }
//     },
//   })
// );

app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        // Don't throw the error after sending response
        const error = new Error("Invalid JSON payload");
        error.status = 400;
        error.expose = true;
        throw error;
      }
    },
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ===========Serve static files (PDFs, uploads)=====================
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      if (filePath.endsWith(".pdf")) {
        res.set("Content-Disposition", "inline");
      }
    },
  })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

// ================== CORS Configuration ==================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  process.env.FRONTEND_URL,
];
const corsOptions = {
  origin: true, // Allow all origins for development
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// ================== Database Connection ==================
const { sequelize } = require("./models");

sequelize
  .authenticate()
  .then(() => console.log(" Database connected successfully"))
  .catch((err) => console.error(" Database connection error:", err));

// ================== Swagger Setup ==================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================== API Routes go here ==================

app.use("/api/dashboard", dashboardRoute);
app.use("/api/users", userRoute);
app.use("/api/roles", roleRoute);
app.use("/api/role-permission", rolePermissionRoute);
app.use("/api/user-roles", userRoleRoute);

app.use("/api/auth", authRoute);

app.use("/api/projects", require("./routers/projectRoutes"));
app.use("/api/project-metrics", projectMetricRoute);
app.use("/api/institutes", instituteRoute);
app.use("/api/institute-projects", instituteProjectsRoute);

// app.use("/api/hierarchies", hierarchyRoute);
app.use("/api/hierarchy-nodes", hierarchyNodeRoute);
app.use("/api/hierarchy-node-organizations", hierarchyNodeOrganizationRoute);

app.use("/api/issue-categories", issueCategories);
app.use("/api/issue-priorities", issuePriorities);
app.use("/api/issue-response-times", issueResponseTimes);
app.use("/api/issues", issueRoutes);
app.use("/api/assignments", issueAssignmentRoutes);
app.use("/api/issue-escalations", issueEscalationRoutes);
app.use("/api/issue-resolutions", issueResolutionRoutes);
app.use("/api/issue-re-raises", issueReRaiseRoutes);
app.use("/api/issue-rejects", issueRejectRoutes);
app.use("/api/internal-nodes", internalNodeRoute);
// /api/internal-nodes

// notifications
app.use("/api/notifications", notificationRoutes);

app.use("/api/change-password", changePasswordRoutes);

app.use("/api/issue-attachments", issueFileAttachmentRoutes);
app.use("/api/attachments", fileAttachmentRoutes);

app.use("/api/permissions", permissionRoute);
app.use("/api/issue-guidelines", issueGuideLines);

app.use("/api/flow", getAssignedProjectRoute);
// ================== Root Endpoint ==================
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Issue Tracking System API 🚀" });
});

// ================== Error Handler ==================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================== Start App Server ==================
const appPort = process.env.PORT || 4000;
appServer.listen(appPort, () => {
  console.log(` App server running at http://localhost:${appPort}`);
});

// ================== Socket.IO Setup ==================
const socketServer = http.createServer();
const io = new Server(socketServer, {
  cors: corsOptions,
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(` User ${userId} connected: ${socket.id}`);
  }

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
});

const socketPort = process.env.SOCKET_PORT || 5000;
socketServer.listen(socketPort, () => {
  console.log(`Socket.IO server running at http://localhost:${socketPort}`);
});

// Make Socket.IO accessible globally
app.set("socketio", io);

module.exports = { appServer, io, onlineUsers };
