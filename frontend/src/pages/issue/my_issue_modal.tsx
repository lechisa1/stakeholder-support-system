import React, { useState } from "react";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import DatePickerField from "../../components/form/input/DatePickerField";
import TimePickerField from "../../components/form/input/TimePickerField";
import { useTranslation } from "react-i18next";

interface Field {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "toggle"
    | "select"
    | "textarea"
    | "date"
    | "time"
    | "file";
  placeholder?: string;
  options?: { value: string; label: string }[];
  value?: any;
}

interface AddMyIssueProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Field[];
}

export default function AddIssueCategory({ onClose, onSubmit, fields = [] }: AddMyIssueProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Details" },
    { id: 3, label: "Confirmation" },
  ];

  const stepFields: Record<number, string[]> = {
    1: ["category", "priority_level", "created_date", "created_time", "description", "action_taken"],
    2: ["url", "issue_screenshot"],
  };

  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields.reduce((acc, f) => ({ ...acc, [f.id]: f.value ?? "" }), {})
  );

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      handleNext();
      return;
    }
    if (onSubmit) onSubmit(formValues);
    onClose();
  };

  const basicInfoFields = fields.filter((f) => stepFields[1].includes(f.id));
  const detailsFields = fields.filter((f) => stepFields[2].includes(f.id));
  const visibleFields = currentStep === 3 ? fields : fields.filter((f) => stepFields[currentStep]?.includes(f.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
   <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl p-6 shadow-lg relative overflow-y-auto max-h-[100vh]">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl text-[#094C81] font-bold mb-1">{t("issue_category.add_issue_category")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("issue_category.modal_title")}</p>

    {/* Progress Bar */}
<div className="flex items-center justify-between mb-8 gap-4">
  {steps.map((step) => {
    const isCompleted = currentStep > step.id;
    const isActive = currentStep === step.id;

    return (
      <div key={step.id} className="flex-1 min-w-0 flex flex-col items-center relative">
        {/* Step rectangle */}
        <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded-md px-2">
          {/* Step name */}
          <span className="text-sm font-medium text-center truncate">
            {step.id === 1
              ? "Issue/Bug Info"
              : step.id === 2
              ? "Document Attachment"
              : "Summary Sheet"}
          </span>
        </div>

        {/* Circle indicator */}
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full absolute -translate-y-1/2 ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-[#094C81] text-white"
              : "bg-white border border-gray-300 text-gray-400"
          }`}
        >
          {isCompleted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            step.id
          )}
        </div>
      </div>
    );
  })}
</div>



        <Form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1 & 2 */}
          {currentStep < 3 && (
            <div className={`grid gap-6 ${currentStep === 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {visibleFields.map((field) => (
                <div key={field.id} className="flex flex-col">
                  {field.type === "toggle" ? (
                    <Switch label={field.label} id={field.id} checked={formValues[field.id] ?? false} onChange={(val) => handleChange(field.id, val)} />
                  ) : field.type === "select" ? (
                    <>
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Select id={field.id} options={field.options || []} value={formValues[field.id]} onChange={(val) => handleChange(field.id, val)} />
                    </>
                  ) : field.type === "textarea" ? (
                    <>
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formValues[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </>
                  ) : field.type === "date" ? (
                    <DatePickerField id={field.id} value={formValues[field.id] || null} onChange={(val) => handleChange(field.id, val)} placeholder={field.placeholder} />
                  ) : field.type === "time" ? (
                    <TimePickerField id={field.id} value={formValues[field.id] || null} onChange={(val) => handleChange(field.id, val)} placeholder={field.placeholder} />
                  ) : field.type === "file" ? (
                    <>
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <input
                        type="file"
                        id={field.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange(field.id, file);
                        }}
                        className="w-full border rounded px-3 py-2"
                      />
                    </>
                  ) : (
                    <Input type={field.type as any} id={field.id} name={field.id} placeholder={field.placeholder} value={formValues[field.id]} onChange={(e) => handleChange(field.id, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Two cards */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              {/* Card 1: Basic Info in 2 columns */}
              <div className="bg-white dark:bg-gray-700 border rounded-lg p-4 shadow">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {basicInfoFields.map((field) => (
                    <div key={field.id}>
                      <span className="text-gray-500 dark:text-gray-300">{field.label}</span>
                      <div className="text-gray-900 dark:text-white">
                        {field.type === "toggle"
                          ? formValues[field.id] ? "Yes" : "No"
                          : field.type === "select"
                          ? field.options?.find((o) => o.value === formValues[field.id])?.label || formValues[field.id]
                          : field.type === "file" && formValues[field.id]
                          ? <a href={URL.createObjectURL(formValues[field.id])} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formValues[field.id].name}</a>
                          : formValues[field.id]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Details */}
              <div className="bg-white dark:bg-gray-700 border rounded-lg p-4 shadow">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Details</h3>
                <div className="space-y-2">
                  {detailsFields.map((field) => (
                    <div key={field.id}>
                      <span className="text-gray-500 dark:text-gray-300">{field.label}</span>
                      <div className="text-gray-900 dark:text-white">
                      {field.type === "file" && formValues[field.id] ? (
  (() => {
    const file = formValues[field.id];
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      return <img src={url} alt={file.name} className="max-h-48 mt-2 rounded" />;
    } else if (file.type === "application/pdf") {
      return <embed src={url} type="application/pdf" className="w-full h-64 mt-2" />;
    } else {
      return <span className="mt-2">{file.name}</span>;
    }
  })()
) : (
  formValues[field.id]
)}

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`px-4 py-2 rounded-md transition ${currentStep === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}
            >
              Back
            </button>
            <button type="submit" className="px-4 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800 transition">
              {currentStep === steps.length ? "Submit" : "Next"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
