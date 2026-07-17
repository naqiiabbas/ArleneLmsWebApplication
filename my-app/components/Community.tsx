'use client';

import Image from "next/image"
import Link from "next/link"
import { ChevronsRight } from "lucide-react";

export default function Community() {
  return (
    <section className="overflow-hidden px-4 py-[70px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1260px]">
        <div className="grid items-center gap-[64px] lg:grid-cols-[1fr_520px]">
          
          {/* Text Content Column */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <h2 className="mb-[14px] max-w-[560px] text-[30px] font-bold leading-tight text-black md:text-[40px]">
              Making a Difference in Our Community
            </h2>
            <p className="mx-auto mb-[22px] max-w-[600px] text-[14px] font-medium leading-[1.55] text-[#333333] lg:mx-0">
              Empowering tomorrow&apos;s leaders through mentorship, education, and community. You 
              can make a difference too!
            </p>

            {/* The Text Block with a Mega Pill Image */}
            <div className="mb-[18px]">
              <h3 className="mb-[8px] text-[15px] font-bold text-black">
                Start helping Team
              </h3>
              <div className="flex flex-col items-center justify-center gap-[12px] text-[13px] text-[#555555] sm:flex-row lg:justify-start">
                <span className="font-medium">There are many variations of active</span>
                
                {/* Mega Pill - Responsive Sizing */}
              <div className="relative h-[42px] w-[190px] flex-shrink-0 md:w-[220px]">

  {/* 🔶 Background Vector */}
  <Image
    src="/images/Maskgroup.png"   // 👈 apna vector yahan rakho
    alt="background design"
    fill
    className="object-contain z-0"
  />

  {/* 🔲 Foreground Image */}
  <div className="absolute inset-0 rounded-full overflow-hidden shadow-md border-2 border-white bg-gray-100 z-10">
    <Image
      src="/images/donate1.png"
      alt="Active donation participation"
      fill
      className="object-cover object-top"
      sizes="(max-width: 768px) 192px, 224px"
    />
  </div>

</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              {/* Styled Donate Button */}
              <Link
                href="/donate"
                className="group inline-flex items-center justify-center gap-[8px] rounded-full border-[2px] border-black bg-[#F4B400] py-[4px] pl-[4px] pr-[20px] text-black transition-all hover:bg-black hover:text-[#F4B400]"
              >
                <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-[2px] border-black bg-white group-hover:border-[#F4B400]">
                  <ChevronsRight className="h-[15px] w-[15px] text-black" />
                </div>
                <span className="whitespace-nowrap text-[13px] font-bold">Donate now</span>
              </Link>
            </div>
          </div>

          {/* Image Column */}
          <div className="relative order-1 flex items-center justify-center py-[10px] lg:order-2">
<div 
  className="absolute top-1/2 left-1/2 -translate-x-[68%] -translate-y-[45%] w-[90%] lg:w-full h-[70%] md:h-[85%] z-0 rounded-3xl rotate-2 md:rotate-0"
>
  <Image
    src="/images/Maskgroup.png"
    alt="background design"
    fill
    className="object-contain z-0"
  />
</div>
            {/* Main Image Container */}
            <div className="relative z-10 aspect-[1.12] w-full max-w-[500px] overflow-hidden rounded-[18px] border-[4px] border-white shadow-xl">
              <Image
                src="/images/donate2.jpg"
                alt="Mentor and student walking together"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
