"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import { MenuItem } from "./menu-browser";
import { menuAPI } from "@/lib/api";
import { toast, Toaster } from "sonner";

interface MenuItemFormProps {
  item: MenuItem | null;
  onSave: (item: Omit<MenuItem, "id"> | MenuItem) => void;
  onClose: () => void;
}

export function MenuItemForm({ item, onSave, onClose }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "Pizza",
    price: item?.price_list_rate ? String(item.price_list_rate) : "",
    description: item?.description || "",
    available: item?.available ?? true,
    image: item?.image || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | undefined>(
    item?.image
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Pizza",
    "Main Course",
    "Appetizers",
    "Beverages",
    "Desserts",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Processing your request");
    try {
      let uploadedImageUrl: string | undefined = undefined;

      if (imageFile) {
        uploadedImageUrl = await menuAPI.uploadFile(imageFile);
      }
      await menuAPI.addMenuItems({
        item_name: formData.name,
        item_code: formData.name,
        item_group: formData.category,
        description: formData.description,
        stock_uom: "Nos",
        price_list_rate: parseFloat(formData.price),
        image: uploadedImageUrl ?? undefined,
      });
      const numericPrice = parseFloat(formData.price) || 0;

      if (item) {
        onSave({ ...item, ...formData, price_list_rate: numericPrice });
      } else {
        onSave({
          ...formData,

          price_list_rate: numericPrice,
          itemAddOn: [],
        });
      }
      toast.success("Menu item added");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add menu item");
    }
  };

  return (
    <Card className="w-full max-w-xl  border border-border bg-card p-4">
      <Toaster position="top-right" />
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {item ? "Edit Menu Item" : "Add New Menu Item"}
        </h2>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
          <X className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-25 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:bg-muted/80"
          >
            {imagePreview ? (
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex gap-x-2.5 items-center">
          <div className="w-full ">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Item Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="eg: Margherita Pizza"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="border-border "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Price (Birr) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
            required
            min="0"
            step="0.01"
            className="border-border"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            placeholder="Add a description for this item..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
            rows={3}
          />
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, available: e.target.checked }))
            }
            className="h-4 w-4 rounded border-border"
          />
          <label
            htmlFor="available"
            className="text-sm font-medium text-foreground"
          >
            Available Today
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer "
          >
            {item ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
