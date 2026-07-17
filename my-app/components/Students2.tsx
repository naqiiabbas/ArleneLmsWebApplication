import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const HealthWellnessSection = () => {
  return (
    <section className={`${poppins.variable} font-sans bg-white py-12 md:py-16`}>
      {/* Container matched to standard page alignment */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          
          {/* Image Container */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-sm">
              <Image
                src="/images/studentimg3.png"
                alt="Student on stairs"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Text Content Container */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#000000] mb-6 leading-tight">
              Health & Wellness
            </h2>
            
            <div className="space-y-6">
              <p className="text-[#333333] text-[15px] md:text-[16px] leading-[1.8] font-normal">
                Lorem ipsum dolor sit amet consec tetura magna aliqua. Ut enim
                ad minim ven iamquis amet consectet adipis.
              </p>
              
              <p className="text-[#333333] text-[15px] md:text-[16px] leading-[1.8] font-normal">
                Lorem ipsum dolor sit amet conse cteturadigna aliqua enim ad
                minim ven.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HealthWellnessSection;