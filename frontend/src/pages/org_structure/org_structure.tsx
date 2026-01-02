// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import OrgStructureTable from "../../components/tables/BasicTables/orgStructureTable";
// import { useTranslation } from "react-i18next";
import HierarchyNodeList from "../../components/tables/lists/issueFlowList";
export default function Branch() {
  // const { t } = useTranslation();

  return (
    <>
      <HierarchyNodeList />
      {/* <PageMeta
        title={t("basedata.org_structure_management")}
        description={t("basedata.subtitle", { title: t("basedata.org_structure") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.org_structure_management")}>
          <OrgStructureTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
