import { useParams, Link } from 'react-router-dom';
import { useGetIssueCategoryByIdQuery } from '../../redux/services/issueCategoryApi';
import PageMeta from '../../components/common/PageMeta';
import { format } from 'date-fns';
import { useBreadcrumbTitleEffect } from '../../hooks/useBreadcrumbTitleEffect';
import { 
  TagIcon,
  CalendarIcon, 
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/cn/card';

const IssueCategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: issueCategory, isLoading, isError } = useGetIssueCategoryByIdQuery(id!);
  
  // Set breadcrumb title and ID dynamically from API data
  useBreadcrumbTitleEffect(issueCategory?.name, issueCategory?.category_id);

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
          <p className="text-[#1E516A] text-lg">Loading support request category details...</p>
        </div>
      </div>
    );
  }

  if (isError || !issueCategory) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">Support Request Category Not Found</h2>
            <p className="text-gray-600 mb-4">The issue category you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/issueCategory"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Support Request Categories
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${issueCategory.name} - Support Request Category Details`}
        description={`View details for ${issueCategory.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/issue_category"
                className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">Back to Support Request Categories</span>
              </Link>
            </div>
          </div>

          {/* Issue Category Info Card */}
          <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-start gap-3">
                <TagIcon className="h-6 w-6" />
                <CardTitle className="text-[#094C81] text-xl">{issueCategory.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Description */}
              {issueCategory.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1E516A] mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{issueCategory.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Created At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(issueCategory.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Updated At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(issueCategory.updated_at)}
                  </p>
                </div>
              </div>

              {/* Category ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1">
                  Category ID
                </p>
                <p className="text-gray-700 font-medium text-xs break-all">
                  {issueCategory.category_id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
    </>
  );
};

export default IssueCategoryDetail;