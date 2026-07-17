import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const EnvironmentalSection = () => {
  return (
    <section className={`${poppins.variable} font-sans py-16 px-6 md:px-12 lg:px-24 bg-white`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Side: Image Collage */}
        <div className="w-full lg:w-[45%] flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/5] rounded-[20px] overflow-hidden">
              <Image 
                src="/images/comab1.jpg" 
                alt="Mentorship" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden">
              <Image 
                src="/images/comab2.jpg" 
                alt="Classroom setting" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden">
              <Image 
                src="/images/comab3.jpg" 
                alt="Group photo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="bg-[#F6F4F0] rounded-[20px] p-6 flex flex-col items-center justify-center text-center">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image src="/images/comab4.png" alt="User" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <button className="bg-white px-6 py-2 rounded-full text-[14px] font-bold text-black shadow-sm">
                Join Our Community
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-[55%] pt-4">
          <h2 className="text-[36px] md:text-[42px] font-bold text-black leading-[1.2] mb-6">
            Join Us 100 Black in The Fight for Environment
          </h2>
          
          <div className="space-y-6 text-[#666666] text-[15px] leading-[1.7]">
            <p>
              The 100 BMOC strive to empower the African American community by providing focused, effective, 
              and participatory leadership that improves public policy and enhances the overall education, 
              quality of life, social and economic status of underrepresented groups in our communities. It is an 
              organization committed to developing and strengthening a partnership among home, school, and 
              community of young African American males with the objective of ensuring that each element of 
              the partnership work together in the best interest of all African American males and their families.
            </p>
            <p>
              Moreover, the 100BMOC firmly believes that a strengthened partnership among home, school, and 
              community will result in an enriched Orange County. The chapter focuses on four initiatives, which 
              include Education, Mentoring, Health and Wellness and Economic Empowerment. Our signature 
              program, &quot;Passport to the Future&quot; is based on an educational and cultural foundation where core 
              areas of mastery are combined with group mentoring experiences to form our intervention with 
              male youth grades 6-12.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-8 mb-10">
            <div className="relative w-14 h-14 rounded-full overflow-hidden object-top" >
              <Image src="/images/comab5.jpg" alt="Hendrik Morella" fill className="object-cover" style={{ objectPosition: 'top' }} />
            </div>
            <div>
              <h4 className="text-[#F4B400] font-bold text-[18px]">Hendrik Morella</h4>
              <p className="text-[#666666] text-[14px]">Founder Organizations</p>
            </div>
          </div>

          <div className="flex flex-col gap-[16px] rounded-[8px] bg-[#F4B400] p-[12px] sm:flex-row">
            <button className="flex-1 overflow-hidden rounded-[6px] bg-white transition-colors hover:bg-[#f7f7f7]">
              <span className="flex h-[68px] w-full items-center justify-center text-[22px] font-bold text-black">
                Register for Evenet
              </span>
            </button>
            <button className="h-[68px] flex-1 rounded-[6px] bg-white text-[22px] font-bold text-black transition-colors hover:bg-[#f7f7f7]">
              Join & Involved
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalSection;
