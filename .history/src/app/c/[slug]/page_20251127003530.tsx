import { getPublicCalendar } from '@/app/actions-public';
import CalendarDisplay from '@/components/CalendarDisplay';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { slug } = await params;
  const calendar = await getPublicCalendar(slug);

  if (!calendar) {
    notFound();
  }

  return <CalendarDisplay calendar={calendar as any} />;
}

