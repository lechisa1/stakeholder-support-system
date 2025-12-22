export const getHeirarchyStructure = (projectId: string, object: any) => {
  if (!object?.project_roles || !Array.isArray(object.project_roles)) {
    return null;
  }

  const matchingProject = object.project_roles.find(
    (projectRole: any) => projectRole.project?.project_id === projectId
  );

  return matchingProject?.hierarchy_node || null;
};
