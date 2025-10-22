"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomVisualLayout } from "@/components/visual-layout";

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

const ROOM_TYPES = ["VIP", "Standard"];

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "VIP-1",
      type: "VIP",
      tables: Array.from({ length: 10 }, (_, i) => ({
        id: `vip1-${i + 1}`,
        number: i + 1,
        capacity: 4,
        status: "available" as const,
      })),
    },
    {
      id: "2",
      name: "VIP-2",
      type: "VIP",
      tables: Array.from({ length: 10 }, (_, i) => ({
        id: `vip2-${i + 1}`,
        number: i + 1,
        capacity: 4,
        status: "available" as const,
      })),
    },
    {
      id: "3",
      name: "Standard",
      type: "Standard",
      tables: Array.from({ length: 30 }, (_, i) => ({
        id: `std-${i + 1}`,
        number: i + 1,
        capacity: 2,
        status: "available" as const,
      })),
    },
  ]);

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingTable, setEditingTable] = useState<{
    roomId: string;
    table: Table;
  } | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"VIP" | "Standard">(
    "Standard"
  );
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;

    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName,
      type: newRoomType,
      tables: [],
    };

    setRooms([...rooms, newRoom]);
    setNewRoomName("");
    setNewRoomType("Standard");
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const handleAddTable = (roomId: string) => {
    if (!newTableNumber.trim() || !newTableCapacity.trim()) return;

    const tableNumber = Number.parseInt(newTableNumber);
    const capacity = Number.parseInt(newTableCapacity);

    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            tables: [
              ...room.tables,
              {
                id: `${roomId}-${Date.now()}`,
                number: tableNumber,
                capacity,
                status: "available" as const,
              },
            ],
          };
        }
        return room;
      })
    );

    setNewTableNumber("");
    setNewTableCapacity("");
  };

  const handleDeleteTable = (roomId: string, tableId: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            tables: room.tables.filter((t) => t.id !== tableId),
          };
        }
        return room;
      })
    );
  };

  const handleUpdateTable = (roomId: string, updatedTable: Table) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            tables: room.tables.map((t) =>
              t.id === updatedTable.id ? updatedTable : t
            ),
          };
        }
        return room;
      })
    );
    setEditingTable(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Room & Table Management
          </h1>
          <p className="text-muted-foreground">
            Configure rooms, tables, and seating arrangements
          </p>
        </div>

        {/* Add Room Section */}
        <Card className="mb-8 p-6 border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Add New Room
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="room-name" className="text-sm font-medium">
                Room Name
              </Label>
              <Input
                id="room-name"
                placeholder="e.g., VIP-1, Standard"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="room-type" className="text-sm font-medium">
                Room Type
              </Label>
              <Select
                value={newRoomType}
                onValueChange={(value: "VIP" | "Standard") =>
                  setNewRoomType(value)
                }
              >
                <SelectTrigger id="room-type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddRoom}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
          </div>
        </Card>

        {/* Rooms List */}
        <Tabs defaultValue={rooms[0]?.id} className="w-full">
          <TabsList className="grid w-full gap-2 mb-6 bg-muted p-1 h-auto flex-wrap justify-start">
            {rooms.map((room) => (
              <TabsTrigger
                key={room.id}
                value={room.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {room.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {rooms.map((room) => (
            <TabsContent key={room.id} value={room.id} className="space-y-6">
              {/* Room Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {room.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Type: {room.type} • Tables: {room.tables.length}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRoom(room.id)}
                  className="bg-destructive/90 hover:bg-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Room
                </Button>
              </div>

              {/* Visual Layout */}
              <Card className="p-6 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Room Layout
                </h3>
                <RoomVisualLayout
                  room={room}
                  onTableStatusChange={(tableId, status) => {
                    setRooms(
                      rooms.map((r) => {
                        if (r.id === room.id) {
                          return {
                            ...r,
                            tables: r.tables.map((t) =>
                              t.id === tableId ? { ...t, status } : t
                            ),
                          };
                        }
                        return r;
                      })
                    );
                  }}
                />
              </Card>

              {/* Add Table Section */}
              <Card className="p-6 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Add Table to {room.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label
                      htmlFor={`table-number-${room.id}`}
                      className="text-sm font-medium"
                    >
                      Table Number
                    </Label>
                    <Input
                      id={`table-number-${room.id}`}
                      type="number"
                      placeholder="e.g., 1"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`table-capacity-${room.id}`}
                      className="text-sm font-medium"
                    >
                      Capacity
                    </Label>
                    <Input
                      id={`table-capacity-${room.id}`}
                      type="number"
                      placeholder="e.g., 4"
                      value={newTableCapacity}
                      onChange={(e) => setNewTableCapacity(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleAddTable(room.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Table
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Tables Grid */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Tables
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {room.tables.map((table) => (
                    <Card
                      key={table.id}
                      className="p-4 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Table {table.number}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Capacity: {table.capacity} persons
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTable(room.id, table.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            table.status === "available"
                              ? "bg-green-500"
                              : table.status === "occupied"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-sm font-medium text-foreground capitalize">
                          {table.status}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary/30 hover:bg-primary/5 bg-transparent"
                            onClick={() =>
                              setEditingTable({ roomId: room.id, table })
                            }
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-primary/20">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">
                              Edit Table {table.number}
                            </DialogTitle>
                          </DialogHeader>
                          {editingTable?.table.id === table.id && (
                            <TableEditForm
                              table={editingTable.table}
                              onSave={(updatedTable) =>
                                handleUpdateTable(room.id, updatedTable)
                              }
                              onCancel={() => setEditingTable(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function TableEditForm({
  table,
  onSave,
  onCancel,
}: {
  table: Table;
  onSave: (table: Table) => void;
  onCancel: () => void;
}) {
  const [number, setNumber] = useState(table.number.toString());
  const [capacity, setCapacity] = useState(table.capacity.toString());
  const [status, setStatus] = useState(table.status);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-number" className="text-sm font-medium">
          Table Number
        </Label>
        <Input
          id="edit-number"
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="edit-capacity" className="text-sm font-medium">
          Capacity
        </Label>
        <Input
          id="edit-capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="edit-status" className="text-sm font-medium">
          Status
        </Label>
        <Select
          value={status}
          onValueChange={(value: "available" | "occupied" | "reserved") =>
            setStatus(value)
          }
        >
          <SelectTrigger id="edit-status" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button
          onClick={() =>
            onSave({
              ...table,
              number: Number.parseInt(number),
              capacity: Number.parseInt(capacity),
              status,
            })
          }
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Save
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-primary/30 bg-transparent"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
