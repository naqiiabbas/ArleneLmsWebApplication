import React from 'react';
import { Poppins } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const events = [
  {
    day: '13',
    month: 'APR',
    title: 'A day with our wonderful children',
  },
  {
    day: '25',
    month: 'APR',
    title: 'Seminar: Caring for children with autism',
  },
];

const EventsSection = () => {
  return (
    <section className={`${poppins.variable} bg-white px-6 py-[44px] font-sans md:px-12 lg:px-24`}>
      <div className="mx-auto max-w-[1260px]">
        <h2 className="mb-[22px] text-[28px] font-bold text-black">Our Events</h2>
        
        <div className="grid max-w-[980px] grid-cols-1 gap-[20px] md:grid-cols-2">
          {events.map((event, index) => (
            <div 
              key={index} 
              className="flex min-h-[110px] cursor-pointer items-center justify-between rounded-[8px] bg-[#F4B400] p-[24px] transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-[22px]">
                {/* Date column */}
                <div className="flex flex-col items-center">
                  <span className="text-[30px] font-bold leading-none text-black">
                    {event.day}
                  </span>
                  <span className="mt-[2px] text-[12px] font-bold text-black">
                    {event.month}
                  </span>
                </div>

                {/* Content column */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                      NEXT EVENTS
                    </span>
                    <div className="h-[2px] w-[34px] bg-black"></div>
                  </div>
                  <h3 className="max-w-[260px] text-[16px] font-bold leading-tight text-black md:text-[18px]">
                    {event.title}
                  </h3>
                </div>
              </div>

              {/* Arrow button */}
              <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <ArrowRight className="h-[15px] w-[15px] text-black" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
