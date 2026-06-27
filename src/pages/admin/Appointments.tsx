import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { format } from 'date-fns';
import { formatTime } from '../../lib/utils';
import { Search, Trash2 } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes, price)')
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });
      
    if (data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    loadAppointments();
  }

  async function deleteAppt(id: string) {
    if (confirm('Are you sure you want to delete this appointment?')) {
      await supabase.from('appointments').delete().eq('id', id);
      loadAppointments();
    }
  }

  const filtered = appointments.filter(a => {
    const matchesSearch = (a.full_name + a.email + a.phone).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-medium text-stone-900">Appointments</h1>
          <p className="text-stone-500">Manage booking requests and schedule.</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <Input 
              placeholder="Search by name, email, or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select 
            className="flex h-10 w-full sm:w-[200px] rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Client Info</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-stone-500">No appointments found.</td></tr>
              ) : (
                filtered.map(appt => (
                  <tr key={appt.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-stone-900">{format(new Date(appt.appointment_date), 'MMM d, yyyy')}</div>
                      <div className="text-stone-500">{formatTime(appt.start_time)} - {formatTime(appt.end_time)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{appt.full_name}</div>
                      <div className="text-stone-500">{appt.phone}</div>
                      <div className="text-stone-500">{appt.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{appt.services?.name}</div>
                      {appt.notes && <div className="text-xs text-stone-500 mt-1 max-w-[200px] truncate" title={appt.notes}>Note: {appt.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                        ${appt.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${appt.status === 'cancelled' ? 'bg-stone-100 text-stone-800' : ''}
                      `}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
                          value={appt.status}
                          onChange={e => updateStatus(appt.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                        <Button variant="ghost" size="sm" onClick={() => deleteAppt(appt.id)} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
