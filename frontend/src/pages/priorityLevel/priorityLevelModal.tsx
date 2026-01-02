import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useTranslation } from "react-i18next";

interface AddPriorityLevelProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "password" | "toggle" | "select" | "textarea" | "number" | "color";
    placeholder?: string;
    options?: { value: string; label: string }[];
    value?: any; 
  }>;
}

export default function AddPriorityLevel({ onClose, onSubmit, fields }: AddPriorityLevelProps) {
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, any> = {};

    fields?.forEach((field) => {
      if (field.type === "toggle") {
        values[field.id] = (event.currentTarget.elements.namedItem(field.id) as HTMLInputElement)?.checked;
      } else {
        values[field.id] = formData.get(field.id);
      }
    });

    if (onSubmit) onSubmit(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl text-[#094C81] font-semibold mb-2">{t("priority_level.add_priority_level")}</h2>
        <h6 className="text-sm text-[#094C81] mb-4">{t("priority_level.modal_title")}</h6>

        <Form onSubmit={handleSubmit} className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields?.map((field) => {
              if (field.type === "toggle") {
                return <Switch key={field.id} label={field.label} id={field.id} defaultChecked={field.value ?? false} />;
              }

              if (field.type === "color") {
                return (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <input
                      type="color"
                      id={field.id}
                      name={field.id}
                      defaultValue={field.value ?? "#000000"}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Select id={field.id} options={field.options || []} placeholder={field.placeholder} defaultValue={field.value ?? ""} />
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.id} className="flex flex-col">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <textarea
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      defaultValue={field.value ?? ""}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                );
              }

              // Text, number, email, password
              return (
                <div key={field.id} className="flex flex-col">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    defaultValue={field.value ?? ""}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
