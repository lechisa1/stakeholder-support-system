const { IssueAttachment } = require("../../models");

const linkAttachmentToIssue = async (req, res) => {
  try {
    const { issue_id, attachment_id } = req.body;

    if (!issue_id || !attachment_id) {
      return res.status(400).json({
        success: false,
        message: "issue_id and attachment_id are required",
      });
    }

    const record = await IssueAttachment.create({
      issue_id,
      attachment_id,
    });

    return res.status(201).json({
      success: true,
      message: "Attachment linked to issue successfully",
      issue_attachment: record,
    });
  } catch (error) {
    console.error("Error linking attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Error linking attachment to issue",
      error: error.message,
    });
  }
};

const getAttachmentsForIssue = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const attachments = await IssueAttachment.findAll({
      where: { issue_id },
      include: [
        {
          model: Attachment,
          as: "attachment",
          attributes: [
            "attachment_id",
            "file_name",
            "file_path",
            "uploaded_by",
            "created_at",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: attachments.length,
      attachments,
    });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching attachments",
      error: error.message,
    });
  }
};
const deleteIssueAttachment = async (req, res) => {
  try {
    const { issue_attachment_id } = req.params;

    const record = await IssueAttachment.findByPk(issue_attachment_id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "IssueAttachment not found",
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: "Issue attachment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting issue attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting issue attachment",
      error: error.message,
    });
  }
};

module.exports = {
  linkAttachmentToIssue,
  getAttachmentsForIssue,
  deleteIssueAttachment,
};
