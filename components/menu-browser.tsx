"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebouce";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
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
    image: "/grilled-fish-curry.jpg",
  },
  {
    id: "2",
    name: "Tandoori Chicken",
    category: "Main Course",
    price: 280,
    image: "/tandoori-chicken.png",
  },
  {
    id: "3",
    name: "Butter Chicken",
    category: "Main Course",
    price: 300,
    image: "/butter-chicken.png",
  },
  {
    id: "4",
    name: "Paneer Tikka",
    category: "Appetizers",
    price: 220,
    image: "/paneer-tikka.png",
  },
  {
    id: "5",
    name: "Samosa",
    category: "Appetizers",
    price: 80,
    image: "/crispy-golden-samosas.png",
  },
  {
    id: "6",
    name: "Biryani",
    category: "Rice Dishes",
    price: 250,
    image: "/flavorful-biryani.png",
  },
  {
    id: "7",
    name: "Coca Cola",
    category: "Beverages",
    price: 60,
    image: "/refreshing-cola.png",
  },
  {
    id: "8",
    name: "Mango Lassi",
    category: "Beverages",
    price: 100,
    image: "/mango-lassi.png",
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

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-200 overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
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
                  onClick={() => onAddItem(item)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
