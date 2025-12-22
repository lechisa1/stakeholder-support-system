import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import InfoCard from "../../components/Basedata/card";
import {
  FaExclamationTriangle,
  FaFlag,
  FaUserTie,
  FaLock,
  FaProjectDiagram,
} from "react-icons/fa";

export default function Basedata() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    // {
    //   title: t("basedata.organization_management"),
    //   description: t("basedata.subtitle", {
    //     title: t("basedata.organization"),
    //   }),
    //   icon: <FaBuilding size={26} color={"#094C81"} />,
    //   route: "/organization",
    // },
    // {
    //   title: t("basedata.org_structure_management"),
    //   description: t("basedata.subtitle", {
    //     title: t("basedata.org_structure"),
    //   }),
    //   icon: <FaBuilding size={24} color={"#094C81"} />,
    //   route: "/org_structure",
    // },
    // {
    //   title: t("basedata.level_management"),
    //   description: t("basedata.subtitle", { title: t("basedata.level") }),
    //   icon: <FaBuilding size={24} />,
    //   route: "/branch",
    // },

    // {
    //   title: t("basedata.branch_management"),
    //   description: t("basedata.subtitle", { title: t("basedata.branch") }),
    //   icon: <FaBuilding size={24} color={"#094C81"} />,
    //   route: "/branch",
    // },

    {
      title: t("basedata.issue_flow"),
      description: t("basedata.subtitle", { title: t("basedata.issue_flow") }),
      icon: <FaProjectDiagram size={24} color={"#094C81"} />,
      route: "/issue_configuration",
    },
    {
      title: t("basedata.priority_level_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.priority_level"),
      }),
      icon: <FaFlag size={26} color={"#094C81"} />,
      route: "/priority_level",
    },
    {
      title: t("Human Resource Management"),
      description: t("Human Resource Management", {
        title: t("basedata.project_human_resource"),
      }),
      icon: <FaFlag size={26} color={"#094C81"} />,
      route: "/human_resource",
    },

    {
      title: t("basedata.issue_category_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.issue_category"),
      }),
      icon: <FaExclamationTriangle size={26} color={"#094C81"} />,
      route: "/issue_category",
    },
  ];

  return (
    <>
      <PageMeta title={t("basedata.title")} description="" />
      <div className="rounded-xl border min-h-[80vh] border-gray-200 bg-white dark:border-gray-800  p-5">
        <h3 className="text-xl lg:text-2xl font-bold text-[#11255A] dark:text-white/90">
          {t("basedata.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("basedata.first_subtitle")}
        </p>

        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3  gap-x-10 gap-y-5 mt-10">
          {cards.map((card, index) => (
            <InfoCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              buttonText={t("common.viewButton")}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
