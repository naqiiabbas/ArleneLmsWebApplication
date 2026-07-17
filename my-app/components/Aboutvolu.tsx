import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const RaisingStatsSection = () => {
  return (
    <section className={`${poppins.variable} font-sans py-20 px-6 md:px-12 lg:px-24 bg-white`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content Side */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-[40px] font-bold text-[#1A1A1A] mb-6 leading-tight">
            How we raised 34M
          </h2>
          <p className="text-[#666666] text-[16px] leading-[1.7] mb-12 max-w-xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in 
            eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum 
            nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh.
          </p>

          <div className="flex flex-wrap gap-8 md:gap-16">
            {/* Stat 1 */}
            <div className="flex flex-col">
              <span className="text-[40px] font-bold text-[#1A1A1A] leading-none mb-2">
                34M+
              </span>
              <span className="text-[#666666] text-[14px]">
                Donation Received
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col">
              <span className="text-[40px] font-bold text-[#1A1A1A] leading-none mb-2">
                400+
              </span>
              <span className="text-[#666666] text-[14px]">
                Volunters
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col">
              <span className="text-[40px] font-bold text-[#1A1A1A] leading-none mb-2">
                20+
              </span>
              <span className="text-[#666666] text-[14px]">
                Care homes
              </span>
            </div>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="w-full lg:w-1/2">
          <div className="relative w-full aspect-[1.4/1] rounded-[24px] overflow-hidden shadow-sm">
            <Image
              src="/images/aboutvl.png" // Referenced from the provided file metadata
              alt="Team members"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default RaisingStatsSection;