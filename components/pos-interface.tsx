"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { LogOut } from "lucide-react";
import { MenuBrowser, MenuItem } from "./menu-browser";
import { OrderSummary } from "./order-summary";
import { OrdersView } from "./order-view";

interface POSInterfaceProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}
interface posItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
export function POSInterface({ user, onLogout }: POSInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"order" | "orders">("order");
  const [selectedRoom, setSelectedRoom] = useState<string>("VIP-1");
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [cartItems, setCartItems] = useState<posItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  const rooms = [
    { id: "VIP-1", tables: 10 },
    { id: "VIP-2", tables: 10 },
    { id: "Standard", tables: 30 },
  ];

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  const handleAddItem = (item: MenuItem) => {
    const existingItem = cartItems.find((i) => i.id === item.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    console.log(cartItems);
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter((i) => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCartItems(
        cartItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }
    console.log("Order submitted:", {
      room: selectedRoom,
      table: selectedTable,
      customerName,
      items: cartItems,
    });
    setCartItems([]);
    setCustomerName("");
    toast.success("Order submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("order")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "order"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            New Order
          </Button>
          <Button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Orders
          </Button>
        </div>

        {activeTab === "order" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MenuBrowser onAddItem={handleAddItem} />
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Room & Table
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Room
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => {
                        setSelectedRoom(e.target.value);
                        setSelectedTable("1");
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Table
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currentRoom &&
                        Array.from({ length: currentRoom.tables }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            Table {i + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Customer Name */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Customer Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </Card>

              <OrderSummary
                items={cartItems}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                onSubmitOrder={handleSubmitOrder}
              />
            </div>
          </div>
        ) : (
          <OrdersView />
        )}
      </main>
    </div>
  );
}
