import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRightIcon } from "lucide-react";
import { breadcrumbConfig } from "../../utils/breadcrumbConfig";
import { useBreadcrumbTitle } from "../../contexts/BreadcrumbContext";

const HeaderBreadcrumb = () => {
  const location = useLocation();
  const params = useParams();
  const { dynamicBreadcrumb, dynamicTitles } = useBreadcrumbTitle();
  
  // Find matching route (handle dynamic routes like /users/:id)
  const getBreadcrumbs = () => {
    const pathname = location.pathname;
    
    // Try exact match first
    if (breadcrumbConfig[pathname]) {
      return breadcrumbConfig[pathname];
    }
    
    // Try to match dynamic routes (e.g., /users/:id, /institute/:id/projects/:projectId)
    for (const [route, breadcrumbs] of Object.entries(breadcrumbConfig)) {
      const routePattern = route.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${routePattern}$`);
      
      if (regex.test(pathname)) {
        // Extract all parameter names from the route pattern (e.g., ["id", "projectId"])
        const paramNames = route.match(/:[^/]+/g)?.map(p => p.slice(1)) || [];
        
        // Replace dynamic segments in breadcrumbs
        return breadcrumbs.map((crumb, index) => {
          const isLastBreadcrumb = index === breadcrumbs.length - 1;
          
          if (crumb.path === "") {
            // Only apply dynamic title to the last breadcrumb
            if (isLastBreadcrumb) {
              return { 
                ...crumb, 
                title: dynamicBreadcrumb.title || crumb.title || "Details" 
              };
            }
            // For non-last breadcrumbs with empty path, keep original title
            return crumb;
          }
          
          // Replace all dynamic parameters in the path
          let crumbPath = crumb.path;
          
          // Replace each parameter found in the route (e.g., :id, :projectId, :instituteId)
          paramNames.forEach((paramName) => {
            const paramValue = params[paramName];
            if (paramValue && crumbPath.includes(`:${paramName}`)) {
              crumbPath = crumbPath.replace(`:${paramName}`, paramValue);
            }
          });
          
          // Also handle generic :id as fallback for backward compatibility
          if (params.id && crumbPath.includes(":id") && !paramNames.includes("id")) {
            crumbPath = crumbPath.replace(":id", params.id);
          }
          
          // Handle dynamic titles for middle breadcrumbs (e.g., institute name, project name)
          let crumbTitle = crumb.title;
          
          // After replacing parameters, check if we have a dynamic title for any ID in the resolved path
          // For example, if crumbPath is now "/inistitutes/123", check if we have a title for ID "123"
          paramNames.forEach((paramName) => {
            const paramValue = params[paramName];
            if (paramValue && dynamicTitles[paramValue]) {
              // Check if the resolved crumbPath contains this parameter value
              // This means this breadcrumb is for the entity with this ID
              if (crumbPath.includes(`/${paramValue}`) || crumbPath.endsWith(`/${paramValue}`)) {
                // Use the stored title if this is a detail breadcrumb
                if (crumbTitle === "Institute Details" || crumbTitle === "Project Details" || 
                    crumbTitle === "Organization Details" || crumbTitle.startsWith("/")) {
                  crumbTitle = dynamicTitles[paramValue];
                }
              }
            }
          });
          
          // Fallback: use dynamicBreadcrumb.title if it matches the current breadcrumb's context
          if ((crumbTitle === "Institute Details" || crumbTitle.startsWith("/")) && dynamicBreadcrumb.title) {
            // Check if this is the institute detail breadcrumb
            if (crumbPath.includes("/inistitutes/") && crumbPath.match(/\/inistitutes\/[^/]+$/)) {
              crumbTitle = dynamicBreadcrumb.title;
            }
          }
          
          return { ...crumb, path: crumbPath, title: crumbTitle };
        });
      }
    }
    
    // Try to match nested routes by checking if pathname starts with configured routes
    // This handles cases like /basedata/request-category/Network
    const pathSegments = pathname.split("/").filter(Boolean);
    for (let i = pathSegments.length; i > 0; i--) {
      const partialPath = "/" + pathSegments.slice(0, i).join("/");
      if (breadcrumbConfig[partialPath]) {
        const baseBreadcrumbs = breadcrumbConfig[partialPath];
        const remainingSegments = pathSegments.slice(i);
        
        // Build breadcrumbs for remaining segments
        let currentPath = partialPath;
        const nestedBreadcrumbs = [...baseBreadcrumbs];
        
        remainingSegments.forEach((segment, idx) => {
          currentPath += `/${segment}`;
          const isLast = idx === remainingSegments.length - 1;
          // Use dynamic title for the last segment if available
          const title = isLast && dynamicBreadcrumb.title 
            ? dynamicBreadcrumb.title 
            : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ").replace(/_/g, " ");
          nestedBreadcrumbs.push({
            title,
            path: isLast ? "" : currentPath,
          });
        });
        
        return nestedBreadcrumbs;
      }
    }
    
    // Default breadcrumb for unknown routes
    const segments = pathname.split("/").filter(Boolean);
    const defaultBreadcrumbs: Array<{ title: string; path: string }> = [];
    
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      // Use dynamic title for the last segment if available
      const title = isLast && dynamicBreadcrumb.title 
        ? dynamicBreadcrumb.title 
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ").replace(/_/g, " ");
      defaultBreadcrumbs.push({
        title,
        path: isLast ? "" : currentPath,
      });
    });
    
    return defaultBreadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumb on home/dashboard
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="flex items-center gap-1.5 text-base">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {crumb.path && crumb.path !== "" ? (
            <Link
              to={crumb.path}
              className="text-[#094C81] hover:font-medium hover:text-[#073954] transition-colors"
            >
              {crumb.title}
            </Link>
          ) : (
            <span className="text-gray-800 dark:text-white/90 font-medium">
              {crumb.title}
            </span>
          )}
          {index < breadcrumbs.length - 1 && (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
};

export default HeaderBreadcrumb;

