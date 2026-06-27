import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BusinessHours } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessHoursPage() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHours();
  }, []);

  async function loadHours() {
    setLoading(true);
    const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
    
    if (data && data.length > 0) {
      setHours(data);
    } else {
      // Initialize if empty (fallback)
      const defaultHours = DAYS.map((_, i) => ({
        id: `temp-${i}`,
        weekday: i,
        is_open: i > 0 && i < 6,
        start_time: '09:00:00',
        end_time: '17:00:00'
      }));
      setHours(defaultHours as any);
    }
    setLoading(false);
  }

  const handleChange = (index: number, field: keyof BusinessHours, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    
    for (const h of hours) {
      const payload = {
        is_open: h.is_open,
        start_time: h.is_open ? h.start_time : null,
        end_time: h.is_open ? h.end_time : null,
      };
      await supabase.from('business_hours').update(payload).eq('id', h.id);
    }
    
    setSaving(false);
    alert('Business hours saved successfully.');
    loadHours();
  };

  if (loading) return <div className="p-8">Loading business hours...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900">Business Hours</h1>
        <p className="text-stone-500">Set your weekly operating schedule.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-stone-100">
            {hours.map((h, i) => (
              <div key={h.id || i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4 w-48">
                  <input 
                    type="checkbox"
                    checked={h.is_open}
                    onChange={e => handleChange(i, 'is_open', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="font-medium text-stone-900">{DAYS[h.weekday]}</span>
                </div>
                
                {h.is_open ? (
                  <div className="flex items-center gap-4 flex-1">
                    <Input 
                      type="time" 
                      value={h.start_time || ''} 
                      onChange={e => handleChange(i, 'start_time', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-stone-500">to</span>
                    <Input 
                      type="time" 
                      value={h.end_time || ''} 
                      onChange={e => handleChange(i, 'end_time', e.target.value)}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-stone-400 italic">Closed</div>
                )}
              </div>
            ))}
          </div>
          <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
