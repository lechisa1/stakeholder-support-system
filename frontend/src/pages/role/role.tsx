// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import RoleTable from "../../components/tables/BasicTables/roleTable";

import RoleList from "../../components/tables/lists/RoleList";

// import { useTranslation } from "react-i18next";
export default function City() {
  // const { t } = useTranslation();

  return (
    <>
      <RoleList />
      {/* <PageMeta
        title={t("basedata.role_management")}
        description={t("basedata.subtitle", { title: t("basedata.role") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.role_management")}>
          <RoleTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
