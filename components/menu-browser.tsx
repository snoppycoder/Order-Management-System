"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebouce";
import { ProductModal } from "./product-modal";
import { OrderItem } from "./order-summary";
import { menuAPI, orderAPI } from "@/lib/api";
import { MENU_CACHE_KEY, CACHE_TTL } from "@/utils/constant";
import { posItem } from "./pos-interface";
export interface AddOn {
  price: number;
  name: string;
  idx: number;
}
export interface MenuItem {
  id: string;
  name: string;
  item_code?: string;
  category: string;
  price_list_rate: number;
  image?: string | "/butter-chicken.jpg";
  available?: boolean | true;
  description?: string;
  itemAddOn: AddOn[];
}

interface MenuBrowserProps {
  onAddItem: (item: posItem) => void;
}
interface frappeMenu extends MenuItem {
  item_code: string;
  item_name: string;
  item_group: string;
  description: string;
  quantity: number;
  stock_uom: "Nos";
}

const CATEGORIES = [
  "All Items",
  "Main Course",
  "Appetizers",
  "Rice Dishes",
  "Beverages",
  "Desserts",
];

export function MenuBrowser({ onAddItem }: MenuBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menu, setMenu] = useState<frappeMenu[]>([]);
  const currRole = localStorage.getItem("role");

  useEffect(() => {
    const cached = localStorage.getItem(MENU_CACHE_KEY);

    if (cached) {
      const { items, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        setMenu(items);

        return;
      }
    }
    const fetchMenu = async () => {
      const response = await menuAPI.getMenuItems();
      const items = Array.isArray(response) ? response : response?.data || [];
     
      localStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({ items, timestamp: Date.now() })
      );
      setMenu(items);
    };
    fetchMenu();
  }, []);

  const filteredItems = menu.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Items" || item.item_group === selectedCategory;
    const matchesSearch = item.item_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const handleProductClick = (item: MenuItem) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };
  const handleAddFromModal = (
    item: MenuItem,
    quantity: number,
    custom_special_instruction: string,
    selectedVariant: string,
    addOns: string[]
  ) => {
    const existingItem = {
      ...item,
      quantity,
      custom_special_instruction,
      custom_variant_items: selectedVariant,
      addOns,
    };
    onAddItem(existingItem);
  };
  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
          <span className="text-gray-600">
            <Search></Search>
          </span>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`md:px-4 md:py-2 p-2 text-xs md:text-sm rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.item_code}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(item);
            }}
          >
            <div className="aspect-square bg-gray-200 overflow-hidden">
              <img
                src={
                  item.image
                    ? item.image.startsWith("/files/")
                      ? `https://ruelux.k.erpnext.com${item.image}`
                      : item.image
                    : "/butter-chicken.jpg"
                }
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {item.item_name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{item.item_group}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {item.price_list_rate} Birr
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddItem(item);
                  }}
                  size="sm"
                  className="bg-primary cursor-pointer hover:bg-primary/90 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <ProductModal
        item={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToOrder={handleAddFromModal}
      />
    </div>
  );
}
