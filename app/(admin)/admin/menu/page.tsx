"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, LogOut, Search, ImageIcon } from "lucide-react";
import { MenuItemForm } from "@/components/menu-form";
import { MenuItem } from "@/components/menu-browser";

interface MenuManagementInterfaceProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}

export default function MenuManagement({ user }: MenuManagementInterfaceProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Margherita Pizza",
      category: "Pizza",
      valuation_rate: 299,
      available: true,
      description: "Classic pizza with tomato, mozzarella, and basil",
    },
    {
      id: "2",
      name: "Butter Chicken",
      category: "Main Course",
      valuation_rate: 349,
      available: true,
      description: "Tender chicken in creamy tomato sauce",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = [
    "All",
    "Pizza",
    "Main Course",
    "Appetizers",
    "Beverages",
    "Desserts",
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (newItem: Omit<MenuItem, "id">) => {
    const item: MenuItem = {
      ...newItem,
      id: Date.now().toString(),
    };
    setMenuItems([...menuItems, item]);
    setIsFormOpen(false);
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setMenuItems(
      menuItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="pt-6 min-h-screen bg-background">
      <main className="p-6 mt-3\">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex lg:flex-row flex-col gap-y-2.5 gap-x-2.5">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 "
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="w-full flex gap-2 overflow-x-auto flex-nowrap pl-2 pt-4 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap text-xs md:text-sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <MenuItemForm
              item={editingItem}
              onSave={(item) =>
                editingItem
                  ? handleUpdateItem(item as MenuItem)
                  : handleAddItem(item as Omit<MenuItem, "id">)
              }
              onClose={handleCloseForm} // I need to check this on the integration state
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-border"
            >
              {/* Image */}
              <div className="relative h-40 bg-muted">
                {item.image ? (
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute right-2 top-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      item.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                </div>

                {item.description && (
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {item.valuation_rate} Birr
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 gap-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No items found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your filters"
                : "Start by adding your first menu item"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
