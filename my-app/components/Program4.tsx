import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const AdditionalProgramsSection = () => {
  return (
    <section className={`${poppins.variable} font-sans py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-8`}>
      
      {/* Health & Wellness Card */}
      <div className="flex flex-col md:flex-row overflow-hidden rounded-[20px] bg-[#F9A825] min-h-[320px]">
        <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-full">
          <Image
            src="/images/programimg7.jpg" 
            alt="Group of young men in a line outdoors"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Health & Wellness</h2>
          <p className="text-[#1A1A1A] text-[15px] leading-relaxed mb-8 opacity-90 font-normal">
            The 100's Health And Wellness Goals Are To Raise Awareness, Provide Access To Health Care And Give Health Information That Will Ultimately Promote Behavior Change Resulting In A Healthier Lifestyle.
          </p>
          <button className="w-fit px-8 py-2.5 border border-[#1A1A1A] rounded-lg text-[14px] font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Economic Empowerment Card */}
      <div className="flex flex-col md:flex-row-reverse overflow-hidden rounded-[20px] bg-[#F9A825] min-h-[320px]">
        <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-full">
          <Image
            src="/images/programimg8.png"
            alt="Crowd of people bowing or stretching outdoors"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Economic Empowerment</h2>
          <p className="text-[#1A1A1A] text-[15px] leading-relaxed mb-8 opacity-90 font-normal">
            The 100 Black Men Of America, Inc. Considers Economic Empowerment Necessary For Creating Just Societies Around The World.
          </p>
          <button className="w-fit px-8 py-2.5 border border-[#1A1A1A] rounded-lg text-[14px] font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Bottom Full Width Image */}
      <div className="pt-12">
        <div className="relative w-full aspect-[10/8] md:aspect-[21/9] rounded-[24px] overflow-hidden">
          <Image
            src="/images/programimg9.png"
            alt="Five men standing together in black and blue shirts"
            fill
            className="object-cover"
            style={{ objectPosition: 'top' }}
            sizes="100vw"
          />
        </div>
      </div>

    </section>
  );
};

export default AdditionalProgramsSection;