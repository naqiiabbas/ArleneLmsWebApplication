'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const testimonials = [
  {
    id: 1,
    image: "/images/testimonials.jpg",
    quote: "As a business owner, I needed a reliable solar solution for my warehouse. Their advanced panel technology has exceeded expectations, and the financing options made it all possible.",
    author: "Mathew Miller",
    role: "Environmental Engineer"
  },
  {
    id: 2,
    image: "/images/testimonials.jpg",
    quote: "The mentorship program has been a transformative experience for my son. Seeing him engage with leaders who look like him has boosted his confidence and academic drive significantly.",
    author: "Sarah Jenkins",
    role: "Community Parent"
  },
  {
    id: 3,
    image: "/images/testimonials.jpg",
    quote: "We've seen a remarkable difference in the local youth since this program launched. The focus on both character and practical skills creates a truly holistic environment for growth.",
    author: "David Thompson",
    role: "Education Consultant"
  },
  {
    id: 4,
    image: "/images/testimonials.jpg",
    quote: "Expertly organized and deeply impactful. The 'Passport to the Future' curriculum is exactly what our community needs to bridge the opportunity gap for the next generation.",
    author: "Linda Rhodes",
    role: "Project Coordinator"
  }
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
      setIsExiting(false);
    }, 300);
  }, []);

  const handlePrev = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setIsExiting(false);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const current = testimonials[activeIndex];

  return (
    <section className={`${poppins.variable} overflow-hidden bg-[#F8F9FA] px-4 py-[76px] font-sans md:px-10 lg:px-20`}>
      <div className="mx-auto max-w-[1040px]">
        <h2 className="mb-[34px] max-w-[560px] text-[38px] font-bold leading-[1.08] text-[#1A1A1A]">
          What Parents Say About Our Program
        </h2>

        <div className={`flex flex-col items-center gap-[46px] transition-opacity duration-300 lg:flex-row lg:gap-[76px] ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          {/* Image Side */}
          <div className="w-full max-w-[330px]">
            <div className="relative aspect-[0.86] overflow-hidden rounded-[8px] shadow-sm">
              <Image
                src={current.image}
                alt={current.author}
                fill
                className="object-cover transition-transform duration-500 scale-100"
              />
            </div>
            {/* Pagination Dots */}
            <div className="mt-[18px] flex gap-[8px]">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                      setActiveIndex(idx);
                      setIsExiting(false);
                    }, 300);
                  }}
                  className={`h-[7px] w-[7px] rounded-full bg-[#F4B400] transition-opacity duration-300 ${activeIndex === idx ? 'opacity-100' : 'opacity-30'}`}
                />
              ))}
            </div>
          </div>

          {/* Content Side */}
          <div className="relative flex-1 pt-[22px]">
            {/* Quote Icon */}
            <div className="mb-[18px] text-[#F4B400]">
              <svg width="24" height="19" viewBox="0 0 34 26" fill="currentColor">
                <path d="M0 15.1176V0H12.9412V15.1176H6.47059C6.47059 18.7059 9.35294 21.5882 12.9412 21.5882V25.8824C7.17647 25.8824 2.52941 21.2353 2.52941 15.1176H0ZM21.0588 15.1176V0H34V15.1176H27.5294C27.5294 18.7059 30.4118 21.5882 34 21.5882V25.8824C28.2353 25.8824 23.5882 21.2353 23.5882 15.1176H21.0588Z" />
              </svg>
            </div>

            <blockquote className="mb-[28px] min-h-[86px] max-w-[650px] text-[15px] font-semibold leading-[1.55] text-[#1A1A1A] md:text-[16px]">
              {current.quote}
            </blockquote>

            <div className="border-t border-[#D9D9D9] pt-[18px]">
              <h4 className="text-[13px] font-bold text-[#1A1A1A]">{current.author}</h4>
              <p className="mt-[2px] text-[11px] text-[#666666]">{current.role}</p>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-[36px] flex gap-[12px] lg:absolute lg:bottom-0 lg:right-0">
              <button 
                onClick={handlePrev}
                className="flex h-[30px] w-[44px] items-center justify-center rounded-[4px] border border-[#bdbdbd] text-[#666666] transition-colors hover:bg-[#1A1A1A] hover:text-white"
              >
                <ArrowLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                className="flex h-[30px] w-[44px] items-center justify-center rounded-[4px] border border-[#bdbdbd] text-[#666666] transition-colors hover:bg-[#1A1A1A] hover:text-white"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
