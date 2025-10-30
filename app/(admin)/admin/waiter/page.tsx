// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   LogOut,
//   Search,
//   Phone,
//   Mail,
//   Badge,
// } from "lucide-react";
// import { WaiterForm } from "@/components/add-waiter-form";

// interface Waiter {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   employeeId: string;
//   status: "active" | "inactive";
//   joinDate: string;
//   shift: "morning" | "afternoon" | "evening";
// }

// interface WaiterManagementProps {
//   user: { name: string; role: string } | null;
//   onLogout: () => void;
// }

// export default function WaiterManagement({
//   user,
//   onLogout,
// }: WaiterManagementProps) {
//   const [waiters, setWaiters] = useState<Waiter[]>([
//     {
//       id: "1",
//       name: "Abebech Tesfaye",
//       email: "Abebech@restaurant.com",
//       phone: "+2519 8765 3210",
//       employeeId: "W001",
//       status: "active",
//       joinDate: "2024-01-15",
//       shift: "morning",
//     },
//     {
//       id: "2",
//       name: "Selam Birhanu",
//       email: "Selam@restaurant.com",
//       phone: "+2519 8765 3211",
//       employeeId: "W002",
//       status: "active",
//       joinDate: "2024-02-20",
//       shift: "afternoon",
//     },
//     {
//       id: "3",
//       name: "Kebede Bekele",
//       email: "Kebede@restaurant.com",
//       phone: "+2519 3765 3211",
//       employeeId: "W003",
//       status: "inactive",
//       joinDate: "2023-12-10",
//       shift: "evening",
//     },
//   ]);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState<
//     "all" | "active" | "inactive"
//   >("all");
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);

//   const filteredWaiters = waiters.filter((waiter) => {
//     const matchesSearch =
//       waiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       waiter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       waiter.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       selectedStatus === "all" || waiter.status === selectedStatus;
//     return matchesSearch && matchesStatus;
//   });

//   const handleAddWaiter = (newWaiter: Omit<Waiter, "id">) => {
//     const waiter: Waiter = {
//       ...newWaiter,
//       id: Date.now().toString(),
//     };
//     setWaiters([...waiters, waiter]);
//     setIsFormOpen(false);
//   };

//   const handleUpdateWaiter = (updatedWaiter: Waiter) => {
//     setWaiters(
//       waiters.map((w) => (w.id === updatedWaiter.id ? updatedWaiter : w))
//     );
//     setEditingWaiter(null);
//     setIsFormOpen(false);
//   };

//   const handleDeleteWaiter = (id: string) => {
//     setWaiters(waiters.filter((w) => w.id !== id));
//   };

//   const handleEditWaiter = (waiter: Waiter) => {
//     setEditingWaiter(waiter);
//     setIsFormOpen(true);
//   };

//   const handleCloseForm = () => {
//     setIsFormOpen(false);
//     setEditingWaiter(null);
//   };

//   const activeWaitersCount = waiters.filter(
//     (w) => w.status === "active"
//   ).length;
//   const totalWaiters = waiters.length;

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b mt-4 border-border bg-card">
//         <div className="flex items-center justify-between px-6 py-4">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground">
//               Waiter Management
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               Manage your restaurant staff
//             </p>
//           </div>
//         </div>
//       </header>

//       <main className="p-6">
//         <div className="mb-6 grid gap-4 md:grid-cols-2">
//           <Card className="border border-border p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Waiters</p>
//                 <p className="text-3xl font-bold text-foreground">
//                   {totalWaiters}
//                 </p>
//               </div>
//             </div>
//           </Card>
//           <Card className="border border-border p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Active Waiters</p>
//                 <p className="text-3xl font-bold text-green-600">
//                   {activeWaitersCount}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* Controls */}
//         <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div className="flex flex-1 gap-4">
//             {/* Search */}
//             <div className="relative flex-1 md:max-w-xs">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name, email, or ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             <div className="flex gap-2">
//               {(["all", "active", "inactive"] as const).map((status) => (
//                 <Button
//                   key={status}
//                   variant={selectedStatus === status ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setSelectedStatus(status)}
//                   className="capitalize"
//                 >
//                   {status}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           <Button
//             onClick={() => {
//               setEditingWaiter(null);
//               setIsFormOpen(true);
//             }}
//             className="gap-2 bg-primary hover:bg-primary/90"
//           >
//             <Plus className="h-4 w-4" />
//             Add Waiter
//           </Button>
//         </div>

//         {isFormOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//             <WaiterForm
//               waiter={editingWaiter}
//               onSave={(w) =>
//                 editingWaiter
//                   ? handleUpdateWaiter(w as Waiter)
//                   : handleAddWaiter(w as Omit<Waiter, "id">)
//               }
//               onClose={handleCloseForm}
//             />
//           </div>
//         )}

//         {/** we will use tanstacks table for cache */}
//         <Card className="border border-border overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-border bg-muted/50">
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Employee ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Shift
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Join Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredWaiters.map((waiter) => (
//                   <tr
//                     key={waiter.id}
//                     className="border-b border-border hover:bg-muted/50 transition-colors"
//                   >
//                     <td className="px-6 py-4 text-sm font-medium text-foreground">
//                       {waiter.name}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">
//                       {waiter.employeeId}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
//                       <Mail className="h-4 w-4" />
//                       {waiter.email}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
//                       <Phone className="h-4 w-4" />
//                       {waiter.phone}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
//                         {waiter.shift}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <span
//                         className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
//                           waiter.status === "active"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {waiter.status === "active" ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">
//                       {new Date(waiter.joinDate).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <div className="flex gap-2">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleEditWaiter(waiter)}
//                           className="gap-2 text-primary hover:bg-primary/10"
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleDeleteWaiter(waiter.id)}
//                           className="gap-2 text-destructive hover:bg-destructive/10"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         {/* Empty State */}
//         {filteredWaiters.length === 0 && (
//           <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
//             <Badge className="mb-4 h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
//               <span className="text-lg">0</span>
//             </Badge>
//             <h3 className="mb-2 text-lg font-semibold text-foreground">
//               No waiters found
//             </h3>
//             <p className="text-sm text-muted-foreground">
//               {searchTerm || selectedStatus !== "all"
//                 ? "Try adjusting your filters"
//                 : "Start by adding your first waiter"}
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
