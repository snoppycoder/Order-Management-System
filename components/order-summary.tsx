"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onSubmitOrder: () => void;
}

export function OrderSummary({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onSubmitOrder,
}: OrderSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <Card className="p-4 sticky top-6">
      <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

      {/* Items List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No items added
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{subtotal} Birr</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (5%)</span>
          <span>{tax} Birr</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-gray-900 bg-blue-50 p-2 rounded">
          <span>Total</span>
          <span className="text-primary">{total} Birr</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmitOrder}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-semibold py-2"
      >
        Submit Order
      </Button>
    </Card>
  );
}
