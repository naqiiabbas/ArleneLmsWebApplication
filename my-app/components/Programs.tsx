import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const PassportImpactSection = () => {
  return (
    <div className={`${poppins.variable} font-sans`}>
      {/* Hero Header Section */}
      <section className="relative flex h-[300px] w-full flex-col justify-center overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/faq.png" // Derived from background in reference
            alt="Passport to the Future Header"
            fill
            className="object-cover brightness-[1]"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1260px] px-6 md:px-12 lg:px-20">
          <nav className="mb-[18px] flex items-center justify-start gap-1 text-[14px] font-medium leading-none opacity-90">
            <span>Home</span>
            <span>/</span>
            <span>Passport to the Future</span>
          </nav>
          <h1 className="text-center text-[42px] font-bold tracking-tight">Passport to the Future</h1>
        </div>
      </section>

      {/* Impact Content Section */}
      <section className="bg-white py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Image Side */}
          <div className="relative w-full lg:w-1/2">
            <div className="relative rounded-[20px] overflow-hidden aspect-[4/5] w-full">
              <Image
                src="/images/program.jpg" 
                alt="Students in classroom"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Circular Impact Badge */}
            <div className="absolute bottom-[-78px] right-[-20px] rounded-full bg-white p-[7px] shadow-xl md:bottom-[-70px] md:right-[-36px]">
              <div className="flex h-[164px] w-[164px] flex-col items-center justify-center rounded-full border border-[#FFB800] border-opacity-70">
                <span className="text-[52px] font-bold leading-none text-[#FFB800]">20+</span>
                <span className="mt-[20px] text-[13px] font-semibold text-[#1A1A1A]">Years of Impact</span>
              </div>
            </div>
          </div>

          {/* Right Content Side */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1A1A1A] leading-tight mb-6">
              Driven by Compassion, United by Purpose
            </h2>
            
            <p className="text-[#666666] text-[15px] leading-relaxed mb-10">
              We envision a world where every child has the opportunity to thrive. Through 
              education, healthcare, and community support, we empower families and build 
              brighter futures.
            </p>

            <div className="space-y-8">
              {/* Feature 1 */}
              <div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Established in 2001</h3>
                <p className="text-[#666666] text-[15px] leading-relaxed">
                  Founded by a group of dedicated volunteers, our organization began with a 
                  simple goal: to provide aid to underserved children in our community.
                </p>
              </div>

              {/* Feature 2 */}
              <div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Serving 1,000+ Children</h3>
                <p className="text-[#666666] text-[15px] leading-relaxed">
                  Today, we&apos;ve expanded our reach to serve over a thousand children annually, 
                  offering programs in education, nutrition, and healthcare.
                </p>
              </div>

              {/* Feature 3 */}
              <div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Recognized for Excellence</h3>
                <p className="text-[#666666] text-[15px] leading-relaxed">
                  We are proud to be recognized for our commitment to excellence in service and 
                  innovation in our programs, ensuring the highest quality of care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PassportImpactSection;
