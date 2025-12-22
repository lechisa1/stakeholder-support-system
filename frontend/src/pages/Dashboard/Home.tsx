// import React, { useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, LineChart, Line,
// } from "recharts";
// import {
//   MapPin, Building2, Network, Layers, Activity, ArrowRight,
// } from "lucide-react";

// export default function Dashboard() {
//   const [hierarchyStats] = useState([
//     { name: "Central", branches: 1 },
//     { name: "City", branches: 2 },
//     { name: "Subcity", branches: 1 },
//     { name: "Woreda", branches: 1 },
//   ]);

//   const [branchGrowth] = useState([
//     { month: "Jan", total: 1 },
//     { month: "Feb", total: 2 },
//     { month: "Mar", total: 3 },
//     { month: "Apr", total: 4 },
//     { month: "May", total: 5 },
//   ]);

//   const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

//   const recentActivity = [
//     { id: 1, hierarchy: "Central", branch: "Branch 1", action: "Created", color: "text-blue-600" },
//     { id: 2, hierarchy: "City", branch: "Branch 2", action: "Linked to Central", color: "text-green-600" },
//     { id: 3, hierarchy: "City", branch: "Branch 5", action: "Added", color: "text-green-600" },
//     { id: 4, hierarchy: "Subcity", branch: "Branch 3", action: "Connected to City", color: "text-yellow-600" },
//     { id: 5, hierarchy: "Woreda", branch: "Branch 4", action: "Added under Subcity", color: "text-purple-600" },
//   ];

//   return (
//     <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-800">Organization Hierarchy Dashboard</h1>
//       </div>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard title="Total Hierarchies" value="4" icon={<Layers className="text-blue-500" />} />
//         <StatCard title="Total Branches" value="5" icon={<Building2 className="text-green-800" />} />
//         <StatCard title="Main Organization" value="MESOB" icon={<Network className="text-purple-500" />} />
//         <StatCard title="Active Levels" value="Central → Woreda" icon={<MapPin className="text-orange-500" />} />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Bar Chart */}
//         <Card title="Branch Distribution per Hierarchy">
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={hierarchyStats}>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="branches" fill="#2563eb" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Pie Chart */}
//         <Card title="Branch Share by Hierarchy">
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={hierarchyStats}
//                 dataKey="branches"
//                 nameKey="name"
//                 outerRadius={100}
//                 label
//               >
//                 {hierarchyStats.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Line Chart */}
//         <Card title="Branch Growth Over Time">
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={branchGrowth}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </Card>
//       </div>

//       {/* Hierarchy Flow & Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Visual Hierarchy Flow */}
//         <Card title="Hierarchy Flow (Central → City → Subcity → Woreda)">
//           <div className="flex flex-col items-center justify-center gap-3 py-6 text-gray-700 font-medium">
//             <div className="flex items-center gap-2">
//               <div className="bg-blue-100 px-3 py-2 rounded-lg">Central</div>
//               <ArrowRight className="text-gray-400" />
//               <div className="bg-green-100 px-3 py-2 rounded-lg">City</div>
//               <ArrowRight className="text-gray-400" />
//               <div className="bg-yellow-100 px-3 py-2 rounded-lg">Subcity</div>
//               <ArrowRight className="text-gray-400" />
//               <div className="bg-purple-100 px-3 py-2 rounded-lg">Woreda</div>
//             </div>
//             <p className="text-sm text-gray-500">Visual overview of organizational level connection</p>
//           </div>
//         </Card>

//         {/* Activity Timeline */}
//         <Card title="Recent Hierarchy Activities">
//           <ul className="divide-y divide-gray-100">
//             {recentActivity.map((item) => (
//               <li key={item.id} className="py-3 flex items-center gap-3">
//                 <Activity className={`${item.color} flex-shrink-0`} size={18} />
//                 <div>
//                   <p className="text-sm font-medium text-gray-800">
//                     {item.action} — <span className="text-gray-600">{item.branch}</span>
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Hierarchy: {item.hierarchy}
//                   </p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </Card>
//       </div>
//     </div>
//   );
// }

// // --- Reusable Components ---
// interface StatCardProps {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
// }

// function StatCard({ title, value, icon }: StatCardProps) {
//   return (
//     <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
//       <div>
//         <p className="text-gray-500 text-sm">{title}</p>
//         <h3 className="text-xl font-bold text-gray-800">{value}</h3>
//       </div>
//       <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
//     </div>
//   );
// }

// interface CardProps {
//   title: string;
//   children: React.ReactNode;
// }

// function Card({ title, children }: CardProps) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm p-4">
//       <h2 className="font-semibold text-gray-700 mb-3">{title}</h2>
//       {children}
//     </div>
//   );
// }

import React from "react";

function Dashboard() {
  return <div className="p-6 space-y-6 bg-white rounded-2xl border border-gray-200 min-h-screen">
    <h1 className="">Dashboard</h1>
  </div>;
}

export default Dashboard;
