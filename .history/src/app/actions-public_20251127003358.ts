'use server';

import { prisma } from '@/lib/prisma';

export async function getPublicCalendar(slug: string) {
  const calendar = await prisma.calendar.findUnique({
    where: { slug },
    include: {
      days: {
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  if (!calendar || !calendar.isPublished) return null;

  // Mask password
  const { password, ...rest } = calendar;
  return {
    ...rest,
    hasPassword: !!password,
  };
}

