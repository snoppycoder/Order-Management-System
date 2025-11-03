"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCheck, Rss, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useState } from "react";
import { orderAPI } from "@/lib/api";

interface OrderItem {
  item_name: string;
  qty: number;
  custom_add_ons: string;
  custom_special_instruction: string;
  custom_variant_items: string;
}

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  ordername: string;
}

export default function OrderDetailModal({
  open,
  onClose,
  ordername,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderItem[]>([]);
  const currRole = localStorage.getItem("role");

  useEffect(() => {
    if (!ordername) return;

    const fetchDescription = async () => {
      const res = await orderAPI.getOrderDetail(ordername);
      const response = res.data;
      console.log("chefsss ", response);
      if (currRole == "Chef") {
        const chef = response.items.filter(
          (item: { item_group: string }) => item.item_group == "Consumable"
        );

        setOrder(chef);
      } else if (currRole == "Bartender") {
        const baretender = response.items.filter(
          (item: { item_group: string }) => item.item_group == "Beverages"
        );

        setOrder(baretender);
      } else {
        setOrder(response.items);
      }
    };

    fetchDescription();
  }, [ordername]);

  if (!order) return <div className="text-center">Loading...</div>;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl shadow-lg p-0 ">
        <DialogHeader className="border-b px-6 py-4 bg-primary text-white rounded-t-xl">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <UtensilsCrossed size={18} /> Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-80 overflow-y-auto p-6">
          {order.length > 0 ? (
            order.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Item</span>
                  <span className="font-semibold text-gray-800">
                    {item.item_name}
                  </span>
                </div>

                <div className="flex justify-between mt-2">
                  <span className="font-medium text-sm">Quantity</span>
                  <span className="font-medium">{item.qty}</span>
                </div>

                <div className="mt-4">
                  <p className="font-medium text-sm mb-2">Add-ons</p>

                  {item?.custom_add_ons?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.custom_add_ons.split(",").map((addon, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          <BadgeCheck size={12} /> {addon.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      No add-ons
                    </span>
                  )}
                </div>
                {item.custom_special_instruction && (
                  <div className="mt-4">
                    <h1 className="font-medium text-sm ">
                      Special Instruction:
                    </h1>
                    {item.custom_special_instruction}
                  </div>
                )}
                {item.custom_variant_items && (
                  <div className="mt-4">
                    <h1 className="font-medium text-sm ">Variant</h1>
                    {item.custom_variant_items}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="font-semibold text-center">No pending orders</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
