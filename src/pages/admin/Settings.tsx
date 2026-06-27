import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BusinessSettings } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from('business_settings').select('*').limit(1).single();
    if (data) setSettings(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    await supabase.from('business_settings').update({
      business_name: settings.business_name,
      business_email: settings.business_email,
      business_phone: settings.business_phone,
      business_address: settings.business_address,
      slot_interval_minutes: settings.slot_interval_minutes,
      booking_notice_hours: settings.booking_notice_hours
    }).eq('id', settings.id);
    
    setSaving(false);
    alert('Settings saved successfully.');
  }

  if (loading) return <div className="p-8">Loading settings...</div>;
  if (!settings) return <div className="p-8">Settings not found.</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-900">Business Settings</h1>
        <p className="text-stone-500">Manage contact information and booking rules.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4 pb-2 border-b border-stone-100">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Business Name</label>
                  <Input 
                    value={settings.business_name} 
                    onChange={e => setSettings({...settings, business_name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <Input 
                    type="email"
                    value={settings.business_email} 
                    onChange={e => setSettings({...settings, business_email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                  <Input 
                    value={settings.business_phone} 
                    onChange={e => setSettings({...settings, business_phone: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                  <Input 
                    value={settings.business_address} 
                    onChange={e => setSettings({...settings, business_address: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4 pb-2 border-b border-stone-100">Booking Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slot Interval (minutes)</label>
                  <p className="text-xs text-stone-500 mb-2">How often appointment times are offered (e.g., every 30 mins)</p>
                  <Input 
                    type="number"
                    min="15"
                    step="15"
                    value={settings.slot_interval_minutes} 
                    onChange={e => setSettings({...settings, slot_interval_minutes: parseInt(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Advance Notice Required (hours)</label>
                  <p className="text-xs text-stone-500 mb-2">Minimum hours required before a booking can be made.</p>
                  <Input 
                    type="number"
                    min="0"
                    value={settings.booking_notice_hours} 
                    onChange={e => setSettings({...settings, booking_notice_hours: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
