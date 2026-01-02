import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";

interface AddProjectProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "password" | "toggle" | "select" | "textarea";
    placeholder?: string;
    options?: { value: string; label: string }[];
    multiple?: boolean;
    value?: any;
  }>;
}

export default function AddProject({ onClose, onSubmit, fields }: AddProjectProps) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: Record<string, any> = {};
    fields?.forEach((f) => {
      values[f.id] = f.type === "toggle" ? formValues[f.id] ?? false : formValues[f.id] ?? "";
    });
    onSubmit?.(values);
    onClose();
  };

  const teamFields = fields?.filter((f) => f.type === "select") || [];
  const otherFields = fields?.filter((f) => f.type !== "select") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh] relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
        >✕</button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{t("project.add_project")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t("project.modal_title")}</p>

        <Form onSubmit={handleSubmit} className="space-y-6">
          {/* Other Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherFields.map((field) => (
              <div key={field.id} className="flex flex-col">
                {field.type === "toggle" ? (
                  <Switch
                    label={field.label}
                    id={field.id}
                    defaultChecked={field.value ?? false}
                    onChange={(checked: boolean) => handleChange(field.id, checked)}
                  />
                ) : field.type === "textarea" ? (
                  <>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      defaultValue={field.value ?? ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      type={field.type}
                      id={field.id}
                      placeholder={field.placeholder}
                      defaultValue={field.value ?? ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

    <Label htmlFor="Select Team">Select Project Team</Label>
          {teamFields.length > 0 && (
            <Tab.Group>
              <Tab.List className="flex space-x-2 mb-4 overflow-x-auto">
                {teamFields.map((team) => (
                  <Tab
                    key={team.id}
                    className={({ selected }) =>
                      `px-3 py-1 rounded-md text-sm font-medium transition ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`
                    }
                  >
                    {team.label}
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels>
                {teamFields.map((team) => (
                  <Tab.Panel key={team.id} className="space-y-3">
                    <Label className="block mb-2">Select members for {team.label}</Label>

                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchValues[team.id] ?? ""}
                      onChange={(e) =>
                        setSearchValues((prev) => ({ ...prev, [team.id]: e.target.value }))
                      }
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-white dark:bg-gray-800">
                      {team.options
                        ?.filter((o) =>
                          o.label.toLowerCase().includes((searchValues[team.id] ?? "").toLowerCase())
                        )
                        .map((option) => {
                          const checked = formValues[team.id]?.includes(option.value) ?? false;
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={checked}
                                onChange={(e) => {
                                  const prev = formValues[team.id] || [];
                                  handleChange(
                                    team.id,
                                    e.target.checked
                                      ? [...prev, option.value]
                                      : prev.filter((v: string) => v !== option.value)
                                  );
                                }}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{option.label}</span>
                            </label>
                          );
                        })}
                      {team.options?.filter((o) =>
                        o.label.toLowerCase().includes((searchValues[team.id] ?? "").toLowerCase())
                      ).length === 0 && (
                        <p className="text-gray-400 text-sm p-2">No users found</p>
                      )}
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              {t("common.Cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {t("common.submit")}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
