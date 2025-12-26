import { useAuth } from "../contexts/AuthContext";
import {
  useGetAssignedIssuesQuery,
  useGetEscalatedIssuesWithNullTierQuery,
  useGetIssuesByProjectIdsQuery,
} from "../redux/services/issueApi";

export const useIssuesQuery = (userId: string, internalNode: any) => {
  const { user } = useAuth();
  console.log("user: ", user);
  const hasParentNode =
    internalNode?.parent_id !== null && internalNode?.parent_id !== undefined;

  console.log("hasParentNode: ", hasParentNode);

  /**
   * 1. Extract project IDs from user data
   */
  const projectIds: string[] = Array.isArray(user?.internal_project_roles)
    ? user.internal_project_roles
        .map((role) => role?.project?.project_id)
        .filter(Boolean)
    : [];

  console.log("Project IDs:", projectIds);

  /**
   * 2. Fetch issues by project IDs (root-level users only)
   */
  const issuesByProjects = useGetIssuesByProjectIdsQuery(projectIds, {
    skip:
      hasParentNode || // skip if user has parent node
      !userId || // skip if no user
      projectIds.length === 0, // skip if no projects
  });

  console.log("issuesByProjects:", issuesByProjects);

  // If user has NO parent node (root level) → get escalated issues
  // const escalatedIssues = useGetEscalatedIssuesWithNullTierQuery(undefined, {
  //   skip: hasParentNode || !userId, // Skip if user HAS parent node OR no userId
  // });
  // console.log("escalatedIssues: ", escalatedIssues);

  // If user HAS parent node (child level) → get assigned issues
  const assignedIssues = useGetAssignedIssuesQuery(userId, {
    skip: !hasParentNode || !userId, // Skip if user has NO parent node OR no userId
  });
  console.log("assignedIssues: ", assignedIssues);

  // Return the appropriate query result based on the condition
  if (!hasParentNode) {
    // No parent → get escalated issues
    return issuesByProjects;
  } else {
    // Has parent → get assigned issues
    return assignedIssues;
  }
};
