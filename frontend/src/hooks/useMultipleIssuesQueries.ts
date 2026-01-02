import { useMemo } from "react";
import { useGetIssuesByMultiplePairsQuery } from "../redux/services/issueApi";
import { useSearchParams } from "react-router-dom";

export function useMultipleIssuesQueries(
  projectHierarchyPairs: Array<{
    project_id: string;
    hierarchy_node_id: string | null;
  }>,
  user_id: string,
  page: number,
  pageSize: number
) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
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
    { pairs: validPairs, user_id, search: searchQuery, page, pageSize },
    { skip: validPairs.length === 0 || !user_id }
  );

  return {
    data: data?.issues || [],
    searchQuery,
    page,
    pageSize,
    isLoading,
    isError,
    errors: error ? [error] : [],
  };
}
