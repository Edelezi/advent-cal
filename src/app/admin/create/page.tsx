"use client";

import { createCalendar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      await createCalendar(formData);
      router.push("/admin");
    } catch (error) {
      console.error(error);
      alert("Failed to create calendar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create Calendar</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>

        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" required />
        </div>

        <div>
          <Label htmlFor="password">Password (Optional)</Label>
          <Input id="password" name="password" type="password" />
        </div>

        <div>
          <Label htmlFor="background">Background Image</Label>
          <Input
            id="background"
            name="background"
            type="file"
            accept="image/*"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create"}
        </Button>
      </form>
    </div>
  );
}
