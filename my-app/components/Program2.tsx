import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ProgramsMissionSection = () => {
  return (
    <section className={`${poppins.variable} font-sans py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-20`}>
      
      {/* Program Cards Container */}
      <div className="space-y-8">
        {/* Mentoring Card */}
        <div className="flex flex-col md:flex-row overflow-hidden rounded-[20px] bg-[#F9A825] min-h-[300px]">
          <div className="relative w-full md:w-1/2 min-h-[250px]">
            <Image
              src="/images/programimg1.jpg" 
              alt="Student using laptop"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Mentoring</h2>
            <p className="text-[#1A1A1A] text-[15px] leading-relaxed mb-6 opacity-90">
              Mentoring Is Incorporated Into All Programs Delivered By 100 Black Men Chapters Across The Organization's Global Network.
            </p>
            <button className="w-fit px-8 py-2.5 border border-[#1A1A1A] rounded-lg text-[14px] font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Education Card */}
        <div className="flex flex-col md:flex-row-reverse overflow-hidden rounded-[20px] bg-[#F9A825] min-h-[300px]">
          <div className="relative w-full md:w-1/2 min-h-[250px]">
            <Image
              src="/images/programimg2.jpg"
              alt="Students in classroom"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-4">Education</h2>
            <p className="text-[#1A1A1A] text-[15px] leading-relaxed mb-6 opacity-90">
              The 100 Black Men Of America, Inc. Has Been Educating And Empowering Youth For Over Three Decades.
            </p>
            <button className="w-fit px-8 py-2.5 border border-[#1A1A1A] rounded-lg text-[14px] font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Mission Section */}
     <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
  <div className="w-full lg:w-1/2">
    <h2 className="text-[36px] font-bold text-[#1A1A1A] leading-tight mb-4">
      Driven by Compassion, United by Purpose
    </h2>
    <p className="text-[#666666] text-[15px] leading-relaxed mb-10">
      We envision a world where every child has the opportunity to thrive. Through education, healthcare, and community support, we empower families and build brighter futures.
    </p>
    
    <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-8">Our Mission</h3>
    
    <div className="space-y-8">
      <div className="space-y-2">
        <h4 className="text-[16px] font-bold text-[#1A1A1A]">Established in 2001</h4>
        <p className="text-[#666666] text-[14px] leading-relaxed">
          Founded by a group of dedicated volunteers, our organization began with a simple goal: to provide aid to underserved children in our community.
        </p>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-[16px] font-bold text-[#1A1A1A]">Serving 1,000+ Children</h4>
        <p className="text-[#666666] text-[14px] leading-relaxed">
          Today, we've expanded our reach to serve over a thousand children annually, offering programs in education, nutrition, and healthcare.
        </p>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-[16px] font-bold text-[#1A1A1A]">Recognized for Excellence</h4>
        <p className="text-[#666666] text-[14px] leading-relaxed">
          We are proud to be recognized for our commitment to excellence in service and innovation in our programs, ensuring the highest quality of care.
        </p>
      </div>
    </div>
  </div>

  <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-[550px] flex items-center">
    <div className="relative h-[450px] w-full rounded-[24px] overflow-hidden shadow-sm">
      <Image
        src="/images/programimg3.jpg" //
        alt="Students learning together"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
    </div>
  </div>
</div>

    </section>
  );
};

export default ProgramsMissionSection;