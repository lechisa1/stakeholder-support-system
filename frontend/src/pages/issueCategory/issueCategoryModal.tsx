import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useTranslation } from "react-i18next";

interface AddIssueCategoryProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "password" | "toggle" | "select" | "textarea";
    placeholder?: string;
    options?: { value: string; label: string }[];
    value?: any; 
  }>;
}


export default function AddIssueCategory({
  onClose,
  onSubmit,   // 
  fields,
}: AddIssueCategoryProps) {
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

    if (onSubmit) {
      onSubmit(values);
    }

    onClose();
  };
console.log("field",fields)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-2">
          {t("issue_category.add_issue_category")}
        </h2>
        <h6 className="text-sm text-[#094C81] mb-4">
          {t("issue_category.modal_title")}
        </h6>

       <Form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 gap-6">
    {fields?.map((field) => (
      <div key={field.id}>
        {field.type === "toggle" ? (
          <Switch label={field.label} id={field.id} defaultChecked={field.value ?? false} />
        ) : field.type === "select" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              id={field.id}
              options={field.options || []}
              placeholder={field.placeholder}
              defaultValue={field.value ?? ""}
            />
          </>
        ) : field.type === "textarea" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <textarea
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              defaultValue={field.value ?? ""}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </>
        ) : (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              type={field.type}
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              defaultValue={field.value ?? ""}
            />
          </>
        )}
      </div>
    ))}
  </div>

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
