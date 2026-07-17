import Image from "next/image"

export default function Vision() {
  return (
    <section className="bg-white px-4 py-[54px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1260px]">
        <div className="grid items-start gap-[54px] lg:grid-cols-[1fr_452px]">
          <div className="max-w-[620px]">
            <h2 className="mb-[15px] text-[28px] font-bold leading-none text-black md:text-[32px]">
              Our Vision
            </h2>
            <p className="mb-[22px] text-[12px] font-semibold leading-[1.55] text-[#333333]">
              To build a thriving future where African American youth and their families are empowered to reach their fullest potential anchored in equity, enriched by education, and sustained through strong community connections.
            </p>

            <h3 className="mb-[15px] text-[26px] font-bold leading-none text-black md:text-[30px]">
              Mission Statement
            </h3>
            <p className="mb-[18px] text-[12px] font-semibold leading-[1.55] text-[#333333]">
              We achieve this vision by fostering leadership and growth in young Black men through mentorship, education, and community service. By equipping them with skills, support, and opportunities, we strengthen families, elevate communities, and create pathways for lasting success.
            </p>

            <div className="space-y-[14px]">
              <div>
                <h4 className="mb-[6px] text-[14px] font-bold leading-none text-black">Established in 1993</h4>
                <p className="text-[11px] font-semibold leading-[1.5] text-[#4b4b4b]">
                  The 100 Black Men of Orange County became incorporated as a certified 501(c)3 non-profit organization, receiving our charter from 100 Black Men of America in the same year.
                </p>
              </div>

              <div>
                <h4 className="mb-[6px] text-[14px] font-bold leading-none text-black">Serving 1000+ Mentees</h4>
                <p className="text-[11px] font-semibold leading-[1.5] text-[#4b4b4b]">
                  Our program has reached over 1000 mentees over the years, providing health and wellness, tutoring, college guidance, STEAM Programming, and more.
                </p>
              </div>

              <div>
                <h4 className="mb-[6px] text-[14px] font-bold leading-none text-black">Recognized for Excellence</h4>
                <p className="text-[11px] font-semibold leading-[1.5] text-[#4b4b4b]">
                  We are proud to be recognized for our commitment to excellence to our mentees, parents, and our community.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-[4px] h-[318px] overflow-hidden rounded-[8px] md:h-[344px] lg:h-[318px]">
            <Image
              src="/images/home-vision-main.png"
              alt="Group mentoring session"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 452px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
