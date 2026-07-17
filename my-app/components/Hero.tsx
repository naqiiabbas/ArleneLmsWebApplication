"use client"

import Image from "next/image"
import { Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative h-[520px] overflow-hidden bg-gray-200 md:h-[700px] lg:h-[830px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/dasboard.png"
          alt="William"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="flex h-[54px] w-[54px] items-center justify-center rounded-full border-[2px] border-white bg-black/20 transition-colors hover:bg-black/40 md:h-[64px] md:w-[64px]">
          <Play className="ml-[3px] h-[22px] w-[22px] fill-white text-white md:h-[26px] md:w-[26px]" />
        </button>
      </div>

      {/* Name Overlay */}
      <div className="absolute bottom-[38px] left-[8%] w-[380px] max-w-[82vw] md:bottom-[58px]">
        <div className="relative bg-[#f4b400] px-[52px] py-[8px] text-center">
          <span className="absolute left-[22px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-[13px] border-l-[10px] border-r-[10px] border-b-[#df9f00] border-l-transparent border-r-transparent" />
          <h2 className="text-[26px] font-bold leading-none tracking-[0.03em] text-black md:text-[36px]">
            WILLIAM
          </h2>
        </div>
        <div className="ml-[118px] -mt-[1px] bg-white/92 px-[36px] py-[6px] text-center shadow-sm">
          <span className="text-[18px] font-medium uppercase tracking-[0.04em] text-black md:text-[25px]">
            PARTICIPANT
          </span>
        </div>
      </div>
    </section>
  )
}
