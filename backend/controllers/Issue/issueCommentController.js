const { IssueComment, Issue, User } = require("../models");
const { v4: uuidv4 } = require("uuid");

// Add comment to issue
const addComment = async (req, res) => {
  try {
    const { issue_id, author_id, comment_text, is_internal_note } = req.body;

    // Check if required fields are provided
    if (!issue_id || !author_id || !comment_text) {
      return res.status(400).json({
        message: "Issue ID, author ID, and comment text are required.",
      });
    }

    // Verify issue exists
    const issue = await Issue.findByPk(issue_id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    // Verify author exists
    const author = await User.findByPk(author_id);
    if (!author) {
      return res.status(404).json({ message: "Author user not found." });
    }

    const comment_id = uuidv4();

    // Create comment
    const comment = await IssueComment.create({
      comment_id,
      issue_id,
      author_id,
      comment_text,
      is_internal_note: is_internal_note || false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create action record
    await IssueAction.create({
      action_id: uuidv4(),
      issue_id,
      action_name: "Comment Added",
      action_description: `New ${
        is_internal_note ? "internal note" : "comment"
      } added`,
      performed_by: author_id,
      related_tier: issue.current_tier,
      created_at: new Date(),
    });

    // Return comment with relations
    const commentWithDetails = await IssueComment.findOne({
      where: { comment_id: comment.comment_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "author" },
      ],
    });

    res.status(201).json(commentWithDetails);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get comments by issue ID
const getCommentsByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;
    const { include_internal } = req.query;

    const whereClause = { issue_id };
    if (include_internal !== "true") {
      whereClause.is_internal_note = false;
    }

    const comments = await IssueComment.findAll({
      where: whereClause,
      include: [{ model: User, as: "author" }],
      order: [["created_at", "ASC"]],
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;

    const comment = await IssueComment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.comment_text = comment_text || comment.comment_text;
    comment.updated_at = new Date();

    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await IssueComment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByIssueId,
  updateComment,
  deleteComment,
};
