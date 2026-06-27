import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Calendar, CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    services: 0,
    nextAppt: null as any
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const today = format(new Date(), 'yyyy-MM-dd');

      const [
        { count: totalCount },
        { count: pendingCount },
        { count: confirmedCount },
        { count: cancelledCount },
        { count: servicesCount },
        { data: nextApptData }
      ] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('appointments')
          .select('*, services(name)')
          .gte('appointment_date', today)
          .in('status', ['pending', 'confirmed'])
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(1)
          .single()
      ]);

      setStats({
        total: totalCount || 0,
        pending: pendingCount || 0,
        confirmed: confirmedCount || 0,
        cancelled: cancelledCount || 0,
        services: servicesCount || 0,
        nextAppt: nextApptData
      });
      setLoading(false);
    }
    
    loadStats();
  }, []);

  if (loading) return <div className="p-8">Loading overview...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900">Dashboard Overview</h1>
        <p className="text-stone-500">Welcome to the Serene Touch admin portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Appointments</p>
              <h3 className="text-2xl font-semibold text-stone-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Pending</p>
              <h3 className="text-2xl font-semibold text-stone-900">{stats.pending}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Confirmed</p>
              <h3 className="text-2xl font-semibold text-stone-900">{stats.confirmed}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Active Services</p>
              <h3 className="text-2xl font-semibold text-stone-900">{stats.services}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Upcoming Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextAppt ? (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Date</span>
                  <span className="font-medium">{format(new Date(stats.nextAppt.appointment_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Time</span>
                  <span className="font-medium">{stats.nextAppt.start_time} - {stats.nextAppt.end_time}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Client</span>
                  <span className="font-medium">{stats.nextAppt.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Service</span>
                  <span className="font-medium">{stats.nextAppt.services?.name}</span>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 py-4 text-center">No upcoming appointments scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
