import { useParams, Link } from 'react-router-dom';
import { useGetRoleByIdQuery } from '../../redux/services/roleApi';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import { format } from 'date-fns';
import { 
  UserCircleIcon,
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/cn/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table/table';
import DetailHeader from '../../components/common/DetailHeader';

interface RolePermission {
  role_permission_id: string;
  role_id: string;
  permission_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permission: {
    permission_id: string;
    resource: string;
    action: string;
  };
}

interface RoleSubRole {
  sub_role_id?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}



const RoleDetail = () => {
    const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetRoleByIdQuery(id!) 
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return dateString;
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading role details...</p>
        </div>
      </div>
    );
  }
const role = data.data;
  console.log(role?.name,role?.description,role);

  if (isError || !role) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">Role Not Found</h2>
            <p className="text-gray-600 mb-4">The role you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/role"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Roles
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${role.name} - Role Details`}
        description={`View details for ${role.name}`}
      />
    <DetailHeader className="mb-5 mt-2" breadcrumbs={[{ title: "Roles", link: "" }]} />

      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/role"
                className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">Back to Roles</span>
              </Link>
            </div>
          </div>

          {/* Role Info Card */}
          <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-start gap-3">
                <UserCircleIcon className="h-6 w-6" />
                <CardTitle className="text-[#073954] text-xl">{role.name}</CardTitle>
              </div>
              {/* Status Badge */}
              <div className="">
                <Badge
                  variant="light"
                  color={role.is_active ? 'success' : 'error'}
                  size="md"
                  className="text-sm"
                >
                  {role.is_active ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Description */}
              {role.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1E516A] mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{role.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Created At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(role.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Updated At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(role.updated_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1">
                    Role ID
                  </p>
                  <p className="text-gray-700 font-medium text-xs break-all">
                    {role.role_id}
                  </p>
                </div>
              </div>

              {/* Deleted At (if applicable) */}
              {role.deleted_at && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                    Deleted At
                  </p>
                  <p className="text-red-600 font-medium">
                    {formatDate(role.deleted_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-6 w-6" />
                  <CardTitle className="text-[#094C81] text-xl">
                    Permissions ({role.rolePermissions?.length || 0})
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {role.rolePermissions && role.rolePermissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#073954]">
                      <TableRow>
                        <TableHead className="text-white font-semibold">
                          Resource
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Action
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Created At
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Updated At
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {role.rolePermissions.map((permission: RolePermission, index: number) => (
                        <TableRow
                          key={permission.role_permission_id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium text-[#1E516A] capitalize">
                            {permission.permission?.resource || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700 capitalize">
                            {permission.permission?.action || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="light"
                              color={permission.is_active ? 'success' : 'error'}
                              size="sm"
                            >
                              {permission.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {formatDate(permission.created_at)}
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {formatDate(permission.updated_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No permissions found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    This role doesn't have any permissions assigned yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sub-Roles Section */}
          {role.roleSubRoles && role.roleSubRoles.length > 0 && (
            <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
              <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-6 w-6" />
                    <CardTitle className="text-[#094C81] text-xl">
                      Sub-Roles ({role.roleSubRoles.length})
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#073954]">
                      <TableRow>
                        <TableHead className="text-white font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Sub-Role ID
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {role.roleSubRoles.map((subRole: RoleSubRole, index: number) => (
                        <TableRow
                          key={subRole.sub_role_id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium text-[#1E516A]">
                            {subRole.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700 text-xs break-all">
                            {subRole.sub_role_id || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
    </>
  );
};

export default RoleDetail;