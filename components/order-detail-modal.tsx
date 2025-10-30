import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    name: string;
    qty: number;
    addons?: { name: string; qty: number }[];
  } | null;
}

export default function OrderDetailModal({
  open,
  onClose,
  item,
}: OrderDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Menu Item */}
          <div className="flex justify-between text-sm">
            <span className="font-medium">Menu Item:</span>
            <span>{item.name}</span>
          </div>

          {/* Quantity */}
          <div className="flex justify-between text-sm">
            <span className="font-medium">Qty:</span>
            <span>{item.qty}</span>
          </div>

          {/* Add-ons */}
          <div>
            <p className="font-medium text-sm mb-1">Add-ons:</p>

            {item.addons && item.addons.length > 0 ? (
              <ul className="list-disc ml-4 space-y-1 text-sm">
                {item.addons.map((addon, index) => (
                  <li key={index}>
                    {addon.name} × {addon.qty}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No add-ons selected</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
