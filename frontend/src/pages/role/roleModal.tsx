import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useTranslation } from "react-i18next";

// Example types
interface Permissions {
  id: string;
  resource: string;
  action: string;
}

interface AddRoleProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "password" | "toggle" | "select" | "textarea" | "checkbox-group";
    placeholder?: string;
    multiple?: boolean;
    options?: { value: string; label: string }[];
    value?: any;
  }>;
}

interface AddRoleInternalProps extends AddRoleProps {
  permissions?: Permissions[];
}

// Example mockPermissions (replace with your real data)
const mockPermissions: Permissions[] = [
  { id: "u1", resource: "User", action: "create" },
  { id: "u1", resource: "User", action: "delete" },
  { id: "u1", resource: "User", action: "update" },
  { id: "u1", resource: "User", action: "read" },
  { id: "p1", resource: "Post", action: "create" },
  { id: "p1", resource: "Post", action: "delete" },
];

export default function AddRole({ onClose, onSubmit, fields }: AddRoleInternalProps) {
  const { t } = useTranslation();

  // Group permissions by resource
  const groupedPermissions = mockPermissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permissions[]>);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, any> = {};

    fields?.forEach((field) => {
      if (field.type === "toggle") {
        values[field.id] = (event.currentTarget.elements.namedItem(field.id) as HTMLInputElement)?.checked;
      } else if (field.type === "checkbox-group") {
        const selected = Array.from(
          event.currentTarget.querySelectorAll(`input[name="${field.id}"]:checked`)
        ).map((input) => (input as HTMLInputElement).value);

        // Convert back to {id, action} format
        values[field.id] = selected.map((v) => {
          const [id, action] = v.split(":");
          return { id, action };
        });
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-2">
          {t("role.add_role")}
        </h2>

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
                ) : field.type === "checkbox-group" ? (
                  <>
                    <Label>{field.label}</Label>
                    <div className="flex flex-col gap-3 mt-2">
                      {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource}>
                          <span className="font-semibold text-[#094C81]">{resource}</span>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {perms.map((perm) => (
                              <label
                                key={perm.id + perm.action}
                                className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                              >
                                <input
                                  type="checkbox"
                                  name={field.id}
                                  value={`${perm.id}:${perm.action}`}
                                  defaultChecked={field.value?.some(
                                    (v: string) => v === `${perm.id}:${perm.action}`
                                  )}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{perm.action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
