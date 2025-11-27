import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCalendars } from '@/app/actions';

export default async function Home() {
  const calendars = await getCalendars();
  const publishedCalendars = calendars.filter(c => c.isPublished);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8">
      <h1 className="text-6xl font-bold mb-8 text-red-500 font-serif tracking-tighter">Advent Creator</h1>
      
      <div className="flex gap-4 mb-12">
        <Link href="/admin">
          <Button variant="secondary" size="lg">Go to Admin Dashboard</Button>
        </Link>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Public Calendars</h2>
        {publishedCalendars.length === 0 ? (
          <p className="text-gray-400 italic">No published calendars yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedCalendars.map(c => (
              <Link href={`/c/${c.slug}`} key={c.id}>
                <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="text-sm text-gray-400 mt-2">/{c.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
