// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import ProjectTable from "../../components/tables/BasicTables/projectTable";

import PermissionList from "../../components/tables/lists/permissionList";

// import { useTranslation } from "react-i18next";
export default function Permission() {
  // const { t } = useTranslation();

  return (
    <>
      <PermissionList />
      {/* <PageMeta
        title={t("basedata.project_management")}
        description={t("basedata.subtitle", { title: t("basedata.project") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.project_management")}>
          <ProjectTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
