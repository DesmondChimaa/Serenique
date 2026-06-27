import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Service } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

export function getServiceImage(name: string) {
  const n = name.toLowerCase();
  if (n.includes('hot stone')) return "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop";
  if (n.includes('nuru')) return "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop";
  if (n.includes('aromatherapy')) return "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop";
  if (n.includes('deep')) return "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop";
  if (n.includes('swedish')) return "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop";
  
  const defaultImages = [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return defaultImages[hash % defaultImages.length];
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setServices(data);
      }
      setLoading(false);
    }
    loadServices();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img 
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" 
            alt="Spa Treatment" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/30" />
        </div>
        
        <div className="container mx-auto px-6 md:px-10 max-w-7xl relative z-10 flex flex-col pt-20">
          <div className="mb-6 inline-flex items-center gap-2 text-white font-bold tracking-widest text-[10px] uppercase">
             <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
             AWARD-WINNING SPA EXPERIENCE
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-serif text-white max-w-3xl leading-[1.05] mb-10">
            Elevate your well-being with <span className="italic">luxury spa.</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="rounded-full bg-white text-stone-900 hover:bg-stone-100 font-bold tracking-wide h-12 px-8" asChild>
              <Link to="/book">
                Book a Treatment
                <span className="ml-2 bg-stone-900 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                </span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/20 hover:text-white font-bold tracking-wide h-12 px-8 bg-transparent backdrop-blur-sm" asChild>
              <a href="#services">Explore Services</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 bg-stone-50 border-b border-stone-200/50">
        <div className="container mx-auto px-6 md:px-10 max-w-7xl">
           <p className="text-center text-xs text-stone-500 font-medium mb-8">Trusted by the industry's leading brands</p>
           <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
             <div className="text-xl font-serif italic font-bold">logoipsum</div>
             <div className="text-xl font-serif italic font-bold">logoipsum</div>
             <div className="text-xl font-serif italic font-bold">logoipsum</div>
             <div className="text-xl font-serif italic font-bold">logoipsum</div>
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          {loading ? (
            <div className="text-center text-stone-500 py-12">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center text-stone-500 py-12">No services available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:flex md:flex-row gap-4 md:h-[500px]">
              {services.map((service, index) => {
                const imgUrl = getServiceImage(service.name);
                
                return (
                  <div key={service.id} className="group relative rounded-3xl overflow-hidden min-h-[250px] md:min-h-0 flex-1 md:hover:flex-[2.5] transition-all duration-500 ease-out cursor-pointer flex flex-col justify-end bg-stone-900 border border-stone-200/20">
                    <img 
                      src={imgUrl} 
                      alt={service.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent md:via-transparent" />
                    
                    <div className="relative z-10 p-6 md:p-8">
                      <h3 className="text-2xl font-serif text-white">{service.name}</h3>
                      <div className="overflow-hidden md:max-h-0 md:group-hover:max-h-40 transition-all duration-500 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100 mt-2 md:mt-0 md:group-hover:mt-3">
                        <p className="text-stone-300 text-sm mb-4 line-clamp-2 md:line-clamp-3">{service.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-accent-500">
                          <span>{service.duration_minutes} MIN</span>
                          <span>${service.price}</span>
                          <Link to={`/book?service=${service.id}`} className="ml-auto text-white hover:text-stone-200 underline underline-offset-4">Book</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-stone-50">
        <div className="container mx-auto px-6 md:px-10 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="aspect-[4/5] bg-stone-200 rounded-[2rem] overflow-hidden relative">
                <img 
                   src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1000&auto=format&fit=crop" 
                   alt="Spa Treatment" 
                   className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 text-stone-500 font-bold tracking-widest text-[10px] uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                ABOUT US
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-[1.2]">
                At Serenique Spa, we believe wellness is more than a treatment — it's a ritual.
              </h2>
              <p className="text-stone-500 text-lg leading-relaxed">
                Our expert therapists blend traditional healing with modern techniques, delivering moments of deep renewal.
              </p>
              
              <div className="pt-4 pb-8 border-b border-stone-200/60">
                <Button className="rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-wide h-12 px-8" asChild>
                  <Link to="/#about">
                    About us More
                    <span className="ml-2 bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                    </span>
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4">
                 <div>
                   <div className="text-4xl md:text-5xl font-serif text-stone-900 mb-2">14k<span className="text-accent-500 font-sans text-3xl">+</span></div>
                   <div className="text-xs text-stone-500 leading-relaxed uppercase tracking-widest font-bold">Client<br/>Satisfaction</div>
                 </div>
                 <div>
                   <div className="text-4xl md:text-5xl font-serif text-stone-900 mb-2">20<span className="text-accent-500 font-sans text-3xl">+</span></div>
                   <div className="text-xs text-stone-500 leading-relaxed uppercase tracking-widest font-bold">Years of<br/>Experience</div>
                 </div>
                 <div>
                   <div className="text-4xl md:text-5xl font-serif text-stone-900 mb-2">68<span className="text-accent-500 font-sans text-3xl">%</span></div>
                   <div className="text-xs text-stone-500 leading-relaxed uppercase tracking-widest font-bold">Health<br/>Improvement</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-primary-900 text-white">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl text-center mb-16">
           <div className="mb-4 inline-flex items-center gap-2 text-white/70 font-bold tracking-widest text-[10px] uppercase">
             TREATMENT PROCESS
           </div>
           <h2 className="text-4xl md:text-5xl font-serif leading-[1.2]">
             Transforming your journey<br/>into <span className="italic opacity-90">pure relaxation.</span>
           </h2>
        </div>

        <div className="container mx-auto px-6 md:px-10 max-w-5xl relative">
          <div className="space-y-16 relative">
            {/* The vertical line */}
            <div className="absolute left-1/2 top-10 bottom-10 w-px bg-white/20 -translate-x-1/2 hidden md:block"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 flex justify-end">
                <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop" className="w-full md:w-[80%] rounded-3xl object-cover aspect-[4/3] shadow-lg" alt="Step 1" />
              </div>
              <div className="relative flex justify-center hidden md:flex shrink-0">
                <div className="w-12 h-12 rounded-full bg-white text-primary-900 flex items-center justify-center font-bold z-10 outline outline-[6px] outline-white/20 text-lg shadow-xl">1</div>
              </div>
              <div className="w-full md:w-1/2 space-y-3 md:pl-8">
                <h3 className="text-3xl font-serif">Book Your Appointment</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">Choose your preferred treatment, date, and therapist through our seamless online booking system. We confirm instantly & send reminders.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 md:flex-row-reverse">
              <div className="w-full md:w-1/2 flex justify-start">
                <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600&auto=format&fit=crop" className="w-full md:w-[80%] rounded-3xl object-cover aspect-[4/3] shadow-lg" alt="Step 2" />
              </div>
              <div className="relative flex justify-center hidden md:flex shrink-0">
                <div className="w-12 h-12 rounded-full bg-white text-primary-900 flex items-center justify-center font-bold z-10 outline outline-[6px] outline-white/20 text-lg shadow-xl">2</div>
              </div>
              <div className="w-full md:w-1/2 space-y-3 md:pr-8 text-left md:text-right flex flex-col items-start md:items-end">
                <h3 className="text-3xl font-serif">Personalized Wellness Session</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">Upon arrival, our experts assess your skin, needs, and wellness goals to customize treatment and deliver an exceptional experience.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 flex justify-end">
                <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop" className="w-full md:w-[80%] rounded-3xl object-cover aspect-[4/3] shadow-lg" alt="Step 3" />
              </div>
              <div className="relative flex justify-center hidden md:flex shrink-0">
                <div className="w-12 h-12 rounded-full bg-white text-primary-900 flex items-center justify-center font-bold z-10 outline outline-[6px] outline-white/20 text-lg shadow-xl">3</div>
              </div>
              <div className="w-full md:w-1/2 space-y-3 md:pl-8">
                <h3 className="text-3xl font-serif">Restore & Glow</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">Enjoy a luxurious spa experience with calming ambiance, premium products, soothing aromatherapy, and professional care.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-stone-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop" 
          alt="Spa Treatment Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-primary-900/30 mix-blend-multiply" />
        
        <div className="container mx-auto px-6 md:px-10 max-w-7xl relative z-10 flex justify-center">
          <div className="bg-white rounded-[2.5rem] p-12 md:p-16 text-center max-w-2xl w-full shadow-2xl">
            <div className="mb-6 inline-flex items-center justify-center gap-2 text-stone-500 font-bold tracking-widest text-[10px] uppercase w-full">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
               GET STARTED
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-[1.2] mb-10">
              Ready to Began Your<br/>Spa Treatment Journey
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold tracking-wide h-12 px-8" asChild>
                <Link to="/book">
                  Book a Treatment
                  <span className="ml-2 bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-bold tracking-wide h-12 px-8 bg-transparent" asChild>
                <a href="#services">Explore Services</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple decorative leaf icon
function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
