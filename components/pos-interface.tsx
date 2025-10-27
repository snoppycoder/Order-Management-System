"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from "sonner";

import { MenuBrowser } from "./menu-browser";
import { OrderSummary } from "./order-summary";
import { OrdersView } from "./order-view";
import { menuAPI, authAPI, orderAPI } from "@/lib/api";

interface POSInterfaceProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}
export interface posItem {
  id: string;
  name: string;
  price_list_rate: number;
  quantity: number;
  custom_special_instruction?: string;
}
export interface submittableOrder {
  customer: string;
  waiter: string;
  delivery_date: string;
  transaction_date: string;
  items: posItem[];
}
interface Item {
  id: string;
  name: string;
  price_list_rate: number;

  quantity?: number; // since we are going from menu order which has no quantity to an order object which does have quantity
}
export function POSInterface({ user, onLogout }: POSInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"order" | "orders">("order");
  const [selectedRoom, setSelectedRoom] = useState<string>("VIP-1");
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [cartItems, setCartItems] = useState<posItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role == "Cashier" || "Chef") {
      setActiveTab("orders");
    }
  }, [role]);
  const rooms = [
    { id: "VIP-1", tables: 10 },
    { id: "VIP-2", tables: 10 },
    { id: "Standard", tables: 30 },
  ];

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  const handleAddItem = (item: Item) => {
    setCartItems((prev) => {
      console.log(item, "adding");
      const existingItem = prev.find((i) => i.name === item.name);

      if (existingItem) {
        // If the modal passes a quantity, add that amount instead of just +1
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }

      // Use the quantity from the modal or default to 1
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const handleRemoveItem = (itemId: string, index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (
    itemId: string,
    index: number,
    quantity: number
  ) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId, index);
    } else {
      setCartItems(
        cartItems.map((item, i) => (i === index ? { ...item, quantity } : item))
      );
    }
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }
    const orderObj: submittableOrder = {
      customer: customerName || "Aderaw", // if the customer is not in the db add later on
      waiter: localStorage.getItem("email") || "zena@gmail.com",
      delivery_date: new Date().toISOString().split("T")[0],
      transaction_date: new Date().toISOString().split("T")[0],
      items: cartItems,
    };
    try {
      await orderAPI.createOrder(orderObj);
      toast.success("Order submitted successfully!");
      setActiveTab("orders");

      setTimeout(() => {
        document
          .getElementById("order")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.log(error);
      toast.error("Encountered an error submitting the order");
    } finally {
      setCartItems([]);
      setCustomerName("");
    }
  };

  return (
    <div className=" min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {role !== "Cashier" || "Chef" ? (
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
          ) : (
            <></>
          )}
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

            <div className="space-y-4 lg:sticky lg:top-6 self-start h-fit">
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
