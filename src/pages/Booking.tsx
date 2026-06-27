import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, addDays, isSameDay, startOfDay, addMinutes, isAfter, isBefore, parseISO, parse } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Service, BusinessHours, BlockedDate, BusinessSettings, BookedSlot } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Check, ChevronRight, Clock, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import { formatTime } from '../lib/utils';

type Step = 1 | 2 | 3 | 4 | 5;

interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service');

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const [
        { data: sData },
        { data: hData },
        { data: bData },
        { data: settsData }
      ] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('business_hours').select('*'),
        supabase.from('blocked_dates').select('*'),
        supabase.from('business_settings').select('*').limit(1).single()
      ]);

      if (sData) setServices(sData);
      if (hData) setBusinessHours(hData);
      if (bData) setBlockedDates(bData);
      if (settsData) setSettings(settsData);

      if (initialServiceId && sData) {
        const serv = sData.find(s => s.id === initialServiceId);
        if (serv) setSelectedService(serv);
      }

      setLoading(false);
    }
    loadInitialData();
  }, [initialServiceId]);

  // Load available slots when date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedService || !settings) return;
      
      setSlotsLoading(true);
      setAvailableSlots([]);
      setSelectedSlot(null);

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Get booked slots for this date
      const { data: bookedSlots } = await supabase
        .rpc('get_booked_slots', { selected_date: dateStr });

      const dayOfWeek = selectedDate.getDay();
      const hoursForDay = businessHours.find(h => h.weekday === dayOfWeek);

      if (!hoursForDay || !hoursForDay.is_open || !hoursForDay.start_time || !hoursForDay.end_time) {
        setSlotsLoading(false);
        return; // Closed this day
      }

      // Generate all possible slots for the day
      const [startH, startM] = hoursForDay.start_time.split(':').map(Number);
      const [endH, endM] = hoursForDay.end_time.split(':').map(Number);
      
      const dayStart = new Date(selectedDate);
      dayStart.setHours(startH, startM, 0, 0);
      
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(endH, endM, 0, 0);

      const now = new Date();
      const noticeTime = addMinutes(now, (settings.booking_notice_hours || 0) * 60);

      const generatedSlots: TimeSlot[] = [];
      let currentSlotStart = new Date(dayStart);

      while (currentSlotStart < dayEnd) {
        const currentSlotEnd = addMinutes(currentSlotStart, selectedService.duration_minutes);
        
        // Ensure slot doesn't exceed closing time
        if (currentSlotEnd <= dayEnd) {
          
          // Must be after notice time
          if (isAfter(currentSlotStart, noticeTime)) {
            
            // Check overlaps with existing bookings
            let hasOverlap = false;
            if (bookedSlots) {
               for (const booking of (bookedSlots as BookedSlot[])) {
                  if (booking.status === 'cancelled') continue; // Cancelled don't block
                  
                  const bStart = new Date(selectedDate);
                  const [bh, bm] = booking.start_time.split(':').map(Number);
                  bStart.setHours(bh, bm, 0, 0);
                  
                  const bEnd = new Date(selectedDate);
                  const [eh, em] = booking.end_time.split(':').map(Number);
                  bEnd.setHours(eh, em, 0, 0);

                  // Overlap rule: new_start < existing_end AND new_end > existing_start
                  if (currentSlotStart < bEnd && currentSlotEnd > bStart) {
                    hasOverlap = true;
                    break;
                  }
               }
            }

            if (!hasOverlap) {
              generatedSlots.push({
                start: currentSlotStart,
                end: currentSlotEnd,
                label: format(currentSlotStart, 'h:mm a')
              });
            }
          }
        }
        
        // Move to next slot interval
        currentSlotStart = addMinutes(currentSlotStart, settings.slot_interval_minutes || 30);
      }

      setAvailableSlots(generatedSlots);
      setSlotsLoading(false);
    }

    fetchSlots();
  }, [selectedDate, selectedService, settings, businessHours]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    
    const appointment_date = format(selectedDate, 'yyyy-MM-dd');
    const start_time = format(selectedSlot.start, 'HH:mm:ss');
    const end_time = format(selectedSlot.end, 'HH:mm:ss');

    const { error } = await supabase.from('appointments').insert([{
      full_name: fullName,
      email,
      phone,
      service_id: selectedService.id,
      appointment_date,
      start_time,
      end_time,
      status: 'pending',
      notes
    }]);

    setSubmitting(false);

    if (error) {
      if (error.message.includes('overlap')) {
         alert('Sorry, that time has just been booked. Please choose another available time.');
         // Go back to time selection
         setStep(3);
         setSelectedSlot(null);
      } else {
         alert('An error occurred during booking. Please try again.');
         console.error(error);
      }
    } else {
      setStep(5);
    }
  };

  // Helper to generate calendar days for next 30 days
  const calendarDays = useMemo(() => {
    const days = [];
    let current = startOfDay(new Date());
    for (let i = 0; i < 30; i++) {
      const d = addDays(current, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const dayOfWeek = d.getDay();
      const hours = businessHours.find(h => h.weekday === dayOfWeek);
      const isBlocked = blockedDates.some(b => b.blocked_date === dateStr);
      
      const isAvailable = hours?.is_open && !isBlocked;
      
      days.push({
        date: d,
        isAvailable
      });
    }
    return days;
  }, [businessHours, blockedDates]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-stone-500">Loading booking system...</div>;
  }

  return (
    <div className="bg-stone-50 min-h-screen pt-32 md:pt-40 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {step < 5 && (
          <div className="mb-8 text-center">
            <span className="inline-block text-[10px] font-bold tracking-widest text-accent-500 uppercase mb-2">
              Step {step} of 4
            </span>
            <h1 className="text-4xl font-serif italic tracking-tight text-stone-900 mb-4">Book Your Session</h1>
            <div className="flex items-center justify-center text-xs font-bold tracking-widest uppercase text-stone-400 gap-2">
               <span className={step >= 1 ? 'text-primary-600' : ''}>Service</span>
               <ChevronRight className="h-3 w-3" />
               <span className={step >= 2 ? 'text-primary-600' : ''}>Date</span>
               <ChevronRight className="h-3 w-3" />
               <span className={step >= 3 ? 'text-primary-600' : ''}>Time</span>
               <ChevronRight className="h-3 w-3" />
               <span className={step >= 4 ? 'text-primary-600' : ''}>Details</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
          
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="p-6 sm:p-10">
              <h2 className="text-xl font-medium text-stone-900 mb-6">Select a Service</h2>
              {services.length === 0 ? (
                <p className="text-stone-500 text-center py-8">No services available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(service => (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-primary-600 ring-1 ring-primary-600 bg-stone-50' : 'hover:border-stone-300'}`}
                      onClick={() => {
                        setSelectedService(service);
                        setStep(2);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-stone-900">{service.name}</h3>
                          {selectedService?.id === service.id && <Check className="h-5 w-5 text-primary-600" />}
                        </div>
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-stone-600 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {service.duration_minutes} min</span>
                          <span>${service.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {step === 2 && (
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-stone-500 hover:text-stone-900 -ml-3">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h2 className="text-xl font-medium text-stone-900">Select Date</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {calendarDays.map((day, i) => {
                  const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                  return (
                    <button
                      key={i}
                      disabled={!day.isAvailable}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setStep(3);
                      }}
                      className={`
                        p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center
                        ${isSelected ? 'border-primary-600 bg-primary-600 text-white shadow-md' : 
                          day.isAvailable ? 'border-stone-200 bg-white hover:border-primary-600 hover:bg-stone-50' : 
                          'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <span className="text-xs uppercase font-medium tracking-wider mb-1 opacity-80">
                        {format(day.date, 'EEE')}
                      </span>
                      <span className="text-xl font-semibold">
                        {format(day.date, 'd')}
                      </span>
                      <span className="text-xs mt-1 opacity-80">
                        {format(day.date, 'MMM')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT TIME */}
          {step === 3 && (
            <div className="p-6 sm:p-10">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-stone-500 hover:text-stone-900 -ml-3">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <div>
                    <h2 className="text-xl font-medium text-stone-900">Select Time</h2>
                    {selectedDate && <p className="text-sm text-stone-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>}
                  </div>
                </div>
              </div>

              {slotsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-500 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  <p>Checking availability...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No available slots</h3>
                  <p className="text-stone-500 mb-6">There are no available appointment times on this date. Please select another date.</p>
                  <Button variant="outline" onClick={() => setStep(2)}>Choose Another Date</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(4);
                      }}
                      className="p-4 rounded-xl border border-stone-200 text-center hover:border-primary-600 hover:bg-stone-50 hover:text-primary-600 transition-colors font-medium text-stone-700"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}
          {step === 4 && (
            <div className="p-6 sm:p-10 flex flex-col md:flex-row gap-10">
              <div className="md:w-2/3">
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-stone-500 hover:text-stone-900 -ml-3">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <h2 className="text-xl font-medium text-stone-900">Your Details</h2>
                </div>

                <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <Input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                      <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                      <Input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Appointment Notes (Optional)</label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests, injuries, or focus areas..." />
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? 'Confirming...' : 'Confirm Appointment'}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="md:w-1/3">
                <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 sticky top-24">
                  <h3 className="font-medium text-stone-900 mb-4 pb-4 border-b border-stone-200">Appointment Summary</h3>
                  
                  {selectedService && (
                    <div className="mb-4">
                      <p className="text-sm text-stone-500 mb-1">Service</p>
                      <p className="font-medium text-stone-900">{selectedService.name}</p>
                      <p className="text-sm text-stone-600">{selectedService.duration_minutes} min • ${selectedService.price}</p>
                    </div>
                  )}

                  {selectedDate && selectedSlot && (
                    <div className="mb-4 pb-4 border-b border-stone-200">
                      <p className="text-sm text-stone-500 mb-1">Date & Time</p>
                      <p className="font-medium text-stone-900">{format(selectedDate, 'MMMM d, yyyy')}</p>
                      <p className="text-sm text-stone-600">{selectedSlot.label}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-medium text-stone-900 pt-2">
                    <span>Total</span>
                    <span>${selectedService?.price || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <div className="p-12 text-center max-w-lg mx-auto">
              <div className="mx-auto w-16 h-16 bg-primary-600/10 text-primary-600 rounded-full flex items-center justify-center mb-6">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-medium text-stone-900 mb-2">Booking Confirmed</h2>
              <p className="text-stone-600 mb-8">
                Your appointment request has been submitted successfully. You will receive an email to finalize your confirmation.
              </p>

              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 text-left mb-8 space-y-3">
                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500 text-sm">Service</span>
                  <span className="font-medium text-stone-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500 text-sm">Date</span>
                  <span className="font-medium text-stone-900">{selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500 text-sm">Time</span>
                  <span className="font-medium text-stone-900">{selectedSlot?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 text-sm">Guest Name</span>
                  <span className="font-medium text-stone-900">{fullName}</span>
                </div>
              </div>

              <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
                Return to Home
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
