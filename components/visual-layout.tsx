"use client";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

interface Room {
  id: string;
  name: string;
  type: "VIP" | "Standard";
  tables: Table[];
}

export function RoomVisualLayout({
  room,
  onTableStatusChange,
}: {
  room: Room;
  onTableStatusChange: (
    tableId: string,
    status: "available" | "occupied" | "reserved"
  ) => void;
}) {
  const getTableColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 hover:bg-green-200";
      case "occupied":
        return "bg-red-100 border-red-300 hover:bg-red-200";
      case "reserved":
        return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate grid layout based on number of tables
  const tableCount = room.tables.length;
  const cols = Math.ceil(Math.sqrt(tableCount));

  return (
    <div className="w-full">
      <div
        className="grid gap-4 p-6 bg-muted/30 rounded-lg border border-primary/10"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
        }}
      >
        {room.tables.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No tables added yet. Add tables to visualize the room layout.
            </p>
          </div>
        ) : (
          room.tables.map((table) => (
            <div
              key={table.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getTableColor(
                table.status
              )}`}
              onClick={() => {
                const nextStatus =
                  table.status === "available"
                    ? "occupied"
                    : table.status === "occupied"
                    ? "reserved"
                    : "available";
                onTableStatusChange(table.id, nextStatus);
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {table.number}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Cap: {table.capacity}
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {getStatusLabel(table.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
      </div>
    </div>
  );
}
