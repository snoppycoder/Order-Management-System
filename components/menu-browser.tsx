"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebouce";
import { ProductModal } from "./product-modal";
import { OrderItem } from "./order-summary";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string | "/butter-chicken.jpg";
  available?: boolean | true;
  description?: string;
}

interface MenuBrowserProps {
  onAddItem: (item: MenuItem) => void;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Fish Curry",
    category: "Main Course",
    price: 320,
    image: "/grilled-fish.webp",
  },
  {
    id: "2",
    name: "Tandoori Chicken",
    category: "Main Course",
    price: 280,
    image: "/tandoori.jfif",
  },
  {
    id: "3",
    name: "Butter Chicken",
    category: "Main Course",
    price: 300,
    image: "/butter-chicken.jpg",
  },
  {
    id: "4",
    name: "Paneer Tikka",
    category: "Appetizers",
    price: 220,
  },
  {
    id: "5",
    name: "Samosa",
    category: "Appetizers",
    price: 80,
  },
  {
    id: "6",
    name: "Biryani",
    category: "Rice Dishes",
    price: 250,
  },
  {
    id: "7",
    name: "Coca Cola",
    category: "Beverages",
    price: 60,
  },
  {
    id: "8",
    name: "Mango Lassi",
    category: "Beverages",
    price: 100,
  },
];

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
  const debouncedQuery = useDebounce(searchTerm, 400);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (debouncedQuery) {
      //api calls with debouncedQuery
    }
  }, [debouncedQuery]);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Items" || item.category === selectedCategory;
    const matchesSearch = item.name
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
    specialInstructions: string,
    selectedVariant: string,
    addOns: string[]
  ) => {
    const existingItem = {
      ...item,
      quantity,
      specialInstructions,
      variant: selectedVariant,
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
            className={`md:px-4 px-2 md:py-2 py-2 text-xs md:text-sm rounded-lg md:rounded-full font-medium whitespace-nowrap transition-colors ${
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
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(item);
            }}
          >
            <div className="aspect-square bg-gray-200 overflow-hidden">
              <img
                src={item.image || "/butter-chicken.jpg"}
                alt={item.name}
                className="w-full h-full object-center"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{item.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {item.price} Birr
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
