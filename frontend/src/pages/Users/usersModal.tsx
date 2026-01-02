import { useState } from "react";
import { useTranslation } from "react-i18next";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

// Mock Data
const mockHierarchies = [
  { id: "h1", hierarchy_name: "Central" },
  { id: "h2", hierarchy_name: "City", parent_hierarchy_id: "h1" },
  { id: "h3", hierarchy_name: "Subcity", parent_hierarchy_id: "h2" },
  { id: "h4", hierarchy_name: "Woreda", parent_hierarchy_id: "h3" },
];

const mockBranches = [
  { id: "b001", organization_name: "MESOB", hierarchy_id: "h1", branch_name: "Branch 1" },
  { id: "b002", organization_name: "MESOB", hierarchy_id: "h2", branch_name: "Branch 2" },
  { id: "b005", organization_name: "MESOB", hierarchy_id: "h2", branch_name: "Branch 5" },
  { id: "b003", organization_name: "MESOB", hierarchy_id: "h3", branch_name: "Branch 3" },
  { id: "b004", organization_name: "MESOB", hierarchy_id: "h4", branch_name: "Branch 4" },
];

const mockRoles = [
  { id: "1", name: "Admin" },
  { id: "2", name: "Developer" },
  { id: "3", name: "Team Leader" },
  { id: "4", name: "Quality Assurance" },
  { id: "5", name: "Mobile App Developer" },
  { id: "6", name: "Director" },
  { id: "7", name: "IT Support" },
];

interface AddUserProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "password" | "select" | "textarea" | "number";
    placeholder?: string;
    options?: { value: string; label: string }[];
    value?: any;
  }>;
}

export default function AddUser({ onClose, onSubmit, fields }: AddUserProps) {
  const { t } = useTranslation();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userType, setUserType] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Record<string, string>>({}); // hierarchy_id -> branch_id

  // --- Role Handlers ---
  const handleRoleToggle = (role: string) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const handleSelectAll = () => setSelectedRoles(mockRoles.map((r) => r.name));
  const handleDeselectAll = () => setSelectedRoles([]);

  // --- Hierarchy + Branch Handler ---
  const handleBranchSelect = (hierarchyId: string, branchId: string) => {
    // Set selected branch for this hierarchy
    const updated = { ...selectedBranches, [hierarchyId]: branchId };

    // Remove children branch selections
    const removeChildren = (parentId: string) => {
      Object.entries(updated).forEach(([hId]) => {
        const h = mockHierarchies.find(h => h.id === hId);
        if (h?.parent_hierarchy_id === parentId) {
          delete updated[hId];
          removeChildren(hId);
        }
      });
    };
    removeChildren(hierarchyId);

    setSelectedBranches(updated);
  };

  // --- Dynamic Hierarchy + Branch Renderer ---
  const renderHierarchyBranchSelectors = () => {
    const selects: JSX.Element[] = [];
    let parentId: string | undefined = undefined;

    while (true) {
      const children = mockHierarchies.filter(h => h.parent_hierarchy_id === parentId);
      if (!children.length) break;

      const hierarchy = children[0]; // Assuming only one per parent
      const hierarchyId = hierarchy.id;

      // Branch options for this hierarchy
      const branches = mockBranches.filter(
        (b) => b.organization_name === organization && b.hierarchy_id === hierarchyId
      );

      if (!branches.length) break;

      selects.push(
        <div key={hierarchyId} className="mb-4">
          <Label>{hierarchy.hierarchy_name}</Label>
          <Select
            options={branches.map(b => ({ value: b.id, label: b.branch_name }))}
            placeholder={`Select ${hierarchy.hierarchy_name} branch`}
            defaultValue={selectedBranches[hierarchyId] || ""}
            onChange={(v) => handleBranchSelect(hierarchyId, v)}
          />
        </div>
      );

      parentId = hierarchyId;
      if (!selectedBranches[hierarchyId]) break; // stop if branch not selected
    }

    return selects;
  };

  // --- Form Submit ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: Record<string, any> = {};

    fields?.forEach((field) => {
      if (field.id === "organization_name" && userType === "internal") return;
      values[field.id] = formData.get(field.id);
    });

    values.user_type = userType;
    values.organization_name = organization;

    // Pass the last selected branch (deepest level)
    const branchIds = Object.values(selectedBranches).filter(Boolean);
    values.branch_id = branchIds.length ? branchIds[branchIds.length - 1] : null;

    values.roles = selectedRoles;

    if (onSubmit) onSubmit(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#094C81] mb-1">
          {t("user.add_user") || "Add User"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">Fill the user information carefully</p>

        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {fields?.map((field) => {
              if (field.id === "organization_name" && userType === "internal") return null;
              return (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === "select" ? (
                    <Select
                      options={field.options || []}
                      placeholder={field.placeholder}
                      defaultValue={field.value ?? ""}
                      onChange={(value) => {
                        if (field.id === "user_type") setUserType(value);
                        if (field.id === "organization_name") {
                          setOrganization(value);
                          setSelectedBranches({});
                        }
                      }}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      defaultValue={field.value ?? ""}
                    />
                  )}
                </div>
              );
            })}

            {/* --- Hierarchy Branch Selectors --- */}
            {organization && renderHierarchyBranchSelectors()}
          </div>

          {/* --- Roles --- */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#094C81]">
                Roles <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-4 text-sm font-medium text-[#094C81]">
                <button type="button" onClick={handleSelectAll} className="hover:underline">
                  Select All
                </button>
                <button type="button" onClick={handleDeselectAll} className="hover:underline">
                  Deselect All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-1">
              <div className="flex flex-col gap-1">
                {mockRoles.slice(0, Math.ceil(mockRoles.length / 2)).map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150 cursor-pointer ${
                      selectedRoles.includes(role.name)
                        ? "border-[#094C81] bg-[#E8F2FA]"
                        : "border-gray-300 hover:border-[#94C1E8]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="accent-[#094C81] h-4 w-4"
                    />
                    <span className="text-gray-800 dark:text-gray-100 text-sm font-medium">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>

              <div className="w-px bg-gray-300" />

              <div className="flex flex-col gap-2">
                {mockRoles.slice(Math.ceil(mockRoles.length / 2)).map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150 cursor-pointer ${
                      selectedRoles.includes(role.name)
                        ? "border-[#094C81] bg-[#E8F2FA]"
                        : "border-gray-300 hover:border-[#94C1E8]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="accent-[#094C81] h-4 w-4"
                    />
                    <span className="text-gray-800 dark:text-gray-100 text-sm font-medium">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* --- Buttons --- */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800"
            >
              Save
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
