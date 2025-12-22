export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  position?: string;
  profile_image?: string;
  user_type: string;
  institute?: {
    institute_id: string;
    name: string;
  } | null;
  roles: {
    project_user_role_id: string;
    role?: {
      role_id: string;
      name: string;
      subRoles: {
        subRole: {
          sub_role_id: string;
          name: string;
        };
        permissions: {
          permission_id: string;
          resource: string;
          action: string;
        }[];
      }[];
    } | null;
    subRole?: {
      sub_role_id: string;
      name: string;
    } | null;
  }[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email?: string;
  user_name?: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void> | void;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<any>;
  clearError: () => void;

  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

// Add this:
export const PERMISSIONS = {
  REPORTS: "REPORTS",
  AUDIT_LOGS_VIEW: "AUDIT_LOGS_VIEW",
  FINANCIAL_REPORTS: "FINANCIAL_REPORTS",
  // Add other permissions as needed
};
