import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const BlogDetailSection = () => {
  const latestInsights = [
    {
      image: '/images/blogimg2.jpg',
      title: 'Revolutionizing Recycling: AI-Driven Solutions for Solar Waste',
    },
    {
      image: '/images/blogimg3.png',
      title: 'The Solar Panel Shortage: Challenges and Creative Solutions',
    },
    {
      image: '/images/blogimg4.png',
      title: 'Sustainable Innovations: The Future of Solar Panel Design',
    },
    {
      image: '/images/blogimg5.jpg',
      title: 'Recycling Tech: How Innovations are Shaping Solar Panel Reuse',
    },
  ];

  return (
    <div className={`${poppins.variable} font-sans bg-white`}>
      {/* Hero Header */}
      <section className="relative w-full h-[320px] overflow-hidden">
        <Image
          src="/images/blogdash.jpg"
          alt="Blogs Header Background"
          fill
          priority
          className="object-cover brightness-[0.3]"
        />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-24 flex flex-col justify-center">
          <div className="absolute top-8 left-6 lg:left-24">
            <span className="text-white/80 text-xs md:text-sm font-medium">
              Home/Breaking the Silence: Black Voices on Suicide and Survival
            </span>
          </div>
          <div className="text-center mt-12">
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight">
              Blogs
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Blog Post */}
          <div className="flex-1">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src="/images/blogimg1.png"
                alt="Breaking The Silence"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex justify-between items-start mb-4">
              <h2 className="text-[#1a1a1a] text-2xl md:text-3xl font-bold leading-tight max-w-2xl">
                Breaking The Silence: Black Voices On Suicide And Survival
              </h2>
              <span className="bg-[#E0F2FE] text-[#0369A1] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Skills Development
              </span>
            </div>

            <div className="text-gray-400 text-xs font-medium mb-6">
              By Sarah Johnson <span className="mx-2">•</span> 3/4/2025
            </div>

            <div className="space-y-6 text-[#444444] text-[14px] leading-relaxed">
              <p>
                Suicide and mental health challenges are too often met with silence in the Black community. 
                <span className="font-bold"> "Breaking the Silence: Black Voices on Suicide and Survival"</span> creates space for truth, healing, and resilience.
              </p>
              
              <div>
                <h4 className="font-bold text-[#1a1a1a] mb-2">Why It Matters</h4>
                <p>
                  For generations, stigma and systemic barriers have made it difficult to talk about mental health. Breaking this silence is about more than awareness — it&apos;s about saving lives and creating stronger, more supportive communities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1a1a1a] mb-2">Event Details</h4>
                <p>Tuesday, September 24</p>
                <p>6:00 — 7:30 PM (EST)</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1a1a1a] mb-2">Join Us via Zoom</h4>
                <p>
                  This event is an invitation to listen, learn, and take part in a powerful conversation. Together, we can break the silence and strengthen our community.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              {['#communication', '#skills', '#development'].map((tag) => (
                <span key={tag} className="text-gray-400 text-[11px] font-medium px-2 py-1 bg-gray-50 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:w-[320px]">
            <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1a1a1a] text-lg font-bold mb-6 pb-2 border-b-2 border-[#F4B400] inline-block">
                Latest Insights
              </h3>
              
              <div className="space-y-8">
                {latestInsights.map((insight, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative w-full h-24 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={insight.image}
                        alt="Insight thumbnail"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-[#1a1a1a] text-[12px] font-bold leading-snug mb-2 group-hover:text-[#F4B400] transition-colors">
                      {insight.title}
                    </h4>
                    <div className="flex items-center text-[#F4B400] text-[10px] font-bold uppercase tracking-wider">
                      Explore More
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          
        </div>
      </section>
    </div>
  );
};

export default BlogDetailSection;