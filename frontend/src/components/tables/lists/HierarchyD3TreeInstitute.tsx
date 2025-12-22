import React, { useRef, useEffect, useState, useMemo } from 'react';
import Tree from 'react-d3-tree';
import Label from '../../form/Label';
import { Select, SelectTrigger } from '../../ui/cn/select';
import { SelectItem, SelectContent, SelectValue } from '../../ui/cn/select';
import { useParams } from 'react-router-dom';
import { CreateInstituteHierarchyNodeModal } from '../../modals/CreateInstituteHierarchyNodeModal';
import { shortenText } from '../../../utils/shortenText';
import AssignInternalUsersToProjectHierarchyModal from '../../modals/AssignInternalUsersToProjectHierarchyModal';
import { useGetInternalUsersAssignedToProjectQuery } from '../../../redux/services/userApi';

// ---------------------------
// Types
// ---------------------------
interface TreeNode {
  internal_node_id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  is_active?: boolean;
  level?: number;
  project?: {
    name?: string;
  };
  children?: TreeNode[];
}

interface D3TreeNode {
  name: string;
  attributes: {
    internal_node_id: string;
    description?: string;
    project?: string;
    level?: number;
    is_active: boolean;
  };
  children?: D3TreeNode[];
}

interface HierarchyD3TreeProps {
  data: TreeNode[];
  isLoading?: boolean;
  isAssignUsersToStructure?: boolean;
}

function convertToD3Tree(nodes: TreeNode[]): D3TreeNode[] {
  return nodes.map((node) => ({
    name: node.name || 'Unnamed Node',
    attributes: {
      internal_node_id: node.internal_node_id,
      description: node.description || '',
      project: node.project?.name || '',
      level: node.level ?? 0,
      is_active: node.is_active ?? true,
    },
    children: node.children && node.children.length > 0
      ? convertToD3Tree(node.children)
      : undefined,
  }));
}

interface CustomNodeProps {
  nodeDatum: D3TreeNode & { __rd3t?: { collapsed?: boolean } };
  toggleNode: () => void;
  setModalOpen: (open: boolean) => void;
  setSelectedParentNodeId: (id: string) => void;
  isAssignUsersToStructure: boolean;
  setIsAssignUsersModalOpen: (open: boolean) => void;
  setParentNodeName: (name: string) => void;
  // Users assigned to this internal node (by internal_node_id)
  assignedUsers?: string[];
}

const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  setModalOpen,
  setSelectedParentNodeId,
  setIsAssignUsersModalOpen,
  isAssignUsersToStructure,
  setParentNodeName,
  assignedUsers = [],
}) => {
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const isActive = nodeDatum.attributes.is_active;
  const isCollapsed = nodeDatum.__rd3t?.collapsed ?? false;
  const [hovered,setHovered] = useState(false);
  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/issue_configuration/${nodeDatum.attributes.internal_node_id}`;
  };
  //  show some side modal when it is hovered
  useEffect(() => {
    if (!hovered) {
      setHovered(false);
    }
  }, [hovered]);
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };
  return (
    <>
    <g onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {hasChildren && (
        <g transform={`translate(-160, -70)`}>
          <foreignObject x={-10} y={-10} width={20} height={20}>
            <button
              onClick={toggleNode}
              className="w-5 h-5 rounded-full bg-[#094C81] hover:bg-[#073954] text-white font-semibold flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm"
            >
              {isCollapsed ? '+' : '−'}
            </button>
          </foreignObject>
        </g>
        
      )}

 
      <foreignObject x={-150} y={-90} width={300} height={150}>
        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-lg hover:border-[#094C81] hover:shadow-xl transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-[#094C81] text-base font-semibold flex-1 pr-2 line-clamp-2">
              {nodeDatum.name.length > 28 ? `${nodeDatum.name.substring(0, 28)}...` : nodeDatum.name}
            </h3>
            <span
              className={`px-3 py-1 flex items-center justify-center rounded-full text-xs font-semibold text-white whitespace-nowrap ${
                isActive
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              
              {isActive ? <span className="text-green-900 text-xs font-semibold">Active</span> : <span className="text-red-900 text-xs font-semibold">Inactive</span>}
            </span>
          </div>

          {nodeDatum.attributes.description && (
            <p className="text-gray-600 w-full text-sm font-bold text-center mb-3 line-clamp-3">
              {shortenText(nodeDatum.attributes.description, 25)}
            </p>
          )}

          <div className="flex flex-row justify-center gap-3">
            <button
              onClick={handleViewDetailsClick}
              className="flex-1 bg-[#094C81] hover:bg-[#073954] text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-xs"
            >
              Details
            </button>        
            {isAssignUsersToStructure ? (
              <button
                onClick={() => {
                  setSelectedParentNodeId(nodeDatum.attributes.internal_node_id);
                  setParentNodeName(nodeDatum.name);
                  setIsAssignUsersModalOpen(true);
                }}
                className="flex-1 bg-[#094C81] hover:bg-[#073954] text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-xs"
              >
                Assign Users
              </button>
            ):(<button
              onClick={() => {
                setSelectedParentNodeId(nodeDatum.attributes.internal_node_id);
                setModalOpen(true);
              }}
              className="flex-1 bg-[#094C81] hover:bg-[#073954] text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-xs"
            >
              Add Child
            </button>)}
          </div>
        </div>
      </foreignObject>
      {hovered && assignedUsers.length > 0 && (
  <foreignObject
    x={160}
    y={-90}
    width={200}
    height={Math.min(300, 100 + assignedUsers.length * 24)} // max height 300
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto', // enable scroll
        WebkitOverflowScrolling: 'touch', // smooth scroll on touch devices
      }}
      className="bg-white rounded-xl border border-gray-200 shadow-xl p-4"
    >
      <p className="text-sm text-center font-semibold text-[#094C81]">Assigned Users</p>
      <ul className="text-sm text-gray-700 mt-2 space-y-1">
        {assignedUsers.map((fullName) => (
          <li
          key={fullName}
          className="flex items-center gap-2 text-gray-800 text-sm"
        >
          <span className="w-2 h-2 bg-[#094C81] rounded-full"></span>
          {fullName}
        </li>
        ))}
      </ul>
    </div>
  </foreignObject>
)}
    </g>

    </>
  );
};

