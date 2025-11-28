"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

async function uploadFile(file: File): Promise<string> {
  // Use Vercel Blob if configured (production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(file.name, file, {
      access: "public",
    });
    return blob.url;
  }

  // Fallback to local filesystem (development)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore if exists
  }

  const uniqueName = `${uuidv4()}-${file.name}`;
  const path = join(uploadDir, uniqueName);
  await writeFile(path, buffer);

  return `/uploads/${uniqueName}`;
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("No file uploaded");
  return await uploadFile(file);
}

export async function verifyCalendarPassword(
  calendarId: string,
  passwordAttempt: string
) {
  const calendar = await prisma.calendar.findUnique({
    where: { id: calendarId },
  });
  if (!calendar) return false;
  if (!calendar.password) return true; // No password needed
  return calendar.password === passwordAttempt;
}

export async function createCalendar(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const password = formData.get("password") as string;
  const backgroundFile = formData.get("background") as File;

  let backgroundUrl = "";
  if (backgroundFile && backgroundFile.size > 0) {
    backgroundUrl = await uploadFile(backgroundFile);
  }

  await prisma.calendar.create({
    data: {
      name,
      slug,
      password: password || null,
      backgroundUrl,
    },
  });

  revalidatePath("/admin");
}

export async function getCalendars() {
  return await prisma.calendar.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCalendar(idOrSlug: string) {
  const calendar = await prisma.calendar.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });
  return calendar;
}

export async function updateCalendar(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const password = formData.get("password") as string;
  const isPublished = formData.get("isPublished") === "true";
  const isTest = formData.get("isTest") === "true";
  const defaultStyle = formData.get("defaultStyle") as string;
  const defaultColor = formData.get("defaultColor") as string;
  const defaultTextColor = formData.get("defaultTextColor") as string;
  const defaultSize = formData.get("defaultSize") as string;
  const defaultFontSize = formData.get("defaultFontSize") as string;
  const backgroundFile = formData.get("background") as File;

  const data: Record<string, any> = {
    name,
    slug,
    password: password || null,
    isPublished,
    isTest,
    defaultStyle: defaultStyle || "circle",
    defaultColor: defaultColor || "#dc2626",
    defaultTextColor: defaultTextColor || "#ffffff",
    defaultSize: defaultSize ? parseFloat(defaultSize) : 6.5,
    defaultFontSize: defaultFontSize ? parseFloat(defaultFontSize) : 40,
  };

  if (backgroundFile && backgroundFile.size > 0) {
    data.backgroundUrl = await uploadFile(backgroundFile);
  }

  await prisma.calendar.update({
    where: { id },
    data,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
}

export async function saveDay(calendarId: string, dayData: any) {
  const {
    id,
    dayNumber,
    content,
    contentType,
    style,
    backgroundColor,
    textColor,
    size,
    fontSize,
    positionX,
    positionY,
  } = dayData;

  const data: any = {
    dayNumber: Number(dayNumber),
    content,
    contentType,
    style: style || "circle",
    backgroundColor: backgroundColor || null,
    textColor: textColor || null,
    size: size ? Number(size) : null,
    fontSize: fontSize ? Number(fontSize) : null,
    positionX: Number(positionX),
    positionY: Number(positionY),
  };

  if (id) {
    await prisma.day.update({
      where: { id },
      data,
    });
  } else {
    data.calendarId = calendarId;
    await prisma.day.create({
      data,
    });
  }

  revalidatePath(`/admin/${calendarId}`);
}

export async function deleteDay(dayId: string, calendarId: string) {
  await prisma.day.delete({ where: { id: dayId } });
  revalidatePath(`/admin/${calendarId}`);
}
