import React, { useState, useEffect } from "react";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import {
  useGetInstituteByIdQuery,
  useUpdateInstituteMutation,
  CreateInstituteDto,
} from "../../redux/services/instituteApi";
import {
  useUploadAttachmentsMutation,
  useDeleteAttachmentMutation,
} from "../../redux/services/attachmentApi";
import PageMeta from "../../components/common/PageMeta";
import DetailHeader from "../../components/common/DetailHeader";
import { Card, CardContent } from "../../components/ui/cn/card";
import { Label } from "../../components/ui/cn/label";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Badge from "../../components/ui/badge/Badge";

// ============================================================================
// API INTEGRATION FLAG
// ============================================================================
// Set to true when API is ready to enable actual API calls
const API_INTEGRATION_ENABLED = false;

// ============================================================================
// MOCK DATA (Remove when API is ready)
// ============================================================================
const MOCK_ORGANIZATION = {
  institute_id: "mock-org-1",
  name: "Sample Organization",
  is_active: true,
  logo_url: null, // Set to image URL when available
  logo_attachment_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface OrganizationData {
  institute_id: string;
  name: string;
  is_active?: boolean;
  logo_url?: string | null;
  logo_attachment_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const OrganizationProfile = () => {
  // ============================================================================
  // API HOOKS (Ready for integration - uncomment when API is ready)
  // ============================================================================
  const { data: currentUser, isLoading: userLoading } =
    useGetCurrentUserQuery();
  const instituteId = API_INTEGRATION_ENABLED
    ? currentUser?.institute?.institute_id
    : MOCK_ORGANIZATION.institute_id;

  // TODO: Uncomment when API is ready
  const {
    data: organizationData,
    isLoading: orgLoading,
    isError: orgError,
  } = useGetInstituteByIdQuery(instituteId || "", {
    skip: !instituteId || !API_INTEGRATION_ENABLED,
  });

  const [updateInstitute, { isLoading: isUpdating }] =
    useUpdateInstituteMutation();
  const [uploadAttachments] = useUploadAttachmentsMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoAttachmentId, setLogoAttachmentId] = useState<string | null>(
    null
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isLogoPreviewOpen, setIsLogoPreviewOpen] = useState(false);

  // Use mock data when API is disabled
  const organization: OrganizationData | undefined = API_INTEGRATION_ENABLED
    ? organizationData
    : MOCK_ORGANIZATION;

  const isLoading = API_INTEGRATION_ENABLED
    ? userLoading || orgLoading
    : false;

  const hasError = API_INTEGRATION_ENABLED
    ? orgError || !organization || !instituteId
    : false;

  // ============================================================================
  // INITIALIZE LOGO DATA
  // ============================================================================
  useEffect(() => {
    if (organization) {
      // Initialize logo attachment ID if exists
      if (organization.logo_attachment_id) {
        setLogoAttachmentId(organization.logo_attachment_id);
      }
      // Initialize logo URL if exists
      if (organization.logo_url) {
        setLogoPreview(organization.logo_url);
      }
    }
  }, [organization]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - PNG or SVG preferred
    const allowedTypes = ["image/png", "image/svg+xml"];
    const isAllowedType =
      allowedTypes.includes(file.type) || file.type.startsWith("image/");
    if (!isAllowedType) {
      toast.error("Please upload a PNG or SVG image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate image dimensions (1:1 ratio / square and minimum size)
    const img = new Image();
    img.onload = async () => {
      const isSquare = Math.abs(img.width - img.height) < 10; // Allow 10px tolerance
      const minDimension = 500;
      const meetsMinSize = img.width >= minDimension && img.height >= minDimension;

      if (!isSquare) {
        toast.error(
          `Please upload a square image (1:1 ratio). Current dimensions: ${img.width}x${img.height}`
        );
        return;
      }

      if (!meetsMinSize) {
        toast.error(
          `Image dimensions must be more than ${minDimension}px. Current: ${img.width}x${img.height}`
        );
        return;
      }

      // Image is square, proceed with upload
      setLogoPreview(URL.createObjectURL(file));
      setIsUploadingLogo(true);

      // ============================================================================
      // API INTEGRATION POINT: Logo Upload
      // ============================================================================
      if (API_INTEGRATION_ENABLED) {
        try {
          const result = await uploadAttachments({ files: [file] }).unwrap();
          if (result.attachments.length > 0) {
            setLogoAttachmentId(result.attachments[0].attachment_id);
            toast.success("Logo uploaded successfully");
            // Auto-save logo
            await handleSaveLogo(result.attachments[0].attachment_id);
          }
        } catch (error: unknown) {
          const errorMessage =
            (error as { data?: { message?: string } })?.data?.message ||
            "Failed to upload logo";
        toast.error(errorMessage);
        setLogoPreview(null);
        } finally {
          setIsUploadingLogo(false);
        }
      } else {
        // Mock behavior - simulate successful upload
        // TODO: Remove this when API is ready
        setTimeout(() => {
          setLogoAttachmentId("mock-attachment-id");
          toast.success("Logo uploaded successfully (Mock)");
          setIsUploadingLogo(false);
        }, 500);
      }
    };
    img.onerror = () => {
      toast.error("Failed to load image. Please try again.");
      setIsUploadingLogo(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSaveLogo = async (attachmentId: string) => {
    if (!instituteId) {
      toast.error("Organization not found");
      return;
    }

    // ============================================================================
    // API INTEGRATION POINT: Update Organization Logo
    // ============================================================================
    if (API_INTEGRATION_ENABLED) {
      try {
        // TODO: Update CreateInstituteDto in instituteApi.ts to include logo_attachment_id
        // For now, cast to any to allow logo_attachment_id
        const updateData = {
          logo_attachment_id: attachmentId,
        } as Partial<CreateInstituteDto> & { logo_attachment_id?: string };

        await updateInstitute({
          id: instituteId,
          data: updateData,
        }).unwrap();

        toast.success("Logo updated successfully!");
      } catch (error: unknown) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to update logo";
        toast.error(errorMessage);
      }
    } else {
      // Mock behavior - simulate successful update
      // TODO: Remove this when API is ready
      console.log("Mock Update Logo Payload:", {
        id: instituteId,
        data: {
          logo_attachment_id: attachmentId,
        },
      });
    }
  };

  const handleRemoveLogo = async () => {
    // ============================================================================
    // API INTEGRATION POINT: Logo Removal
    // ============================================================================
    if (API_INTEGRATION_ENABLED && logoAttachmentId) {
      try {
        await deleteAttachment(logoAttachmentId).unwrap();
        setLogoAttachmentId(null);
        
        // Update organization to remove logo
        // TODO: API may need to accept null or empty string for logo_attachment_id
        // For now, send empty payload - adjust based on API requirements
        await updateInstitute({
          id: instituteId!,
          data: {} as Partial<CreateInstituteDto>,
        }).unwrap();
        
        toast.success("Logo removed successfully");
      } catch (error: unknown) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to remove logo";
        toast.error(errorMessage);
        return; // Don't clear state if API call failed
      }
    } else {
      // Mock behavior
      // TODO: Remove this when API is ready
      toast.success("Logo removed successfully (Mock)");
    }

    setLogoPreview(null);
    setLogoAttachmentId(null);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">
            Loading organization profile...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (hasError) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Organization Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {API_INTEGRATION_ENABLED
                ? "You are not associated with any organization, or the organization could not be loaded."
                : "Mock mode: Organization data is not available."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  // ============================================================================
  // LOGO DISPLAY LOGIC
  // ============================================================================
  // Priority: 1. Preview (new upload), 2. Existing logo URL, 3. null
  const displayLogo =
    logoPreview ||
    organization.logo_url ||
    (logoAttachmentId && organization.logo_url) ||
    null;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      <PageMeta
        title={`${organization.name} - Organization Profile`}
        description={`Organization profile for ${organization.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className=" mx-auto space-y-6">
          
          {/* Breadcrumb */}
          <DetailHeader
            breadcrumbs={[{ title: "Organization Profile", link: "" }]}
          />

          {/* Organization Profile Card */}
          <Card className="bg-white rounded-xl border border-[#BFD7EA] shadow-sm">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#094C81]/10 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-[#094C81]" />
                  </div>
                  <div>
                    <h2 className="text-[#094C81] text-2xl font-bold">
                      Organization Profile
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Manage your organization information and logo
                    </p>
                  </div>
                </div>
                <Badge
                  variant="light"
                  color={organization.is_active ? "success" : "error"}
                  size="sm"
                >
                  {organization.is_active ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              {/* Organization Name Section - Read Only */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-[#1E516A] mb-2 block">
                  Organization Name
                </Label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 font-medium text-lg">
                    {organization.name}
                  </p>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-semibold text-[#1E516A]">
                    Organization Logo
                  </Label>
                   
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Logo Preview */}
                  <div className="shrink-0">
                    <div className="relative w-32 h-32 border-2 border-[#BFD7EA] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      {displayLogo ? (
                        <>
                          <img
                            src={displayLogo}
                            alt="Organization Logo"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setIsLogoPreviewOpen(true)}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={isUploadingLogo || isUpdating}
                            className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 border border-red-200 rounded-full p-1 shadow-sm text-red-600 hover:text-red-700 transition"
                            aria-label="Remove logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Upload Area - Narrower width */}
                  <div className="flex-1 ">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/png,image/svg+xml"
                        onChange={handleLogoChange}
                        disabled={isUploadingLogo || isUpdating}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        id="logo-upload"
                      />
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          isUploadingLogo || isUpdating
                            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                            : "border-[#BFD7EA] bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        {isUploadingLogo || isUpdating ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-[#094C81]" />
                            <p className="text-sm text-gray-600">
                              {isUploadingLogo
                                ? "Uploading..."
                                : "Updating..."}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-[#094C81]" />
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload logo
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, SVG • Max 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Guidance Text - Right side */}
                  <div className="flex-1 ">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg h-full">
                      <ul className="space-y-2 text-sm text-[#094C81]">
                        <li className="flex items-start gap-2">
                          <span className="text-[#094C81] font-bold">•</span>
                          <span>
                            <strong>Background:</strong> Transparent preferred
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#094C81] font-bold">•</span>
                          <span>
                            <strong>File Types:</strong> PNG or SVG
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#094C81] font-bold">•</span>
                          <span>
                            <strong>Recommended Dimensions:</strong> At least
                            500 x 500px (square)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#094C81] font-bold">•</span>
                          <span>
                            <strong>Avoid:</strong> Low-resolution, blurry,
                            stretched images
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logo Preview Modal */}
      {isLogoPreviewOpen && displayLogo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsLogoPreviewOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLogoPreviewOpen(false)}
              className="absolute top-3 right-3 bg-white/80 hover:bg-gray-100 rounded-full p-1 shadow"
              aria-label="Close preview"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
            <img
              src={displayLogo}
              alt="Organization Logo Preview"
              className="w-full h-full object-contain bg-gray-50"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizationProfile;

