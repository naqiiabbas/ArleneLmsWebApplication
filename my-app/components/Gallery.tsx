import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const GallerySection = () => {
  return (
    <section className={`${poppins.variable} font-sans bg-white`}>
      {/* Hero Header Section */}
      <div className="relative flex h-[300px] w-full flex-col justify-center overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/faq.png" 
            alt="Gallery Background"
            fill
            className="object-cover brightness-[1]"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1260px] px-6 md:px-12 lg:px-20">
          <nav className="mb-[26px] flex items-center justify-start gap-1 text-[14px] font-medium leading-none opacity-90">
            <span>Home</span>
            <span>/</span>
            <span>Gallery</span>
          </nav>
          <h1 className="text-center text-[32px] font-bold leading-tight md:text-[48px]">
            Our Gallery is a Visual <br />
            <span className="text-[#F9A825]">Celebration</span> of the Joy
          </h1>
        </div>
      </div>

      {/* Gallery Content Section */}
      <div className="max-w-7xl mx-auto py-20 px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column */}
          <div className="w-full lg:w-[40%] flex flex-col justify-end">
            <div className="mb-8">
              <span className="text-[#F9A825] text-[12px] font-bold uppercase tracking-wider block mb-2">
                EXPLORE THE VIBRANCY
              </span>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#1A1A1A] leading-tight">
                Take A Glimpse Into The Daily Life At Our School
              </h2>
            </div>
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-sm">
              <Image
                src="/images/gallery.jpg"
                alt="Students working at computer"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Middle Column (Large Video/Image) */}
          <div className="w-full lg:w-[35%]">
            <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-md group cursor-pointer">
              <Image
                src="/images/galleryimg1.jpg"
                alt="Man holding rocket model"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#F9A825] border-b-[10px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[25%] flex flex-col gap-8">
            <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm">
              <Image
                src="/images/galleryimg2.jpg"
                alt="Student with rocket"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-[#F9A825] p-8 rounded-[24px] text-[#1A1A1A]">
              <h3 className="text-[18px] font-bold mb-3">Immerse Yourself</h3>
              <p className="text-[13px] leading-relaxed mb-4 opacity-90">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              </p>
              <p className="text-[13px] leading-relaxed opacity-90">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GallerySection;
