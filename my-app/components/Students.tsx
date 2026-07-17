import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const StudentLifeHero = () => {
  return (
    <section className={`${poppins.variable} font-sans relative w-full bg-white`}>
      {/* Banner Image Container */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[480px]">
        {/* Dark overlay for breadcrumb visibility */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <Image
          src="/images/mentor1.png" // Replace with your actual image path
          alt="Students interacting"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Breadcrumb text */}
        <div className="absolute top-10 left-6 md:left-20 z-20">
          <span className="text-white/90 text-sm md:text-base font-medium">
            Home/Student
          </span>
        </div>
      </div>

      {/* Floating Content Card */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative">
        <div className="absolute -top-24 md:-top-32 left-6 md:left-20 right-6 md:right-auto z-30">
          <div className="bg-[#F4B400] rounded-2xl p-8 md:p-10 shadow-xl max-w-[580px] min-h-[180px] flex flex-col justify-center">
            <h1 className="text-black text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Student life here
            </h1>
            <p className="text-black/90 text-[13px] md:text-[15px] leading-relaxed font-normal">
              Cigun University is more than just a place of learning; it&apos;s a place 
              where dreams take flight, where ideas flourish, and where you&apos;ll find 
              the support and...
            </p>
          </div>
        </div>
      </div>
      
      {/* Spacer to handle the absolute positioning overflow */}
      <div className="h-32 md:h-40 bg-white" />
    </section>
  );
};

export default StudentLifeHero;