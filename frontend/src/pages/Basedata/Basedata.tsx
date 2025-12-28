import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import InfoCard from "../../components/Basedata/card";
import {
  FaExclamationTriangle,
  FaFlag,
  FaProjectDiagram,
  FaUserTie,
} from "react-icons/fa";

export default function Basedata() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  localStorage.removeItem("current_project_id")
  const cards = [
    {
      title: t("basedata.issue_flow"),
      description: t("basedata.subtitle", { title: t("basedata.issue_flow") }),
      icon: <FaProjectDiagram size={24} color={"#094C81"} />,
      route: "/issue_configuration",
      permission: ["REQUEST_FLOWS:READ"],
    },
    {
      title: t("basedata.priority_level_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.priority_level"),
      }),
      icon: <FaFlag size={26} color={"#094C81"} />,
      route: "/priority_level",
      permission: ["REQUEST_PRIORITIES:READ"],
    },
    {
      title: t("basedata.human_resource_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.human_resource"),
      }),
      icon: <FaUserTie size={26} color={"#094C81"} />,
      route: "/human_resource",
      permission: ["HUMAN_RESOURCES:READ"],
    },

    {
      title: t("basedata.issue_category_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.issue_category"),
      }),
      icon: <FaExclamationTriangle size={26} color={"#094C81"} />,
      route: "/issue_category",
      permission: ["REQUEST_CATEGORIES:READ"],
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
              permission={card.permission}
              buttonText={t("common.viewButton")}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
