import {
  useGetAssignedIssuesQuery,
  useGetEscalatedIssuesWithNullTierQuery,
} from "../redux/services/issueApi";

export const useIssuesQuery = (userId: string, internalNode: any) => {
  const hasParentNode =
    internalNode?.parent_id !== null && internalNode?.parent_id !== undefined;

  console.log("hasParentNode: ", hasParentNode);

  // If user has NO parent node (root level) → get escalated issues
  const escalatedIssues = useGetEscalatedIssuesWithNullTierQuery(undefined, {
    skip: hasParentNode || !userId, // Skip if user HAS parent node OR no userId
  });
  console.log("escalatedIssues: ", escalatedIssues);

  // If user HAS parent node (child level) → get assigned issues
  const assignedIssues = useGetAssignedIssuesQuery(userId, {
    skip: !hasParentNode || !userId, // Skip if user has NO parent node OR no userId
  });
  console.log("assignedIssues: ", assignedIssues);

  // Return the appropriate query result based on the condition
  if (!hasParentNode) {
    // No parent → get escalated issues
    return escalatedIssues;
  } else {
    // Has parent → get assigned issues
    return assignedIssues;
  }
};
