import { useMemo } from "react";
import { useGetIssuesByMultiplePairsQuery } from "../redux/services/issueApi";

export function useMultipleIssuesQueries(
  projectHierarchyPairs: Array<{
    project_id: string;
    hierarchy_node_id: string | null;
  }>,
  user_id: string
) {
  // Filter valid pairs (both project_id and hierarchy_node_id are required)
  const validPairs = useMemo(() => {
    return projectHierarchyPairs
      .filter((pair) => pair.project_id && pair.hierarchy_node_id)
      .map((pair) => ({
        project_id: pair.project_id,
        hierarchy_node_id: pair.hierarchy_node_id!,
      }));
  }, [projectHierarchyPairs]);

  // Use RTK Query with the valid pairs
  const { data, isLoading, isError, error } = useGetIssuesByMultiplePairsQuery(
    { pairs: validPairs, user_id },
    { skip: validPairs.length === 0 || !user_id }
  );

  return {
    allIssues: data || [],
    isLoading,
    isError,
    errors: error ? [error] : [],
  };
}
