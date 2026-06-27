import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export default function BlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadBlockedDates();
  }, []);

  async function loadBlockedDates() {
    setLoading(true);
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true });
    if (data) setBlockedDates(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;

    await supabase.from('blocked_dates').insert([{ blocked_date: newDate, reason }]);
    setNewDate('');
    setReason('');
    loadBlockedDates();
  }

  async function handleDelete(id: string) {
    if (confirm('Remove this blocked date?')) {
      await supabase.from('blocked_dates').delete().eq('id', id);
      loadBlockedDates();
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900">Blocked Dates</h1>
        <p className="text-stone-500">Block specific dates so clients cannot book appointments (e.g., holidays, vacations).</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Add Blocked Date</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
              <Input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-stone-700 mb-1">Reason (Optional)</label>
              <Input placeholder="e.g. Public Holiday" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <Button type="submit">Block Date</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-stone-500">Loading...</td></tr>
              ) : blockedDates.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-stone-500">No blocked dates.</td></tr>
              ) : (
                blockedDates.map(date => (
                  <tr key={date.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 font-medium text-stone-900">
                      {format(new Date(date.blocked_date), 'MMMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-stone-500">{date.reason || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(date.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
