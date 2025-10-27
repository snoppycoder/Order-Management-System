"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus, Minus } from "lucide-react";
import { MenuItem } from "./menu-browser";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (
    item: MenuItem,
    quantity: number,
    specialInstructions: string,
    selectedVariant: string,
    addOns: string[]
  ) => void;
}

const ADD_ONS = [
  { name: "Cheese", price: 29 },
  { name: "Extra Toppings", price: 49 },
  { name: "Bacon", price: 59 },
  { name: "Mushrooms", price: 39 },
];

export function ProductModal({
  item,
  isOpen,
  onClose,
  onAddToOrder,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("Medium");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  if (!isOpen || !item) return null;
  const VARIANTS = [
    { name: "Small", price: item.price_list_rate - item.price_list_rate * 0.5 },
    { name: "Medium", price: item.price_list_rate },
    { name: "Large", price: item.price_list_rate + item.price_list_rate * 0.5 },
  ]; // just a workaround

  const variantPrice =
    VARIANTS.find((v) => v.name === selectedVariant)?.price ||
    item.price_list_rate;
  const addOnsTotal = selectedAddOns.reduce((sum, addOnName) => {
    const addOn = ADD_ONS.find((a) => a.name === addOnName);
    return sum + (addOn?.price || 0);
  }, 0);
  const itemTotal = addOnsTotal + (variantPrice ?? 0 * quantity);

  const handleAddOnToggle = (addOnName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnName)
        ? prev.filter((a) => a !== addOnName)
        : [...prev, addOnName]
    );
  };

  const handleAddToOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    onAddToOrder(
      item,
      quantity,
      specialInstructions,
      selectedVariant,
      selectedAddOns
    );
    setQuantity(1);
    setSpecialInstructions("");
    setSelectedVariant("Medium");
    setSelectedAddOns([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="relative w-full max-w-6xl lg:p-6">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full hover:bg-gray-100 z-10"
        >
          <X className="w-5 h-5 text-gray-700 cursor-pointer" />
        </button>
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 px-4 lg:p-6">
          <div className="relative shrink-0 w-full sm:w-80">
            <div className="aspect-square hidden md:block bg-gray-200 rounded-lg overflow-hidden">
              {item.image ? (
                <img
                  src={
                    item.image
                      ? item.image.startsWith("/files/")
                        ? `https://ruelux.k.erpnext.com${item.image}`
                        : item.image
                      : "/butter-chicken.jpg"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="md:text-2xl text-xl font-bold text-gray-900">
                {item.name}
              </h2>
              <p className="text-sm text-gray-500 font-mono uppercase">
                {item.category}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-4 gap-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add any special instructions..."
                  className="w-full px-3 lg:py-2 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none text-sm"
                  rows={3}
                />
              </div>

              <div className="lg:mb-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Add-ons
                </h3>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {ADD_ONS.map((addOn) => (
                    <label
                      key={addOn.name}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddOns.includes(addOn.name)}
                        onChange={() => handleAddOnToggle(addOn.name)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {addOn.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        + {addOn.price} Birr
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-6 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                  Variants
                </h3>
                <div className="space-y-1">
                  {VARIANTS.map((variant) => (
                    <label
                      key={variant.name}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant === variant.name}
                        onChange={() => setSelectedVariant(variant.name)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">
                        {variant.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-900 ml-auto">
                        {variant.price} Birr
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex flex-col justify-end">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {itemTotal} Birr
                </p>
              </div>
            </div>

            <Button
              onClick={handleAddToOrder}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg mt-4"
            >
              Add to Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
