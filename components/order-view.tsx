"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, CreditCard } from "lucide-react";

import { Toaster, toast } from "sonner";
import { orderAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
export interface Item {
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  name: string;
  room: string;
  table: string;
  customer: string;
  items: Item[];
  total: number;
  status: "Unbilled" | "Draft" | "Paid";
  timestamp: string;
  workflow_state: string;
  custom_order_status: string;
  modified_by: string;
}

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>();
  const currRole = localStorage.getItem("role");

  const [viableTab, setViableTab] = useState<string[]>([]);
  // if role is waiter

  const waiterTab = ["New", "In Progress", "Served"];
  const cashierTab = ["Unbilled", "Draft", "Paid"];

  // let currRole = null

  // const [selectedTab, setSelectedTab] = useState<"New" | "In Progress" | "Served"|  >("New");

  // the cashier

  const [selectedTab, setSelectedTab] = useState<string>();
  useEffect(() => {
    if (currRole == "Waiter") {
      setViableTab(waiterTab);
      setSelectedTab(waiterTab[0]);
    } else {
      setViableTab(cashierTab);
      setSelectedTab(cashierTab[0]);
    }
  }, [currRole]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const fetchOrder = async () => {
      const res = await orderAPI.listOrder();
      console.log("order", res);
      setOrders(Array.isArray(res) ? res : res.data || []);
    };
    fetchOrder();
  }, []);
  if (!mounted) return null;
  if (!orders) return <>Loading orders...</>;

  // if (!orders) return <>Loading orders...</>;
  const myOrder = orders.filter(
    (order) => order.modified_by === localStorage.getItem("email")
  );
  const filteredOrders = orders.filter(
    (order) => order.workflow_state === selectedTab
  );

  const handlePrint = (orderId: string) => {
    toast.loading(`Printing KOT and receipt for order ${orderId}`);
    // Update status to Draft after printing
    setOrders(
      orders.map((order) =>
        order.name === orderId ? { ...order, status: "Draft" } : order
      )
    );
    console.log(orders);
  };

  const handlePayment = (orderId: string) => {
    toast.success(`Processing payment for order ${orderId}`);
    // Update status to Paid
    setOrders(orders.filter((order) => order.name !== orderId));
  };

  return (
    <div className="space-y-4" id="order">
      {/* Tabs */}
      <Toaster position="top-right" richColors />
      <div className="flex gap-2">
        {viableTab.map((tab) => (
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
              No {selectedTab!.toLowerCase()} orders
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.name} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {order.name}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {order.custom_order_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Room:</strong> {order?.room} |{" "}
                    <strong>Table:</strong> {order?.table} |{" "}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.customer || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {order?.timestamp}
                  </p>
                </div>

                {/* Items & Total */}
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Items:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {/* {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.name} -
                          {item.price * item.quantity} Birr
                        </li>
                      ))} */}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">
                      {order.total} Birr
                    </span>
                    <div className="flex gap-2">
                      {order.status === "Unbilled" && (
                        <Button
                          onClick={() => handlePrint(order.name)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                      )}
                      {order.status === "Draft" && (
                        <Button
                          onClick={() => handlePayment(order.name)}
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
