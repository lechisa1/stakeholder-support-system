// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import IssueCategoryTable from "../../components/tables/BasicTables/issueCategoryTable";

import IssueCategoryList from "../../components/tables/lists/IssueCategoryList";

// import { useTranslation } from "react-i18next";
export default function IssueCategory() {
  // const { t } = useTranslation();

  return (
    <>
      <IssueCategoryList />
      {/* <PageMeta
        title={t("basedata.issue_category")}
        description={t("basedata.subtitle", { title: t("basedata.issue_category") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.issue_category_management")}>
          <IssueCategoryTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
