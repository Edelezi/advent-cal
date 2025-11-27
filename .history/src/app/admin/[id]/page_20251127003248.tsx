import { getCalendar } from '@/app/actions';
import CalendarEditor from '@/components/CalendarEditor';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCalendarPage({ params }: PageProps) {
  const { id } = await params;
  const calendar = await getCalendar(id);

  if (!calendar) {
    notFound();
  }

  return <CalendarEditor calendar={calendar} />;
}

