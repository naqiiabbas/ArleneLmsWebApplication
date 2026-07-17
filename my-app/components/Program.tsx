'use client';

import Image from "next/image"

const programFeatures = [
  {
    icon: "/images/home-program-icon-1.png",
    title: "Mentorship",
    description: "Building youth with wisdom, accountability, and guidance from experienced mentors.",
  },
  {
    icon: "/images/home-program-icon-2.png",
    title: "Education",
    description: "Fostering opportunity through tutoring, critical thinking, and literacy growth.",
  },
  {
    icon: "/images/home-mental-health-icon.png",
    title: "Mental Health",
    description: "Support for the emotional and psychological well-being of our youth.",
  },
  {
    icon: "/images/home-program-icon-small.png",
    title: "Community Involvement",
    description: "Building strong communities through service, leadership, and civic engagement.",
  },
  {
    icon: "/images/home-program-icon-1.png",
    title: "Familial Support & Engagement",
    description: "Strengthening families as the foundation for sustainable success.",
  },
]

export default function Program() {
  return (
    <section className="bg-[#fbb33b] px-4 py-[58px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1260px]">
        <div className="grid items-center gap-[48px] lg:grid-cols-[560px_1fr]">
          
          {/* Layout Updated to match image_1.png */}
          <div className="grid h-[420px] grid-cols-[220px_1fr] gap-[18px] md:h-[510px]">
            
{/* Left Column (Two Stacked Wide Images) */}
            <div className="flex flex-col justify-center gap-[18px]">
              {/* Added aspect-video and removed flex-1 on the inner containers */}
              <div className="relative aspect-[1.45] overflow-hidden rounded-[8px]">
                <Image
                  src="/images/singleimage2.jpg" // The top image
                  alt="Students gathering in assembly"
                  fill
                  className="object-cover"
                  priority // Good practice for above-the-fold content
                />
              </div>
              <div className="relative aspect-[1.45] overflow-hidden rounded-[8px]">
                <Image
                  src="/images/singleimage3.jpg" // The bottom image
                  alt="Students seated in classroom"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column (Single Tall Image) */}
            <div className="relative overflow-hidden rounded-[8px]">
              <Image
                src="/images/singleimage.jpg" // The large, tall image from image_1.png
                alt="Presentation 'Meet Your Mentors' occurring in large hall"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content (Remains same, but matches color scheme) */}
          <div>
            <h2 className="mb-[26px] text-[30px] font-bold leading-tight text-black md:text-[38px]">
              What Our Program Offers
            </h2>
            
            <div className="space-y-[18px]">
              {programFeatures.map((feature, index) => (
                <div key={index} className="flex gap-[14px]">
                  <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-black">
                    <Image src={feature.icon} alt="" width={28} height={28} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="mb-[2px] text-[17px] font-bold leading-none text-black">
                      {feature.title}
                    </h3>
                    <p className="max-w-[520px] text-[13px] font-medium leading-[1.45] text-black/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
