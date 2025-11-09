"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from "sonner";

import { AddOn, MenuBrowser } from "./menu-browser";
import { OrderSummary } from "./order-summary";
import { OrdersView } from "./order-view";
import { orderAPI } from "@/lib/api";

interface POSInterfaceProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}
export interface posItem {
  id: string;
  idx?: number;
  name: string;
  price_list_rate: number;
  quantity: number;
  custom_variant_items?: string;
  custom_item_type?: string;
  custom_special_instruction?: string;
  itemAddOn?: AddOn[];
  custom_add_ons?: string;
  addOns?: string[];
  custom_serve_time?: string;
}
export interface submittableOrder {
  customer: string;
  waiter: string;
  delivery_date: string;
  transaction_date: string;
  order_type: string;
  items: posItem[];
  custom_table_number: string;
  custom_room: string;
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
  const [orderType, setOrderType] = useState<"Bar" | "Restaurant" | "Both">(
    "Restaurant"
  );
  const orderTypeArr = ["Bar", "Restaurant", "Both"];
  let role = null
  useEffect(() => {
    role = localStorage.getItem("role");
    if (role === "Cashier" || role === "Chef" || role == "Bartender") {
      setActiveTab("orders");
    } else {
      setActiveTab("order");
    }
  }, []);
  const rooms = [
    { id: "VIP-1", tables: 10 },
    { id: "VIP-2", tables: 10 },
    { id: "Standard", tables: 30 },
  ];

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  const handleAddItem = (item: posItem) => {
    console.log(item);
    const customAddOnsString = item.addOns?.join(", ") || "";
    setCartItems((prev) => {
      const existingItem = prev.find(
        (i) => i.name + (i.idx ?? "") == item.name + (i.idx ?? "")
      );

      if (existingItem) {
        return prev.map((i) =>
          i.name === item.name
            ? {
                ...i,
                quantity: i.quantity + (item.quantity || 1),
                idx: i.idx,
                itemAddOn: item.itemAddOn || i.itemAddOn,
                addOns: item.addOns || i.addOns,
                custom_serve_time:
                  item.custom_serve_time || i.custom_serve_time,
                custom_special_instruction:
                  item.custom_special_instruction ||
                  i.custom_special_instruction,
                custom_add_ons: customAddOnsString || i.custom_add_ons || "",
                custom_variant_items:
                  item.custom_variant_items || i.custom_variant_items,
              }
            : i
        );
      }

      // Use the quantity from the modal or default to 1, and provide required posItem fields
      return [
        ...prev,
        {
          id: item.id,
          idx: item.idx,
          name: item.name,
          price_list_rate: item.price_list_rate,
          quantity: item.quantity || 1,
          itemAddOn: item.itemAddOn,
          addOns: item.addOns,
          custom_special_instruction: item.custom_special_instruction,
          custom_add_ons: customAddOnsString,
          custom_serve_time: item.custom_serve_time,
          custom_variant_items: item.custom_variant_items,
        },
      ];
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
      customer: customerName || "ruelux", // if the customer is not in the db add later on
      waiter: localStorage.getItem("email") || "zena@gmail.com",
      delivery_date: new Date().toISOString().split("T")[0],
      transaction_date: new Date().toISOString().split("T")[0],
      items: cartItems,
      custom_table_number: selectedTable,
      custom_room: selectedRoom,
      order_type: orderType,
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
          {role !== "Cashier" && role !== "Chef" && role !== "Bartender" && (
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

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={orderType}
                    required
                    onChange={(e) =>
                      setOrderType(e.target.value as typeof orderType)
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {orderTypeArr.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
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
