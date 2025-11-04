"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { AddOn } from "./menu-browser";

export interface OrderItem {
  id: string;
  name: string;
  addOns?: string[];
  price_list_rate: number;
  custom_variant_items?: string;
  quantity: number;
  custom_special_instruction?: string;
  itemAddOn?: AddOn[];
}

interface OrderSummaryProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string, index: number) => void;
  onUpdateQuantity: (itemId: string, index: number, quantity: number) => void;
  onSubmitOrder: () => void;
}
export const calculateItemPrice = (item: OrderItem) => {
  let price = item.price_list_rate ?? 0;

  // if (item.variant === "Small") price = 249;
  // else if (item.variant === "Medium") price = 299;
  // else if (item.variant === "Large") price = 399;

  if (item.addOns && item.addOns.length > 0) {
    const addOnPrices = item.itemAddOn!;

    item.addOns.forEach((selectedAddOnName) => {
      const addon = addOnPrices.find((a) => a.name === selectedAddOnName);
      if (addon) {
        price += addon.price;
      }
    });
  }

  return price;
};

export function OrderSummary({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onSubmitOrder,
}: OrderSummaryProps) {
  const subTotal = items.reduce(
    (sum, item) => sum + calculateItemPrice(item) * item.quantity,
    0
  );
  const tax = subTotal * 0.15;
  const serviceFee = subTotal * 0.1;
  const total = tax + subTotal + serviceFee;

  return (
    <Card className="p-4 sticky top-6">
      <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No items added
          </p>
        ) : (
          items.map((item, index) => {
            const itemPrice = calculateItemPrice(item);
            return (
              <div
                key={`${item.id}-${index}`}
                className="bg-gray-50 p-3 rounded border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    {item.custom_variant_items && (
                      <p className="text-xs text-gray-500">
                        {item.custom_variant_items}
                      </p>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-xs text-gray-500">
                        +{item.addOns.join(", ")}
                      </p>
                    )}

                    {item.custom_special_instruction && (
                      <p className="text-xs text-blue-600 italic mt-1">
                        Note: {item.custom_special_instruction}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {itemPrice} Birr
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, index, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, index, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id, index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{subTotal} Birr</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (15%)</span>
          <span>{tax} Birr</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service fee (10%)</span>
          <span>{serviceFee} Birr</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-900 bg-blue-50 p-2 rounded">
          <span>Total</span>
          <span className="text-primary">{total} Birr</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmitOrder}
        className="w-full mt-4 bg-primary cursor-pointer hover:bg-primary/90 text-white font-semibold py-2"
      >
        Submit Order
      </Button>
    </Card>
  );
}
