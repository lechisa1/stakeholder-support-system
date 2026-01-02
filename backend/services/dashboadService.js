// services/dashboardService.js - Enhanced version
const { User, Institute, Project, Issue, IssuePriority } = require("../models");
const { Sequelize } = require("sequelize");

const getInternalUserDashboardWithStats = async () => {
  try {
    // Get all active institutes with their projects and issue counts
    /*  add the below for only returning active ones 
        AND p.is_active = true
        AND ip.is_active = true
    */
    const institutes = await Institute.findAll({
      where: { is_active: true },
      attributes: [
        "institute_id",
        "name",
        "is_active",
        "created_at",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM institute_projects AS ip
            INNER JOIN projects AS p ON p.project_id = ip.project_id
            WHERE ip.institute_id = "Institute"."institute_id"
          )`),
          "total_projects",
        ],
      ],
      include: [
        {
          model: Project,
          as: "projects",
          //   through: {
          //     attributes: ["is_active"],
          //     where: { is_active: true },
          //   },
          //   where: { is_active: true },
          required: false,
          attributes: [
            "project_id",
            "name",
            // "is_active",
            [
              Sequelize.literal(`(
                SELECT COUNT(*)
                FROM issues AS i
                WHERE i.project_id = "projects"."project_id"
              )`),
              "total_issues",
            ],
          ],
          include: [
            {
              model: Issue,
              as: "issues",
              attributes: [
                "issue_id",
                "ticket_number",
                "status",
                "created_at",
                "priority_id",
              ],
              //   limit: 10, // Limit issues per project for performance
              include: [
                {
                  model: IssuePriority,
                  as: "priority",
                  attributes: ["name", "description", "color_value"],
                },
              ],
              order: [["created_at", "DESC"]],
              required: false,
            },
          ],
        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: Project, as: "projects" }, "name", "ASC"],
      ],
    });

    // Calculate overall statistics
    let totalInstitutes = 0;
    let totalProjects = 0;
    let totalIssues = 0;

    const transformedData = institutes.map((institute) => {
      totalInstitutes++;

      const projects = institute.projects
        ? institute.projects.map((project) => {
            totalProjects++;

            const issues = project.issues
              ? project.issues.map((issue) => {
                  totalIssues++;

                  const priority = issue.priority
                    ? {
                        name: issue.priority.name,
                        description: issue.priority.description,
                        color_value: issue.priority.color_value,
                      }
                    : null;

                  return {
                    issue_id: issue.issue_id,
                    ticket_number: issue.ticket_number,
                    status: issue.status,
                    created_at: issue.created_at,
                    priority_id: issue.priority_id,
                    priority: priority,
                  };
                })
              : [];

            return {
              project_id: project.project_id,
              name: project.name,
              //   is_active: project.is_active,
              total_issues: project.dataValues.total_issues || 0,
              issues: issues,
            };
          })
        : [];

      return {
        institute_id: institute.institute_id,
        name: institute.name,
        created_at: institute.created_at,
        // is_active: institute.is_active,
        total_projects: institute.dataValues.total_projects || 0,
        projects: projects,
      };
    });

    return {
      success: true,
      data: {
        summary: {
          total_institutes: totalInstitutes,
          total_projects: totalProjects,
          total_issues: totalIssues,
        },
        institutes: transformedData,
      },
    };
  } catch (error) {
    console.error("Dashboard service error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getExternalUserDashboardWithStatsics = async (userId) => {
  try {
    // Get user
    const user = await User.findByPk(userId);
    if (!user || !user.institute_id) {
      throw new Error("User or institute not found");
    }

    // Get user's institute
    const institute = await Institute.findByPk(user.institute_id, {
      where: { is_active: true },
      attributes: [
        "institute_id",
        "name",
        "is_active",
        "created_at",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM institute_projects AS ip
            INNER JOIN projects AS p ON p.project_id = ip.project_id
            WHERE ip.institute_id = "Institute"."institute_id"
          )`),
          "total_projects",
        ],
      ],
      include: [
        {
          model: Project,
          as: "projects",
          required: false,
          attributes: [
            "project_id",
            "name",
            [
              Sequelize.literal(`(
                SELECT COUNT(*)
                FROM issues AS i
                WHERE i.project_id = "projects"."project_id"
              )`),
              "total_issues",
            ],
          ],
          include: [
            {
              model: Issue,
              as: "issues",
              required: false,
              attributes: [
                "issue_id",
                "ticket_number",
                "status",
                "created_at",
                "priority_id",
              ],
              include: [
                {
                  model: IssuePriority,
                  as: "priority",
                  attributes: ["name", "description", "color_value"],
                },
              ],
              order: [["created_at", "DESC"]],
            },
          ],
        },
      ],
      order: [[{ model: Project, as: "projects" }, "name", "ASC"]],
    });

    if (!institute) {
      throw new Error("Institute not found or inactive");
    }

    // Totals
    let totalProjects = 0;
    let totalIssues = 0;

    const projects = institute.projects
      ? institute.projects.map((project) => {
          totalProjects++;

          const issues = project.issues
            ? project.issues.map((issue) => {
                totalIssues++;

                return {
                  issue_id: issue.issue_id,
                  ticket_number: issue.ticket_number,
                  status: issue.status,
                  created_at: issue.created_at,
                  priority_id: issue.priority_id,
                  priority: issue.priority
                    ? {
                        name: issue.priority.name,
                        description: issue.priority.description,
                        color_value: issue.priority.color_value,
                      }
                    : null,
                };
              })
            : [];

          return {
            project_id: project.project_id,
            name: project.name,
            total_issues: project.dataValues.total_issues || 0,
            issues,
          };
        })
      : [];

    return {
      success: true,
      data: {
        summary: {
          total_institutes: 1,
          total_projects: totalProjects,
          total_issues: totalIssues,
        },
        institute: {
          institute_id: institute.institute_id,
          name: institute.name,
          created_at: institute.created_at,
          total_projects: institute.dataValues.total_projects || 0,
          projects,
        },
      },
    };
  } catch (error) {
    console.error("Dashboard service error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getExternalUserDashboardWithStats = async (userId) => {
  try {
    // 1️⃣ Get user
    const user = await User.findByPk(userId);
    if (!user || !user.institute_id) {
      throw new Error("User or institute not found");
    }

    // 2️⃣ Get institute + projects + issues
    const institute = await Institute.findByPk(user.institute_id, {
      where: { is_active: true },
      attributes: [
        "institute_id",
        "name",
        "created_at",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM institute_projects ip
            INNER JOIN projects p ON p.project_id = ip.project_id
            WHERE ip.institute_id = "Institute"."institute_id"
          )`),
          "total_projects",
        ],
      ],
      include: [
        {
          model: Project,
          as: "projects",
          required: false,
          attributes: ["project_id", "name"],
          include: [
            {
              model: Issue,
              as: "issues",
              required: false,
              attributes: [
                "issue_id",
                "ticket_number",
                "status",
                "created_at",
                "priority_id",
                "hierarchy_node_id",
              ],
              include: [
                {
                  model: HierarchyNode,
                  as: "hierarchyNode",
                  attributes: [
                    "hierarchy_node_id",
                    "name",
                    "parent_id",
                    "level",
                  ],
                },
                {
                  model: IssuePriority,
                  as: "priority",
                  attributes: ["name", "description", "color_value"],
                },
              ],
              order: [["created_at", "DESC"]],
            },
          ],
        },
      ],
      order: [[{ model: Project, as: "projects" }, "name", "ASC"]],
    });

    if (!institute) {
      throw new Error("Institute not found or inactive");
    }

    // 3️⃣ Totals
    let totalProjects = 0;
    let totalIssues = 0;

    // 4️⃣ Transform → project → hierarchy → issue
    const projects = (institute.projects || []).map((project) => {
      totalProjects++;

      const hierarchyMap = {};

      (project.issues || []).forEach((issue) => {
        totalIssues++;

        const node = issue.hierarchyNode;
        const nodeId = node?.hierarchy_node_id || "unassigned";

        if (!hierarchyMap[nodeId]) {
          hierarchyMap[nodeId] = {
            hierarchy_node_id: node?.hierarchy_node_id || null,
            name: node?.name || "Unassigned",
            parent_id: node?.parent_id || null,
            level: node?.level || 0,
            issues: [],
          };
        }

        hierarchyMap[nodeId].issues.push({
          issue_id: issue.issue_id,
          ticket_number: issue.ticket_number,
          status: issue.status,
          created_at: issue.created_at,
          priority_id: issue.priority_id,
          priority: issue.priority
            ? {
                name: issue.priority.name,
                description: issue.priority.description,
                color_value: issue.priority.color_value,
              }
            : null,
        });
      });

      const hierarchies = Object.values(hierarchyMap).map((node) => ({
        ...node,
        total_issues: node.issues.length,
      }));

      return {
        project_id: project.project_id,
        name: project.name,
        total_issues: project.issues?.length || 0,
        hierarchies,
      };
    });

    // 5️⃣ Response
    return {
      success: true,
      data: {
        summary: {
          total_institutes: 1,
          total_projects: totalProjects,
          total_issues: totalIssues,
        },
        institute: {
          institute_id: institute.institute_id,
          name: institute.name,
          created_at: institute.created_at,
          total_projects: institute.dataValues.total_projects || 0,
          projects,
        },
      },
    };
  } catch (error) {
    console.error("Dashboard service error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  getInternalUserDashboardWithStats,
};
