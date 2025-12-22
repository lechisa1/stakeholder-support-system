const {
  IssueResolution,
  ResolutionAttachment,
  Issue,
  User,
  IssueHistory,
  IssueTier,
  Attachment,
  IssueAction,
  sequelize,
} = require("../../models");

const { v4: uuidv4 } = require("uuid");

// ------------------------------------------------------
//  RESOLVE ISSUE
// ------------------------------------------------------
const resolveIssue = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { issue_id, reason, resolved_by, attachment_ids } = req.body;

    // 1. Validate Issue
    const issue = await Issue.findByPk(issue_id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    // 2. Validate User
    const resolver = await User.findByPk(resolved_by);
    if (!resolver)
      return res.status(404).json({ message: "User (resolved_by) not found." });

    const resolution_id = uuidv4();

    // 3. Create resolution
    await IssueResolution.create(
      {
        resolution_id,
        issue_id,
        reason,
        resolved_by,
        resolved_at: new Date(),
      },
      { transaction: t }
    );

    // 4. Attach files
    if (attachment_ids?.length > 0) {
      const links = attachment_ids.map((attachment_id) => ({
        resolution_id,
        attachment_id,
        created_at: new Date(),
      }));

      await ResolutionAttachment.bulkCreate(links, { transaction: t });
    }

    // 5. Update issue status to resolved
    await Issue.update(
      {
        status: "resolved",
        updated_at: new Date(),
        resolved_at: new Date(),
      },
      {
        where: { issue_id },
        transaction: t,
      }
    );

    // 6. Update current tier status
    const currentTier = await IssueTier.findOne({
      where: {
        issue_id,
      },
      order: [["assigned_at", "DESC"]],
      transaction: t,
    });

    if (currentTier) {
      await IssueTier.update(
        {
          status: "resolved",
          updated_at: new Date(),
        },
        {
          where: { issue_tier_id: currentTier.issue_tier_id },
          transaction: t,
        }
      );
    }

    // 7. Log Action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "Issue Resolved",
        action_description: `Issue marked as resolved by user`,
        performed_by: resolved_by,
        related_tier: currentTier?.tier_level || null,
      },
      { transaction: t }
    );

    // ==================================
    // 8. CREATE IssueHistory ENTRY (NEW)
    // ==================================
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id,
        user_id: resolved_by,
        action: "resolved",
        status_at_time: "resolved",
        escalation_id: null,
        resolution_id,
        notes: `Issue resolved. Reason: ${reason}`,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // COMMIT ALL
    await t.commit();

    // Return resolution with details
    const fullResolution = await IssueResolution.findOne({
      where: { resolution_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "resolver" },
        {
          model: ResolutionAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    return res.status(201).json(fullResolution);
  } catch (error) {
    console.error("RESOLUTION ERROR:", error);
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ------------------------------------------------------
//  GET RESOLUTIONS BY ISSUE ID
// ------------------------------------------------------
const getResolutionsByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueResolution.findAll({
      where: { issue_id },
      include: [
        { model: User, as: "resolver" },
        {
          model: ResolutionAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["resolved_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("RESOLUTION FETCH ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET RESOLUTION BY ID
// ------------------------------------------------------
const getResolutionById = async (req, res) => {
  try {
    const { resolution_id } = req.params;

    const resolution = await IssueResolution.findOne({
      where: { resolution_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "resolver" },
        {
          model: ResolutionAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    if (!resolution)
      return res.status(404).json({ message: "Resolution not found" });

    return res.status(200).json(resolution);
  } catch (error) {
    console.error("GET RESOLUTION ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  DELETE RESOLUTION
// ------------------------------------------------------
const deleteResolution = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { resolution_id } = req.params;

    const resolution = await IssueResolution.findByPk(resolution_id);
    if (!resolution)
      return res.status(404).json({ message: "Resolution not found" });

    // Get the issue_id before deletion to update status
    const issue_id = resolution.issue_id;

    // Delete resolution
    await IssueResolution.destroy({
      where: { resolution_id },
      transaction: t,
    });

    // Update issue status back to in progress or previous status
    const hasOtherResolutions = await IssueResolution.findOne({
      where: { issue_id },
      transaction: t,
    });

    if (!hasOtherResolutions) {
      await Issue.update(
        {
          status: "in_progress",
          updated_at: new Date(),
        },
        {
          where: { issue_id },
          transaction: t,
        }
      );

      // Update tier status back to assigned
      await IssueTier.update(
        {
          status: "assigned",
          updated_at: new Date(),
        },
        {
          where: {
            issue_id,
            status: "resolved",
          },
          transaction: t,
        }
      );
    }

    await t.commit();

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE RESOLUTION ERROR:", error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET LATEST RESOLUTION BY ISSUE ID
// ------------------------------------------------------
const getLatestResolutionByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const resolution = await IssueResolution.findOne({
      where: { issue_id },
      include: [
        { model: User, as: "resolver" },
        {
          model: ResolutionAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["resolved_at", "DESC"]],
    });

    if (!resolution)
      return res
        .status(404)
        .json({ message: "No resolution found for this issue" });

    return res.status(200).json(resolution);
  } catch (error) {
    console.error("GET LATEST RESOLUTION ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
module.exports = {
  resolveIssue,
  getResolutionsByIssueId,
  getResolutionById,
  deleteResolution,
  getLatestResolutionByIssueId,
};