const HierarchyD3TreeInstitute: React.FC<HierarchyD3TreeProps> = ({ data, isLoading = false , isAssignUsersToStructure = false}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedRootNodeId, setSelectedRootNodeId] = useState<string>('');
  const [selectedParentNodeId, setSelectedParentNodeId] = useState<string | null>(null);
  const { id: project_id } = useParams<{ id: string }>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [parentNodeName, setParentNodeName] = useState<string>('');

  const { data: usersData } = useGetInternalUsersAssignedToProjectQuery(
    project_id || '',
    {
      skip: !project_id,
    }
  );

  // Map internal_node_id -> array of user full_names
  const internalNodeUsersMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (usersData && Array.isArray(usersData.data)) {
      usersData.data.forEach(
        (assignment: {
          internal_node_id: string;
          user?: { full_name?: string };
        }) => {
        const internalNodeId = assignment.internal_node_id;
        const fullName = assignment.user?.full_name;
        if (!internalNodeId || !fullName) return;
        if (!map[internalNodeId]) {
          map[internalNodeId] = [];
        }
        map[internalNodeId].push(fullName);
      }
      );
    }
    return map;
  }, [usersData]);
  const buildTree = (nodes: TreeNode[]): TreeNode[] => {
    if (!nodes || nodes.length === 0) return [];
    const nodeMap = new Map<string, TreeNode>();
    nodes.forEach((node) => nodeMap.set(node.internal_node_id, { ...node, children: [] }));
    const tree: TreeNode[] = [];
    nodes.forEach((node) => {
      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id);
        if (parent && parent.children) parent.children.push(nodeMap.get(node.internal_node_id)!);
      } else {
        tree.push(nodeMap.get(node.internal_node_id)!);
      }
    });
    return tree;
  };

  const { d3TreeData, rootNodeOptions } = useMemo(() => {
    if (!data || data.length === 0) return { d3TreeData: null, rootNodeOptions: [] };
    const treeNodes = buildTree(data);
    const converted = convertToD3Tree(treeNodes);
    const options = treeNodes.map((node) => ({ value: node.internal_node_id, label: `${node.name}${node.project?.name ? ` (${node.project.name})` : ''}` }));
    return { d3TreeData: converted, rootNodeOptions: options };
  }, [data]);

  useEffect(() => {
    if (rootNodeOptions.length > 0 && (!selectedRootNodeId || !rootNodeOptions.find(opt => opt.value === selectedRootNodeId))) {
      setSelectedRootNodeId(rootNodeOptions[0].value);
    }
  }, [rootNodeOptions, selectedRootNodeId]);

  const selectedD3TreeData = useMemo(() => {
    if (!d3TreeData || !selectedRootNodeId || !Array.isArray(d3TreeData)) return null;
    const selected = d3TreeData.find((node) => node.attributes.internal_node_id === selectedRootNodeId);
    return selected ? [selected] : null;
  }, [d3TreeData, selectedRootNodeId]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: 80 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [selectedD3TreeData]);

  if (isLoading) return (<div className="flex items-center justify-center py-12 min-h-[400px]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div><p className="text-[#1E516A] text-lg">Loading hierarchy tree...</p></div></div>);

  if (!d3TreeData || (Array.isArray(d3TreeData) && d3TreeData.length === 0)) return (<div className="flex items-center justify-center py-12 min-h-[400px]"><div className="text-center"><p className="text-gray-500 text-lg font-medium">No hierarchy nodes found</p><p className="text-gray-400 text-sm mt-2">Create a hierarchy node to get started.</p></div></div>);

  return (
    <div className="w-full space-y-4">
      <div ref={containerRef} className="w-full h-full min-h-[600px] bg-[#F9FBFC] rounded-lg border border-gray-200 overflow-hidden" style={{ position: 'relative' }}>
        {rootNodeOptions.length > 1 && (
          <div className=" w-[350px] rounded-lg  p-4">
            <Label className="text-[#094C81] text-sm font-medium">Select Root Node</Label>
            <Select value={selectedRootNodeId} onValueChange={(value) => setSelectedRootNodeId(value)}>
              <SelectTrigger className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"> 
                <SelectValue placeholder="Select a root node to display" />
              </SelectTrigger>
              <SelectContent>
                {rootNodeOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

        <style>{`.rd3t-link { stroke: #94A3B8 !important; stroke-width: 2.5px !important; fill: none !important; }`}</style>

        {selectedD3TreeData ? (
          <>
            <div id="tree-container" className="w-full h-full" style={{ width: '100%', height: dimensions.height || '600px' }}>
              <Tree
                data={selectedD3TreeData}
                translate={translate}
                orientation="vertical"
                pathFunc="straight"
                separation={{ siblings: 2.5, nonSiblings: 2 }}
                nodeSize={{ x: 220, y: 250 }}
                zoom={0.75}
                scaleExtent={{ min: 0.1, max: 2 }}
                enableLegacyTransitions={true}
                transitionDuration={300}
                renderCustomNodeElement={(rd3tProps: { nodeDatum: unknown; toggleNode: () => void }) => {
                  const nodeDatum = rd3tProps.nodeDatum as D3TreeNode & { __rd3t?: { collapsed?: boolean } };
                  const assignedUsers =
                    internalNodeUsersMap[nodeDatum.attributes.internal_node_id] || [];
                  return (
                    <CustomNode
                      isAssignUsersToStructure={isAssignUsersToStructure}
                      setSelectedParentNodeId={setSelectedParentNodeId}
                      setModalOpen={setModalOpen}
                      setIsAssignUsersModalOpen={setIsAssignUsersModalOpen}
                      setParentNodeName={setParentNodeName}
                      nodeDatum={nodeDatum}
                      toggleNode={rd3tProps.toggleNode}
                      assignedUsers={assignedUsers}
                    />
                  );
                }}
              />
            </div>
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-[#094C81] mb-2">Controls:</p>
                <p>• Scroll to zoom</p>
                <p>• Drag to pan</p>
                <p>• Click nodes to expand/collapse</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12 min-h-[400px]"><div className="text-center"><p className="text-gray-500 text-lg font-medium">No root node selected</p><p className="text-gray-400 text-sm mt-2">Please select a root node from the dropdown above.</p></div></div>
        )}
      </div>
      <CreateInstituteHierarchyNodeModal
        parent_hierarchy_node_id={selectedParentNodeId}
        isOpen={isModalOpen}
        onClose={() => { setModalOpen(false); setSelectedParentNodeId(null); }}
      />
      <AssignInternalUsersToProjectHierarchyModal
        parent_node_id={selectedParentNodeId || ''}
        project_id={project_id || ''}
        isOpen={isAssignUsersModalOpen}
        parent_node_name={parentNodeName || ''}
        onClose={() => { setIsAssignUsersModalOpen(false); setSelectedParentNodeId(null); }}
      />
    </div>
  );
};

export default HierarchyD3TreeInstitute;
