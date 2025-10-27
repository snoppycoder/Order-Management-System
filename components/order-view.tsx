"use client";

import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Printer,
  CreditCard,
  DollarSign,
  Loader,
  HandPlatter,
  BookCheck,
} from "lucide-react";

import { Toaster, toast } from "sonner";
import { approvalWorkflow, orderAPI } from "@/lib/api";

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
  status: "Billed" | "Cancelled" | "Paid";
  timestamp: string;
  workflow_state: string;
  custom_order_status: string;

  owner: string;
}

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>();
  const currRole = localStorage.getItem("role");

  const [viableTab, setViableTab] = useState<string[]>([]);
  // if role is waiter
  let filteredOrders: Order[];
  const waiterTab = ["New", "Ready", "Served"];
  const chefTab = ["New", "In progress"];
  const cashierTab = ["Served", "Billed", "Paid", "Cancelled"];
  const adminTab = ["New", "In Progress", "Ready", "Served", "Billed", "Paid"];

  const [selectedTab, setSelectedTab] = useState<string>();
  useEffect(() => {
    if (currRole == "Waiter") {
      setViableTab(waiterTab);
      setSelectedTab(waiterTab[0]);
    } else if (currRole == "Admin") {
      setViableTab(adminTab);
      setSelectedTab(adminTab[0]);
    } else if (currRole == "Chef") {
      setViableTab(chefTab);
      setSelectedTab(chefTab[0]);
    } else {
      setViableTab(cashierTab);
      setSelectedTab(cashierTab[0]);
    }
  }, [currRole]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // const fetchOrder = async () => {
    //   const res = await orderAPI.listOrder();
    //   setOrders(Array.isArray(res) ? res : res.data || []);
    //   console.log(res);
    // };
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.listOrder();
        setOrders(Array.isArray(res) ? res : res.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      }
    };

    fetchOrder();
  }, []);
  if (!mounted) return null;
  if (!orders) return <>Loading orders...</>;

  // if (!orders) return <>Loading orders...</>;
  if (currRole?.toLowerCase() == "Waiter".toLowerCase()) {
    const myOrder = orders.filter(
      (order) =>
        order.owner.toLowerCase() ===
        localStorage.getItem("email")?.toLowerCase()
    );
    filteredOrders = myOrder.filter(
      (order) => order.workflow_state === selectedTab
    );
  } else {
    filteredOrders = orders.filter(
      (order) => order.workflow_state === selectedTab
    );
  }

  // const handlePrint = (orderId: string) => {
  //   toast.loading(`Printing KOT and receipt for order ${orderId}`);
  //   // Update status to Draft after printing
  //   setOrders(
  //     orders.map((order) =>
  //       order.name === orderId ? { ...order, status: "Billed" } : order
  //     )
  //   );
  //   console.log(orders);
  // };

  const handleUpdate = async (orderId: string, status: string) => {
    try {
      setOrders((prev) =>
        prev?.map((order) =>
          order.name === orderId ? { ...order, workflow_state: status } : order
        )
      );
      await approvalWorkflow.update(status, orderId);
      toast.success(`Processing your request for order: ${orderId}`);
      // await fetchOrder();

      // setOrders(orders.filter((order) => order.name !== orderId));
    } catch (error) {
      console.log(error);
      toast.error("Error updating status");
    }
    // Update status to Paid
  };

  return (
    <div className="space-y-4" id="order">
      {/* Tabs */}
      <Toaster position="top-right" richColors />
      <div className="flex gap-2 ">
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

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No {selectedTab!.toLowerCase()} orders
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.name} className="relative p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {order.name}
                    </h3>
                    {/* <span className="absolute lg:right-2 lg:mb-2 lg:top-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {order.custom_order_status}
                    </span> */}
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

                <div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Items:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1"></ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">
                      {order.total} Birr
                    </span>
                    <div className="flex gap-2">
                      {order.workflow_state === "Billed" && (
                        <Button
                          onClick={() => handleUpdate(order.name, "Paid")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      {order.workflow_state === "New" &&
                        (currRole == "Chef" || "Admin") && (
                          <Button
                            onClick={() =>
                              handleUpdate(order.name, "In Progress")
                            }
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                          >
                            <Loader className="w-4 h-4 mr-1" />
                            In Progress
                          </Button>
                        )}
                      {order.workflow_state === "Ready" && (
                        <Button
                          onClick={() => handleUpdate(order.name, "Served")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        >
                          <HandPlatter className="w-4 h-4 mr-1" />
                          Served
                        </Button>
                      )}

                      {order.workflow_state === "In Progress" && (
                        <Button
                          onClick={() => handleUpdate(order.name, "Ready")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        >
                          <BookCheck className="w-4 h-4 mr-1" />
                          Ready
                        </Button>
                      )}
                      {order.workflow_state === "Served" && (
                        <Button
                          onClick={() => handleUpdate(order.name, "Billed")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Bill
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
