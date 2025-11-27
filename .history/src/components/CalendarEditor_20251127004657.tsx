"use client";

import { useState, useRef, useEffect, createRef } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { saveDay, deleteDay, uploadMedia, updateCalendar } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Plus, Trash, Settings, Save } from "lucide-react";
import Image from "next/image";

interface Day {
  id?: string;
  dayNumber: number;
  content: string | null;
  contentType: string;
  positionX: number;
  positionY: number;
  calendarId: string;
  nodeRef?: React.RefObject<HTMLDivElement>;
}

interface Calendar {
  id: string;
  name: string;
  slug: string;
  backgroundUrl: string | null;
  isPublished: boolean;
  days: Day[];
}

export default function CalendarEditor({ calendar }: { calendar: Calendar }) {
  // Initialize days with Refs
  const [days, setDays] = useState<Day[]>(() =>
    calendar.days.map((d) => ({ ...d, nodeRef: createRef<HTMLDivElement>() }))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleAddDay = () => {
    const newDay: Day = {
      dayNumber: days.length + 1,
      content: JSON.stringify({ text: "" }),
      contentType: "text",
      positionX: 10,
      positionY: 10,
      calendarId: calendar.id,
      nodeRef: createRef<HTMLDivElement>(),
    };
    // Don't add to list yet, wait for save? Or add temporary?
    // Let's add temporary so we can drag it immediately
    setDays([...days, newDay]);
    // Wait, if we add it, we should maybe save it first or mark as unsaved?
    // For simplicity, let's just add it to state.
    // The previous implementation set selectedDay and opened dialog.
    // If we want to drag immediately, we need it in the list.

    // To match previous flow:
    // 1. Add to days state so it renders and is draggable
    // 2. Open dialog to edit details
    setSelectedDay(newDay);
    setIsDayDialogOpen(true);
  };

  const handleEditDay = (day: Day) => {
    setSelectedDay(day);
    setIsDayDialogOpen(true);
  };

  const handleDeleteDay = async (dayId: string | undefined) => {
    if (!confirm("Are you sure?")) return;
    if (dayId) {
      await deleteDay(dayId, calendar.id);
    }
    setDays(days.filter((d) => d.id !== dayId));
  };

  const handleDragStop = async (e: any, data: any, day: Day) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const x = (data.x / containerWidth) * 100;
    const y = (data.y / containerHeight) * 100;

    const updatedDay = { ...day, positionX: x, positionY: y };

    setDays(days.map((d) => (d === day ? updatedDay : d)));

    // Only save if it has an ID (was created)
    if (updatedDay.id) {
      await saveDay(calendar.id, updatedDay);
    }
  };

  const saveDayData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    setIsSaving(true);
    await saveDay(calendar.id, selectedDay);
    router.refresh(); // This will fetch fresh data
    setIsDayDialogOpen(false);
    setIsSaving(false);
  };

  // Sync state with props when router refreshes, but preserve refs if possible or recreate
  useEffect(() => {
    // When calendar.days updates (from server), we need to merge with local state to keep refs if we want,
    // OR just recreate refs. Recreating refs might cause issues if dragging is active, but here we only sync on refresh/mount.
    setDays(
      calendar.days.map((d) => ({ ...d, nodeRef: createRef<HTMLDivElement>() }))
    );
  }, [calendar.days]);

  // ... (rest of the component) ...
  // Need to verify `saveSettings` matches previous

  const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateCalendar(calendar.id, formData);
    router.refresh();
    setIsSettingsOpen(false);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-white border-b flex justify-between items-center z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">{calendar.name}</h1>
          <div className="flex gap-2 text-sm text-gray-500 items-center">
            <span>/{calendar.slug}</span>
            {calendar.isPublished ? (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                Published
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                Draft
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSettingsOpen(true)} variant="secondary">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button onClick={handleAddDay}>
            <Plus className="w-4 h-4 mr-2" /> Add Day
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Exit
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 overflow-auto p-8 flex justify-center items-start">
        <div
          ref={containerRef}
          className="relative bg-white shadow-2xl overflow-hidden rounded-lg border border-gray-200"
          style={{
            width: "1000px",
            height: "800px",
            backgroundImage: calendar.backgroundUrl
              ? `url(${calendar.backgroundUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!calendar.backgroundUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No background image
            </div>
          )}

          {days.map((day, index) => {
            const x =
              (day.positionX / 100) *
              (containerRef.current?.offsetWidth || 1000);
            const y =
              (day.positionY / 100) *
              (containerRef.current?.offsetHeight || 800);

            // Ensure we have a ref
            if (!day.nodeRef) {
              day.nodeRef = createRef();
            }

            return (
              <Draggable
                key={day.id || `new-${index}`}
                defaultPosition={{ x, y }}
                position={{ x, y }} // Control position fully
                bounds="parent"
                nodeRef={day.nodeRef}
                onStop={(e, data) => handleDragStop(e, data, day)}
              >
                <div
                  ref={day.nodeRef}
                  className="absolute w-16 h-16 bg-red-600 text-white flex items-center justify-center rounded-full shadow-lg cursor-move hover:scale-110 transition-transform group z-20"
                >
                  <span className="font-bold text-xl drop-shadow-md">
                    {day.dayNumber}
                  </span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 bg-white p-1 rounded-full shadow-md">
                    <button
                      className="bg-blue-500 p-1.5 rounded-full text-white hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDay(day);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      className="bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDay(day.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>

      <DayDialog
        open={isDayDialogOpen}
        onOpenChange={setIsDayDialogOpen}
        day={selectedDay}
        setDay={setSelectedDay}
        onSave={saveDayData}
        isSaving={isSaving}
      />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
            {/* Fix for Description Warning: Add a description or visually hidden one */}
            <p className="text-sm text-gray-500">
              Update your calendar configuration below.
            </p>
          </DialogHeader>
          <form onSubmit={saveSettings} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={calendar.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={calendar.slug}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">
                Password (Leave empty to keep unchanged)
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="background">Change Background</Label>
              <Input
                id="background"
                name="background"
                type="file"
                accept="image/*"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                name="isPublished"
                value="true"
                defaultChecked={calendar.isPublished}
              />
              <Label htmlFor="isPublished">Published (Publicly Viewable)</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayDialog({ open, onOpenChange, day, setDay, onSave, isSaving }: any) {
  if (!day) return null;

  const content = day.content ? JSON.parse(day.content) : {};

  const updateContent = (key: string, value: string) => {
    const newContent = { ...content, [key]: value };
    setDay({ ...day, content: JSON.stringify(newContent) });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const url = await uploadMedia(formData);
        updateContent("url", url);
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Day {day.dayNumber}</DialogTitle>
          <p className="text-sm text-gray-500">
            Configure content for this day.
          </p>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Day Number</Label>
              <Input
                type="number"
                value={day.dayNumber}
                onChange={(e) =>
                  setDay({ ...day, dayNumber: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={day.contentType}
                onValueChange={(val) => setDay({ ...day, contentType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="photo">Photo + Text</SelectItem>
                  <SelectItem value="music">Music + Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <Label className="mb-2 block font-semibold">Content</Label>

            {day.contentType === "text" && (
              <Textarea
                placeholder="Enter text..."
                value={content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                className="min-h-[150px]"
              />
            )}

            {day.contentType === "photo" && (
              <div className="space-y-4">
                <div>
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  {content.url && (
                    <div className="mt-2 relative h-48 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <Image
                        src={content.url}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Caption</Label>
                  <Textarea
                    placeholder="Enter caption..."
                    value={content.text || ""}
                    onChange={(e) => updateContent("text", e.target.value)}
                  />
                </div>
              </div>
            )}

            {day.contentType === "music" && (
              <div className="space-y-4">
                <div>
                  <Label>Music File</Label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                  />
                  {content.url && (
                    <audio controls src={content.url} className="mt-2 w-full" />
                  )}
                </div>
                <div>
                  <Label>Text / Lyrics</Label>
                  <Textarea
                    placeholder="Enter text..."
                    value={content.text || ""}
                    onChange={(e) => updateContent("text", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
