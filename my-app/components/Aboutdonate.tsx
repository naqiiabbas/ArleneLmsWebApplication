import React from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const CallToAction = () => {
  return (
    <section className={`${poppins.variable} font-sans py-12 px-4 sm:px-6 lg:px-8 bg-white`}>
      <div className="max-w-6xl mx-auto relative overflow-hidden rounded-[20px] min-h-[380px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/images/Abdonate.jpg')`, // Fixed: Wrapped path in url()
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h2 className="text-white text-[28px] md:text-[36px] font-bold leading-tight mb-8">
            You can contribute to provide a place for children with special needs!
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-[#F4B400] hover:bg-[#e2a600] text-[#1A1A1A] font-bold py-4 px-8 rounded-[8px] transition-colors text-[16px]">
              Join as a volunteer
            </button>
            <button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#1A1A1A] font-bold py-4 px-12 rounded-[8px] transition-colors text-[16px]">
              Donate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;