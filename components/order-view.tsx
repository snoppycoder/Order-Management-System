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
  Hamburger,
} from "lucide-react";

import { Toaster, toast } from "sonner";
import { approvalWorkflow, menuAPI, orderAPI } from "@/lib/api";
import { MenuItem } from "./menu-browser";
import OrderDetailModal from "./order-detail-modal";

export interface Item {
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  name: string;
  custom_room: string;
  custom_table_number: string;
  custom_customer_name: string;
  items: Item[];
  base_grand_total: number;
  status: "Billed" | "Paid";
  timestamp: string;
  custom_order_type: string;
  workflow_state: string;
  custom_order_status: string;
  localItems: MenuItem[];
  owner: string;
  custom_item_type: "Bar" | "Restaurant";
  custom_button_disabled: number;
  custom_approver?: string;
}

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>();
  const currRole = localStorage.getItem("role");
  const [open, setOpen] = useState(false);
  const [viableTab, setViableTab] = useState<string[]>([]);
  const [orderName, setOrderName] = useState<string>("");
  // if role is waiter
  let filteredOrders: Order[];
  const waiterTab = ["New", "Ready", "Served"];
  const chefTab = ["New", "In Progress", "Ready"];
  const cashierTab = ["Served", "Billed", "Paid"];
  const adminTab = ["New", "In Progress", "Ready", "Served", "Billed", "Paid"];
  const bartenderTab = ["New", "In Progress", "Ready"];
  const [disabledOrders, setDisabledOrders] = useState<{
    [key: string]: boolean;
  }>({});

  const [selectedTab, setSelectedTab] = useState<string>();
  useEffect(() => {
    const storedDisabledOrders = JSON.parse(
      localStorage.getItem("disabledOrder") || "{}"
    );
    setDisabledOrders(storedDisabledOrders);
    if (currRole == "Waiter") {
      setViableTab(waiterTab);
      setSelectedTab(waiterTab[0]);
    } else if (currRole == "Admin") {
      setViableTab(adminTab);
      setSelectedTab(adminTab[0]);
    } else if (currRole == "Chef") {
      setViableTab(chefTab);
      setSelectedTab(chefTab[0]);
    } else if (currRole == "Bartender") {
      setViableTab(bartenderTab);
      setSelectedTab(bartenderTab[0]);
    } else {
      setViableTab(cashierTab);
      setSelectedTab(cashierTab[0]);
    }
  }, [currRole]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchOrder = async () => {
      try {
        const res = await orderAPI.listOrder();
        // const edited = await menuAPI.testMenuAPI();
        // console.log(edited, "Here");

        setOrders(Array.isArray(res) ? res : res.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      }
    };

    fetchOrder();
  }, []);
  if (!mounted) return null;
  if (!orders) return <div className="text-center">Loading orders...</div>;

  if (currRole?.toLowerCase() == "Waiter".toLowerCase()) {
    const myOrder = orders.filter(
      (order) =>
        order.owner.toLowerCase() ===
        localStorage.getItem("email")?.toLowerCase()
    );
    filteredOrders = myOrder.filter(
      (order) => order.workflow_state === selectedTab
    );
  } else if (currRole == "Bartender") {
    filteredOrders = orders.filter(
      (order) =>
        (order.custom_order_type == "Both" ||
          order.custom_order_type == "Bar") &&
        order.workflow_state == selectedTab
    );
  } else if (currRole == "Chef") {
    filteredOrders = orders.filter(
      (order) =>
        (order.custom_order_type == "Both" ||
          order.custom_order_type == "Restaurant") &&
        order.workflow_state == selectedTab
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
  const handleUpdate = async (order: Order, status: string) => {
    console.log(order, "to be updated");
    try {
      const orderId = order.name;
      if (
        order.custom_order_type == "Both" &&
        order.workflow_state == "In Progress"
      ) {
        const res = await orderAPI.updateApprovalDigit(
          order.name,
          currRole ?? ""
        );

        setDisabledOrders((prev) => ({
          ...prev,
          [order.name]: order.custom_button_disabled === 0,
        }));

        if (res.success) {
          setOrders((prev) =>
            prev?.map((order) =>
              order.name === orderId
                ? { ...order, workflow_state: status }
                : order
            )
          );
          // toast.loading(`Processing your request for order: ${orderId}`);
          await approvalWorkflow.update(status, orderId);
          toast.success(`Sucessfully updated your request `);
          return;
        }
        currRole == "Bartender"
          ? toast.info("Waiting for the chef to update ")
          : toast.info("Waiting for the bartender to update ");
      } else {
        setOrders((prev) =>
          prev?.map((order) =>
            order.name === orderId
              ? { ...order, workflow_state: status }
              : order
          )
        );
        // toast.loading(`Processing your request for order: ${orderId}`);
        await approvalWorkflow.update(status, orderId);
        toast.success(`Sucessfully updated your request `);
      }
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
      <Toaster position="top-right" richColors />
      <div className="flex gap-2 overflow-x-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 rounded-lg  bg-white">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg ">
                      {order.custom_customer_name}
                      {order.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>Room:</strong> {order?.custom_room}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Table:</strong> {order?.custom_table_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong>{" "}
                    {order.custom_customer_name || "N/A"}
                  </p>
                </div>

                {(currRole == "Cashier" || currRole == "Waiter") && (
                  <div className="flex justify-center items-center font-bold text-base sm:text-lg text-gray-900 text-center">
                    Total: {order.base_grand_total} Birr
                  </div>
                )}

                <div className="flex justify-center items-center md:justify-end">
                  <div className="flex flex-wrap gap-x-8">
                    {order.workflow_state == "Billed" && (
                      <Button
                        onClick={() => {
                          handleUpdate(order, "Paid");
                        }}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Pay
                      </Button>
                    )}

                    {order.workflow_state == "New" &&
                      (currRole == "Chef" || currRole == "Admin") && (
                        <Button
                          onClick={() => handleUpdate(order, "In Progress")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center"
                        >
                          <Loader className="w-4 h-4 mr-1" />
                          In Progress
                        </Button>
                      )}

                    {order.workflow_state == "New" && currRole == "Waiter" && (
                      <Button
                        size="sm"
                        disabled
                        className="bg-gray-300 text-gray-700 flex items-center"
                      >
                        <Loader className="w-4 h-4 mr-1" />
                        In Progress
                      </Button>
                    )}

                    {order.workflow_state == "New" &&
                      (currRole == "Chef" ||
                        currRole == "Admin" ||
                        currRole == "Waiter") && (
                        <Button
                          onClick={() => {
                            setOpen(true);
                            setOrderName(order.name);
                          }}
                          size="sm"
                          className="bg-blue-400 hover:bg-blue-400/90 text-white font-semibold cursor-pointer flex items-center"
                        >
                          <Hamburger className="w-4 h-4 mr-1" />
                          Order Detail
                        </Button>
                      )}

                    {order.workflow_state == "Ready" && currRole == "Chef" && (
                      <Button
                        size="sm"
                        disabled
                        className="bg-gray-300 text-gray-700 flex items-center"
                      >
                        <HandPlatter className="w-4 h-4 mr-1" />
                        Served
                      </Button>
                    )}
                    {order.workflow_state == "Ready" &&
                      (currRole == "Waiter" || currRole == "Admin") && (
                        <Button
                          onClick={() => handleUpdate(order, "Served")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center"
                        >
                          <HandPlatter className="w-4 h-4 mr-1" />
                          Served
                        </Button>
                      )}

                    {order.workflow_state == "In Progress" && (
                      <>
                        {order.custom_approver ? (
                          <Button
                            onClick={() => handleUpdate(order, "Ready")}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center"
                            disabled={
                              !(
                                !order.custom_approver?.includes(
                                  currRole ?? ""
                                ) && order.custom_button_disabled === 1
                              )
                            }
                          >
                            <BookCheck className="w-4 h-4 mr-1" />
                            Ready
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleUpdate(order, "Ready")}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white crsor-pointer flex items-center"
                            disabled={disabledOrders[order.name]}
                          >
                            <BookCheck className="w-4 h-4 mr-1" />
                            Ready
                          </Button>
                        )}
                      </>
                    )}
                    {order.workflow_state == "Served" &&
                      currRole == "Waiter" && (
                        <Button
                          size="sm"
                          disabled
                          className="bg-gray-300 text-gray-700 flex items-center"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Bill
                        </Button>
                      )}

                    {order.workflow_state === "Served" &&
                      (currRole == "Cashier" || currRole == "Admin") && (
                        <Button
                          onClick={() => handleUpdate(order, "Billed")}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Bill
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        ordername={orderName}
      />
    </div>
  );
}
