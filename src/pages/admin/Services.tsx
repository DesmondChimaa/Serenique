import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  }

  function resetForm() {
    setName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setIsActive(true);
    setEditId(null);
    setIsEditing(false);
  }

  function handleEdit(service: Service) {
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration_minutes.toString());
    setPrice(service.price.toString());
    setIsActive(service.is_active);
    setEditId(service.id);
    setIsEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      description,
      duration_minutes: parseInt(duration),
      price: parseFloat(price),
      is_active: isActive
    };

    if (editId) {
      await supabase.from('services').update(payload).eq('id', editId);
    } else {
      await supabase.from('services').insert([payload]);
    }
    
    resetForm();
    loadServices();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this service?')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        if (confirm('This service has existing appointments. Deleting it will also delete all associated appointments. Are you sure you want to proceed?')) {
          await supabase.from('appointments').delete().eq('service_id', id);
          await supabase.from('services').delete().eq('id', id);
          loadServices();
        }
      } else {
        loadServices();
      }
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('services').update({ is_active: !current }).eq('id', id);
    loadServices();
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium text-stone-900">Services</h1>
          <p className="text-stone-500">Manage the massage and wellness services you offer.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="mb-8 border-primary-100 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">{editId ? 'Edit Service' : 'New Service'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Service Name</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Duration (min)</label>
                    <Input required type="number" min="15" step="15" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                    <Input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-stone-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-stone-700">Active (Visible on booking page)</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                <Button type="submit">Save Service</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-stone-500">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-8 text-center text-stone-500 bg-white rounded-xl border border-stone-200">No services found. Add one above.</div>
        ) : (
          services.map(service => (
            <Card key={service.id} className={!service.is_active ? 'opacity-60 bg-stone-50' : ''}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg text-stone-900">{service.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(service)} className="h-8 w-8 p-0 text-stone-500">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4 h-10">{service.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="font-medium text-stone-900">
                    {service.duration_minutes} min • ${service.price}
                  </div>
                  <button 
                    onClick={() => toggleActive(service.id, service.is_active)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'}`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
