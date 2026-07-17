import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});



const AboutIntroduction = () => {
  return (
    <div className={`${poppins.variable} font-sans w-full`}>
      {/* Breadcrumb & Title Banner Section */}
      <section className="relative flex h-[340px] w-full flex-col justify-center text-white md:h-[344px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about1.jpg" // Reference to About Us.jpg header area
            alt="About Us Background"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1560px] px-[110px] max-[1200px]:px-[28px]">
          <nav className="mb-[24px] flex items-center gap-[2px] text-left text-[20px] font-medium leading-none text-white/90">
            <span>Home</span>
            <span>/</span>
            <span className="font-medium">About us</span>
          </nav>
          <h1 className="text-center text-[52px] font-bold leading-none md:text-[58px]">
            About us
          </h1>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="bg-white px-6 py-[88px] md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-12 lg:flex-row">
          {/* Left Column: Headline */}
          <div className="pt-[54px] lg:w-1/2">
            <h2 className="max-w-[460px] text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1A1A1A] md:text-[40px]">
              We are a non-governmental organization
            </h2>
          </div>

          {/* Right Column: Description Text */}
          <div className="lg:w-1/2 space-y-6">
            <p className="text-[#666666] text-[15px] leading-[1.8]">
              In January of 1993, a group of black men in Orange County recognized there was a need for the 
              underserved black male youth in the county. Recognizing that the 100 Black Men of America was one of 
              the most influential organizations in the country, these men came together and applied to be part of 
              that organization, having formed an Orange County chapter also known as 100 Black Men of Orange 
              County. In that same year, 100BMOC became incorporated as a certified 501(c)3 non-profit 
              organization, being led by our very first chapter President, Mr. Eugene Wheeler.
            </p>
            <p className="text-[#666666] text-[15px] leading-[1.8]">
              Today, the 100 BMOC is comprised of more than 35 members who are committed in the areas 
              of education, mentoring, economic development, empowerment, health and wellness, and 
              more.
            </p>
          </div>
        </div>
      </section>
    </div>

  );
};

export default AboutIntroduction;
