import Link from 'next/link';
import { getCalendars } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  const calendars = await getCalendars();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/create">
          <Button>Create New Calendar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calendars.map((calendar) => (
          <Card key={calendar.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{calendar.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">/{calendar.slug}</p>
              <div className="flex gap-2">
                <Link href={`/admin/${calendar.id}`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <Link href={`/c/${calendar.slug}`} target="_blank">
                  <Button variant="secondary">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

