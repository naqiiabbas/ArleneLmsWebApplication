'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const PartnersSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Partners data derived from the visual overview
  const partners = [
    { name: 'Southern California Edison', logo: '/images/partnerlogo1.png' },
    { name: 'Sun Family Foundation', logo: '/images/partnerlogo2.png' },
    { name: 'Orange County Community Foundation', logo: '/images/partnerlogo3.png' },
    { name: 'Edwards Lifesciences Foundation', logo: '/images/partnerlogo4.png' },
    { name: 'African American Alliance Fund', logo: '/images/partnerlogo5.png' },
    // Duplicate or add more to demonstrate slider movement if needed
    { name: 'Southern California Edison 2', logo: '/images/partnerlogo5.png' },
  ];

  const totalSlides = 3; // Matching the 3 dots in the UI

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  return (
    <section className={`${poppins.variable} font-sans bg-white py-16 px-6 md:px-12 lg:px-20`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Heading & Navigation controls */}
        <div className="flex flex-col items-center mb-10 relative">
          <h2 className="text-[#0F172A] text-2xl md:text-3xl font-bold tracking-tight">
            Our Partners
          </h2>
          
          {/* Arrow Controls */}
          <div className="flex gap-2 mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
            <button 
              onClick={prevSlide}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden Overflow Container for Slider */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Logic to group logos for slides or simply scroll a row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-full">
              {partners.slice(0, 5).map((partner, index) => (
                <div 
                  key={index} 
                  className="border border-gray-100 rounded-xl p-6 flex items-center justify-center h-40 shadow-sm"
                >
                  <div className="relative w-full h-full grayscale opacity-80">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Additional slide content would go here for a real loop */}
          </div>
        </div>

        {/* Interactive Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-10">
          {[...Array(totalSlides)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === i 
                ? 'w-4 h-4 bg-[#F4B400]' 
                : 'w-3.5 h-3.5 border-2 border-[#F4B400] bg-transparent'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;