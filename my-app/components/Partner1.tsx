import React from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ImpactInNumbers = () => {
  const stats = [
    {
      value: "100%",
      label: "High school graduation rate",
    },
    {
      value: "95%",
      label: "College acceptance rate",
    },
    {
      value: "400,000+",
      label: "In scholarships",
    },
  ];

  return (
    <section className={`${poppins.variable} font-sans bg-[#F4B400] py-16 px-4 md:px-8`}>
      <div className="max-w-7xl mx-auto text-center">
        {/* Section Header */}
        <h2 className="text-3xl md:text-[40px] font-bold text-black mb-4">
          Your Impact in Numbers
        </h2>
        <p className="text-black text-sm md:text-base mb-12 font-medium">
          Over the past 30 years, our Passport to The Future program has generated these results:
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg py-12 px-6 transition-transform hover:scale-[1.02]"
            >
              <div className="text-[#F4B400] text-4xl md:text-5xl font-bold mb-3">
                {stat.value}
              </div>
              <div className="text-gray-700 text-sm md:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactInNumbers;