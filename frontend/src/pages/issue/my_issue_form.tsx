import React, { useEffect, useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Check, Dot } from "lucide-react";

// import Select from "../../components/form/Select";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/cn/select";

import {
  useCreateIssueMutation,
  useUpdateIssueMutation,
} from "../../redux/services/issueApi";

import { useGetIssueCategoriesQuery } from "../../redux/services/issueCategoryApi";
import { useGetIssuePrioritiesQuery } from "../../redux/services/issuePriorityApi";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { useGetProjectsByUserIdQuery } from "../../redux/services/projectApi";
import { FileUploadField } from "../../components/common/FileUploadField";
import DetailHeader from "../../components/common/DetailHeader";
import TextArea from "../../components/form/input/TextArea";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AddIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const editData = state?.issue;

  // 🔹 Fetch logged-in user
  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();

  // 🔹 Fetch projects assigned to this user
  const { data: userProjectsResponse, isLoading: projectsLoading } =
    useGetProjectsByUserIdQuery(loggedUser?.user?.user_id ?? "", {
      skip: !loggedUser?.user?.user_id,
      refetchOnMountOrArgChange: true,
    });

  const userProjects =
    userProjectsResponse?.data?.map((assignment: any) => {
      const project = assignment.project;
      return {
        project_user_role_id: assignment.project_user_role_id,
        project_id: project.project_id,
        name: project.name,
        description: project.description,
        is_active: project.is_active,
        hierarchyNode: assignment.hierarchyNode,
        role: assignment.role,
        subRole: assignment.subRole,
        instituteProjects: project.instituteProjects,
      };
    }) ?? [];

  // Fetch Categories & Priorities
  const { data: prioritiesResponse } = useGetIssuePrioritiesQuery();
  const priorities = prioritiesResponse?.data ?? [];

  const { data: categoryResponse } = useGetIssueCategoriesQuery();
  const categories = categoryResponse ?? [];

  // API Mutations for create / update
  const [createIssue] = useCreateIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();


  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [tempPriority, setTempPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState<Record<string, any>>({
    title: "title",
    project_id: editData?.project_id ?? "",
    hierarchy_node_id: editData?.hierarchy_node_id ?? "",
    issue_category_id: editData?.issue_category_id ?? "",
    priority_id: editData?.priority_id ?? "",
    issue_occured_time: editData?.issue_occured_time ?? "",
    url_path: editData?.url_path ?? "",
    description: editData?.description ?? "",
    action_taken: editData?.action_taken ?? "",
    action_taken_checkbox: !!editData?.action_taken,
    attachment_id: editData?.attachment_id
      ? Array.isArray(editData.attachment_id)
        ? editData.attachment_id
        : [editData.attachment_id]
      : [],
    reported_by: loggedUser?.user?.user_id ?? "",
  });

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };
  useEffect(() => {
    // Auto-select project if only one available
    if (userProjects.length === 1 && !formValues.project_id) {
      const singleProject = userProjects[0];
      handleChange("project_id", singleProject.project_id);
      handleChange(
        "hierarchy_node_id",
        singleProject.hierarchyNode?.hierarchy_node_id ?? null
      );
    }

    // Auto-select category if only one available
    if (categories.length === 1 && !formValues.issue_category_id) {
      handleChange("issue_category_id", categories[0].category_id);
    }

    // Auto-select priority if only one available
    if (priorities.length === 1 && !formValues.priority_id) {
      handleChange("priority_id", priorities[0].priority_id);
    }
    // Auto-fill current date/time on initial load
    if (!formValues.issue_occured_time) {
      handleChange("issue_occured_time", maxDateTime);
    }
  }, [userProjects, categories, priorities]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formValues.title,
      project_id: formValues.project_id,
      hierarchy_node_id: formValues.hierarchy_node_id,
      issue_category_id: formValues.issue_category_id,
      priority_id: formValues.priority_id,
      issue_occured_time: formValues.issue_occured_time,
      description: formValues.description,
      url_path: formValues.url_path,
      action_taken: formValues.action_taken_checkbox
        ? formValues.action_taken
        : null,
      attachment_ids: formValues.attachment_id,
      reported_by: loggedUser?.user?.user_id ?? "",
    };

    try {
      if (editData) {
        await updateIssue({ id: editData.issue_id, data: payload }).unwrap();
        toast.success("Issue updated successfully!");
      } else {
        await createIssue(payload).unwrap();
        toast.success("Issue added successfully!");
      }

      setTimeout(() => {
        navigate("/my_issue");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.data?.error || "Something went wrong");
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormValues({
      title: "title",
      project_id: "",
      issue_category_id: "",
      priority_id: "",
      issue_occured_time: "",
      description: "",
      url_path: "",
      action_taken: "",
      action_taken_checkbox: false,
      attachment_ids: [],
    });
  };

  // Form fields
  const fields = [
    { id: "project_id", label: "Select Project", type: "select" },
    { id: "issue_category_id", label: "Select Category", type: "select" },
    { id: "priority_id", label: "Priority Level", type: "select" },
    {
      id: "issue_occured_time",
      label: "Date and Time Issue Happened",
      type: "datetime",
    },
    { id: "action_taken", label: "Action Taken", type: "textarea" },
    { id: "url_path", label: "Add url", type: "url" },
    { id: "description", label: "Description", type: "textarea" },
  ];
  const guidelines = [
    {
      section: "Support Request Guidelines",
      items: [
        {
          text: "Clearly describe what happened and when.",
        },
        {
          text: "Include technical details like errors and device info.",
        },
        {
          text: "Attach screenshots or logs.",
        },
        {
          text: "Select the correct severity level.",
          sub: [
            "Critical – System down or unusable.",
            "High – Major functionality broken.",
            "Medium – Partial functionality affected.",
            "Low – Minor or cosmetic issue.",
          ],
        },
      ],
    },
  ];

  const maxDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  return (
    <>
      <DetailHeader
        className="mb-5 mt-2"
        breadcrumbs={[
          { title: "Support Requests", link: "" },
          { title: "Create New Request", link: "" },
        ]}
      />
      <div className="w-full p-6 bg-white rounded-2xl border border-gray-200 dark:bg-gray-900">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#094C81]">Create New Support Request</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            {/* Dynamic Fields */}
            {fields
              .filter((f) => f.id !== "action_taken")
              .map((field) => (
                <div key={field.id} className="flex h-fit flex-col w-full">
                  <Label className="text-sm font-medium text-[#094C81]">
                    {field.label}
                  </Label>

                  {field.type === "select" && field.id === "project_id" && (
                    <Select
                      value={formValues.project_id}
                      onValueChange={(selectedProjectId) => {
                        const selectedProject = userProjects.find(
                          (p) => p.project_id === selectedProjectId
                        );

                        handleChange("project_id", selectedProjectId);
                        handleChange(
                          "hierarchy_node_id",
                          selectedProject?.hierarchyNode?.hierarchy_node_id ??
                            null
                        );
                      }}
                    >
                      <SelectTrigger className=" border h-10 border-gray-300 bg-white p-2 rounded mt-1 text-gray-700">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>

                      <SelectContent className="text-[#094C81] *: bg-white">
                        {userProjects.map((p) => (
                          <SelectItem key={p.project_id} value={p.project_id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "select" &&
                    field.id === "issue_category_id" && (
                      // if the category list is
                      <Select
                        value={formValues.issue_category_id}
                        onValueChange={(v) =>
                          handleChange("issue_category_id", v)
                        }
                      >
                        <SelectTrigger className=" h-10 border border-gray-300 bg-white p-2 rounded mt-1 text-gray-700">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>

                        <SelectContent className="text-[#094C81] *: bg-white">
                          {categories.map((c) => (
                            <SelectItem
                              key={c.category_id}
                              value={c.category_id}
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {field.type === "select" && field.id === "priority_id" && (
                    <Select
                      value={formValues.priority_id}
                      onValueChange={(value) => {
                        const selectedPriority = priorities.find(
                          (p) => p.priority_id === value
                        );

                        if (
                          selectedPriority?.name?.toLowerCase() === "high" ||
                          selectedPriority?.name?.toLowerCase() === "critical"
                        ) {
                          setTempPriority(selectedPriority.name);
                          setShowPriorityModal(true);
                        } else {
                          handleChange("priority_id", value);
                        }
                      }}
                    >
                      <SelectTrigger className=" h-10 border border-gray-300 bg-white p-2 rounded mt-1  text-gray-700">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>

                      <SelectContent className="text-[#094C81] *: bg-white">
                        {priorities.map((p) => (
                          <SelectItem key={p.priority_id} value={p.priority_id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "datetime" && (
                    <Input
                      id="issue_occured_time"
                      type="datetime-local"
                      max={maxDateTime}
                      className="border text-[#094C81] h-10 max-w-[350px] rounded px-2 py-2"
                      value={formValues.issue_occured_time}
                      onChange={(e) =>
                        handleChange("issue_occured_time", e.target.value)
                      }
                    />
                  )}

                  {field.type === "textarea" && (
                    <TextArea
                      rows={2}
                      placeholder="Enter your action taken"
                      className="border max-w-[350px] rounded px-2 py-2"
                      value={formValues[field.id]}
                      onChange={(e) => handleChange(field.id, e)}
                    />
                  )}

                  {field.type === "url" && (
                    <Input
                      type="url"
                      placeholder="Paste the URL"
                      value={formValues.url_path}
                      onChange={(e) => handleChange("url_path", e.target.value)}
                      className="border h-10 max-w-[350px] rounded px-2 py-2 text-[#094C81]"
                    />
                  )}
                </div>
              ))}

            {/* Action Taken */}
            <div className=" w-full col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex w-full grid-cols-1 flex-col gap-4">
                <div className="flex w-fit gap-2 ">
                  <label className="flex w-fit gap-2 items-center cursor-pointer select-none">
                    {/* Hidden input */}
                    <input
                      type="checkbox"
                      checked={formValues.action_taken_checkbox}
                      onChange={(e) =>
                        handleChange("action_taken_checkbox", e.target.checked)
                      }
                      className="hidden peer"
                    />

                    {/* Custom checkbox UI */}
                    <div
                      className=" h-5 w-5 rounded border border-gray-300 flex items-center justify-center  peer-checked:bg-[#094C81] peer-checked:border-[#094C81] transition-colors
    "
                    >
                      {/* Checkmark */}
                      {formValues.action_taken_checkbox ? (
                        <Check className="text-white" />
                      ) : null}
                    </div>

                    {/* Label */}
                    <span className="text-sm font-medium text-[#094C81]">
                      Have you tried to resolve by yourself?
                    </span>
                  </label>
                </div>

                {formValues.action_taken_checkbox && (
                  <div className="w-full flex flex-col gap-2">
                    <Label className="text-sm  text-start font-medium text-[#094C81]">
                      Please describe the steps you took.
                    </Label>
                    <TextArea
                      rows={3}
                      placeholder="Enter your action taken"
                      className="border w-full max-w-[350px] rounded px-2 py-2"
                      value={formValues.action_taken}
                      onChange={(e) => handleChange("action_taken", e)}
                    />
                  </div>
                )}
              </div>
              {/* File Upload */}
              <div className="w-full grid-cols-1 max-w-[350px]">
                <FileUploadField
                  className=""
                  labelClass="text-sm  text-start w-fit font-medium text-[#094C81]"
                  id="attachment"
                  label="Attach File"
                  value={formValues.attachment_id}
                  onChange={(val) => handleChange("attachment_id", val)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex pr-10  justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 min-w-[150px] rounded text-white bg-[#094C81] hover:bg-[#07385f] transition flex items-center justify-center gap-2 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    
                    Submitting...
                  </>
                ) : editData ? (
                  "Update"
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>

          {/* GUIDELINES */}
          <GuidelinesCard guidelines={guidelines} />
        </div>

        {showPriorityModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
              {/* Title */}
              <h3 className="text-xl font-semibold text-[#094C81] mb-4 flex items-center gap-2">
                Confirm Priority Selection
              </h3>

              {/* Main Message */}
              <p className="text-base text-gray-900 dark:text-gray-200">
                Are you sure your support request is
                <span className="font-bold text-red-600 ml-1">
                  {tempPriority}?
                </span>
              </p>

              {/* Extra Info */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
                Please review the guidelines on the right side of this page to
                ensure the issue priority is correctly selected.
              </p>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setTempPriority("");
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    const priorityObj = priorities.find(
                      (p) => p.name.toLowerCase() === tempPriority.toLowerCase()
                    );
                    handleChange("priority_id", priorityObj?.priority_id);

                    setShowPriorityModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#094C81] text-white hover:bg-[#07385f] transition shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function GuidelinesCard({ guidelines }: { guidelines: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md max-w-2xl w-full mx-auto"
    >
      {/* Header */}
      <h2 className="text-xl font-bold text-[#094C81] mb-4">
        {guidelines[0].section}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Follow these points to help us resolve your issue faster.
      </p>

      {/* Bullet List */}
      <ul className="space-y-4">
        {guidelines[0].items.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-2">
            {/* Main bullet */}
            <div className="flex items-start gap-3">
              <span className="text-[#094C81] mt-1">
                <Check size={18} />
              </span>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                {item.text}
              </p>
            </div>

            {/* Nested bullets */}
            {item.sub && (
              <ul className="ml-8 space-y-1">
                {item.sub.map((subItem: string, subIdx: number) => (
                  <li key={subIdx} className="flex items-start gap-2">
                    <span className="text-[#094C81] mt-0.5">
                      <Dot size={16} />
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {subItem}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
