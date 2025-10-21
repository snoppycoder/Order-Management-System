"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, CreditCard } from "lucide-react";

interface Item {
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  id: string;
  room: string;
  table: string;
  customerName: string;
  items: Item[];
  total: number;
  status: "Unbilled" | "Draft" | "Paid";
  timestamp: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD001",
    room: "VIP-1",
    table: "5",
    customerName: "John Doe",
    items: [
      { name: "Butter Chicken", quantity: 2, price: 300 },
      { name: "Biryani", quantity: 1, price: 250 },
    ],
    total: 850,
    status: "Unbilled",
    timestamp: "2024-10-20 14:30",
  },
  {
    id: "ORD002",
    room: "Standard",
    table: "12",
    customerName: "Jane Smith",
    items: [
      { name: "Tandoori Chicken", quantity: 1, price: 280 },
      { name: "Mango Lassi", quantity: 2, price: 100 },
    ],
    total: 480,
    status: "Draft",
    timestamp: "2024-10-20 14:15",
  },
];

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedTab, setSelectedTab] = useState<"Unbilled" | "Draft" | "Paid">(
    "Unbilled"
  );

  const filteredOrders = orders.filter((order) => order.status === selectedTab);

  const handlePrint = (orderId: string) => {
    alert(`Printing KOT and receipt for order ${orderId}`);
    // Update status to Draft after printing
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "Draft" } : order
      )
    );
    console.log(orders);
  };

  const handlePayment = (orderId: string) => {
    alert(`Processing payment for order ${orderId}`);
    // Update status to Paid
    setOrders(orders.filter((order) => order.id !== orderId));
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["Unbilled", "Draft", "Paid"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === tab
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No {selectedTab.toLowerCase()} orders
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Room:</strong> {order.room} |{" "}
                    <strong>Table:</strong> {order.table}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.customerName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {order.timestamp}
                  </p>
                </div>

                {/* Items & Total */}
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Items:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.name} - ₹
                          {item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">
                      ₹{order.total}
                    </span>
                    <div className="flex gap-2">
                      {order.status === "Unbilled" && (
                        <Button
                          onClick={() => handlePrint(order.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                      )}
                      {order.status === "Draft" && (
                        <Button
                          onClick={() => handlePayment(order.id)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
