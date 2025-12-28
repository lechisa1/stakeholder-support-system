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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  myIssueFormSchema,
  type MyIssueFormData,
} from "../../utils/validation/schemas";

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
  const categories = categoryResponse?.data ?? [];

  // API Mutations for create / update
  const [createIssue] = useCreateIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();

  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [tempPriorityId, setTempPriorityId] = useState("");

  // Form state with react-hook-form
  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MyIssueFormData>({
    resolver: zodResolver(myIssueFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
    project_id: editData?.project_id ?? "",
    hierarchy_node_id: editData?.hierarchy_node_id ?? "",
    issue_category_id: editData?.issue_category_id ?? "",
    priority_id: editData?.priority_id ?? "",
      issue_occured_time:
        editData?.issue_occured_time ??
        format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    url_path: editData?.url_path ?? "",
    description: editData?.description ?? "",
    action_taken: editData?.action_taken ?? "",
    action_taken_checkbox: !!editData?.action_taken,
    attachment_id: editData?.attachment_id
      ? Array.isArray(editData.attachment_id)
        ? editData.attachment_id
        : [editData.attachment_id]
      : [],
    },
  });

  const formValues = watch();

  const handleChange = (id: string, value: any) => {
    setValue(id as keyof MyIssueFormData, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  useEffect(() => {
    const currentMaxDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    
    // Auto-select project if only one available and not already set
    if (userProjects.length === 1 && (!formValues.project_id || formValues.project_id === "")) {
      const singleProject = userProjects[0];
      setValue("project_id", singleProject.project_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      
      setValue(
        "hierarchy_node_id",
        singleProject.hierarchyNode?.hierarchy_node_id ?? null,
        { shouldValidate: false }
      );
    }
  
    // Auto-select category if only one available and not already set
    if (categories.length === 1 && (!formValues.issue_category_id || formValues.issue_category_id === "")) {
      setValue("issue_category_id", categories[0].category_id, { shouldValidate: false });
    }
  
    // Auto-select priority if only one available and not already set
    if (priorities.length === 1 && (!formValues.priority_id || formValues.priority_id === "")) {
      setValue("priority_id", priorities[0].priority_id, { shouldValidate: false });
    }
    
    // Auto-fill current date/time on initial load
    if (!formValues.issue_occured_time || formValues.issue_occured_time === "") {
      setValue("issue_occured_time", currentMaxDateTime, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProjects, categories, priorities]);

  // Submit form
  const onSubmit = async (data: MyIssueFormData) => {
    const payload = {
      title: "title",
      project_id: data.project_id,
      hierarchy_node_id: data.hierarchy_node_id,
      issue_category_id: data.issue_category_id,
      priority_id: data.priority_id,
      issue_occured_time: data.issue_occured_time,
      description: data.description,
      url_path: data.url_path,
      action_taken: data.action_taken_checkbox ? data.action_taken : undefined,
      attachment_ids: data.attachment_id || [],
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
        navigate("/my_requests");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string } })?.data?.error ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  // Form fields
  const fields = [
    {
      id: "project_id",
      label: "Select Project",
      type: "select",
      required: true,
    },
    {
      id: "issue_category_id",
      label: "Select Category",
      type: "select",
      required: true,
    },
    {
      id: "priority_id",
      label: "Priority Level",
      type: "select",
      required: true,
    },
    {
      id: "issue_occured_time",
      label: "Date and Time Issue Happened",
      type: "datetime",
      required: true,
    },
    {
      id: "action_taken",
      label: "Action Taken",
      type: "textarea",
      required: true,
    },
    { id: "url_path", label: "Add url", type: "url", required: false },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
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
          <h2 className="text-xl font-bold text-[#094C81]">
            Create New Support Request
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <form
            onSubmit={handleFormSubmit(onSubmit)}
            className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            {/* Dynamic Fields */}
            {fields
              .filter((f) => f.id !== "action_taken")
              .map((field) => (
                <div key={field.id} className="flex h-fit flex-col w-full">
                  <Label className="text-sm font-medium text-[#094C81]">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {field.type === "select" && field.id === "project_id" && (
                    <div className="w-full">
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
                        <SelectTrigger
                          className={`border h-10 bg-white p-2 rounded mt-1 text-gray-700 ${
                          errors.project_id
                            ? "border-red-300"
                            : "border-gray-300"
                          }`}
                        >
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
                      {errors.project_id && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.project_id.message}
                        </p>
                      )}
                    </div>
                  )}

                  {field.type === "select" &&
                    field.id === "issue_category_id" && (
                      // if the category list is
                      <div className="w-full">
                      <Select
                        value={formValues.issue_category_id}
                          onValueChange={(v) =>
                            handleChange("issue_category_id", v)
                          }
                        >
                          <SelectTrigger
                            className={`h-10 border bg-white p-2 rounded mt-1 text-gray-700 ${
                            errors.issue_category_id
                              ? "border-red-300"
                              : "border-gray-300"
                            }`}
                          >
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
                        {errors.issue_category_id && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.issue_category_id.message}
                          </p>
                        )}
                      </div>
                    )}

                  {field.type === "select" && field.id === "priority_id" && (
                    <div className="w-full">
                    <Select
                      value={formValues.priority_id}
                      onValueChange={(value) => {
                          setTempPriorityId(value);
                          setShowPriorityModal(true);
                        }}
                      >
                        <SelectTrigger
                          className={`h-10 border bg-white p-2 rounded mt-1 text-gray-700 ${
                          errors.priority_id
                            ? "border-red-300"
                            : "border-gray-300"
                          }`}
                        >
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>

                        <SelectContent className="text-[#094C81] *: bg-white">
                          {priorities.map((p) => (
                            <SelectItem
                              key={p.priority_id}
                              value={p.priority_id}
                            >
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                      {errors.priority_id && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.priority_id.message}
                        </p>
                      )}
                    </div>
                  )}

                  {field.type === "datetime" && (
                    <div className="w-full">
                    <Input
                      id="issue_occured_time"
                      type="datetime-local"
                        max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                        className={`border text-[#094C81] h-10 rounded px-2 py-2 ${
                          errors.issue_occured_time
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        {...register("issue_occured_time")}
                        value={formValues.issue_occured_time}
                        onChange={(e) =>
                          handleChange("issue_occured_time", e.target.value)
                        }
                        error={!!errors.issue_occured_time}
                        hint={errors.issue_occured_time?.message}
                      />
                    </div>
                  )}

                  {field.type === "textarea" && field.id === "description" && (
                    <div className="w-full">
                    <TextArea
                      rows={2}
                        placeholder="Enter description"
                        className={`border   rounded px-2 py-2 ${
                          errors.description
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        value={formValues.description || ""}
                        onChange={(value) => {
                          handleChange("description", value);
                        }}
                        error={!!errors.description}
                        hint={errors.description?.message}
                      />
                    </div>
                  )}

                  {field.type === "url" && (
                    <Input
                      placeholder="Paste the URL"
                      value={formValues.url_path}
                      onChange={(e) => handleChange("url_path", e.target.value)}
                      className="border h-10   rounded px-2 py-2 text-[#094C81]"
                      error={!!errors.url_path}
                      hint={errors.url_path?.message}
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
                      className={`border w-full max-w-[350px] rounded px-2 py-2 ${
                        errors.action_taken
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      value={formValues.action_taken || ""}
                      onChange={(value) => handleChange("action_taken", value)}
                      error={!!errors.action_taken}
                      hint={errors.action_taken?.message}
                    />
                  </div>
                )}
              </div>
              {/* File Upload */}
              <div className="w-full grid-cols-1 ">
                <FileUploadField
                  className=""
                  labelClass="text-sm  text-start w-fit font-medium text-[#094C81]"
                  id="attachment"
                  label="Attach File"
                  value={formValues.attachment_id || []}
                  onChange={(val) => handleChange("attachment_id", val)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex  justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 min-w-[150px] rounded text-white bg-[#094C81] hover:bg-[#07385f] transition flex items-center justify-center gap-2 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>Submitting...</>
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

        {showPriorityModal &&
          (() => {
            const selectedPriority = priorities.find(
              (p) => p.priority_id === tempPriorityId
            );

            return (
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
                      {selectedPriority?.name}?
                </span>
              </p>

              {/* Extra Info */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
                    This Priority is for {selectedPriority?.description || "N/A"} and it will be resolved in {selectedPriority?.response_duration || "N/A"} {selectedPriority?.response_unit || ""}
              </p>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                        setTempPriorityId("");
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                        if (selectedPriority?.priority_id) {
                          handleChange("priority_id", selectedPriority.priority_id);
                        }
                    setShowPriorityModal(false);
                        setTempPriorityId("");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#094C81] text-white hover:bg-[#07385f] transition shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
            );
          })()}
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
