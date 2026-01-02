// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import PriorityLevelTable from "../../components/tables/BasicTables/priorityLevelTable";

import IssuePriorityList from "../../components/tables/lists/issuePriorityList";

// import { useTranslation } from "react-i18next";
export default function City() {
  // const { t } = useTranslation();

  return (
    <>
      <IssuePriorityList />
      {/* <PageMeta
        title={t("basedata.priority_level_management")}
        description={t("basedata.subtitle", { title: t("basedata.priority_level_") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.priority_level_management")}>
          <PriorityLevelTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
