import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const GalleryGrid = () => {
  const galleryItems = [
    { title: '2026 SCHOOL OF YEAR', user: '100 Black man', likes: '79', views: '4k', img: '/images/galleryimg6.jpg' },
    { title: 'WOMEN EVENT 2026', user: '200 Black woman', likes: '8', views: '6k', img: '/images/galleryimg7.jpg' },
    { title: 'MENTORSHIP PROGRAM 2026', user: '150 Hispanic man', likes: '72', views: '5k', img: '/images/galleryimg8.jpg' },
    { title: 'TRAINING SEMINAR 2026', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg9.jpg' },
    { title: 'APPRECIATION DAY', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg10.jpg' },
    { title: 'HEALTH & WELLNESS CAMP', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg11.jpg' },
    { title: 'GALA NIGHT 2025', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg12.jpg' },
    { title: '2026 ANNUAL AWARDS', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg13.jpg' },
    { title: 'PARENT ENGAGEMENT', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg14.jpg' },
    { title: 'TALENT SHOWCASE', user: '250 Asian woman', likes: '90', views: '7k', img: '/images/galleryimg6.jpg' },
  ];

  return (
    <section className={`${poppins.variable} font-sans py-16 px-4 md:px-8 lg:px-20 max-w-[1440px] mx-auto`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
        {galleryItems.map((item, index) => (
          <div key={index} className="flex flex-col">
            {/* Image Container */}
            <div className="relative group aspect-square rounded-[12px] overflow-hidden mb-3">
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
              />
              {/* Overlay Tags */}
              <div className="absolute top-3 left-3 bg-[#1e2330]/60 backdrop-blur-sm px-2 py-1 rounded-[4px]">
                <span className="text-white text-[9px] font-medium tracking-tight">
                  {item.title}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-[4px]">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M13 3l-2 3H3v15h18V3h-8zm6 16H5V8h14v11z"/></svg>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden relative">
                   <Image src="/images/logo.png" alt="user" fill className="object-cover" />
                </div>
                <span className="text-[#1A1A1A] text-[10px] font-semibold leading-none">{item.user}</span>
              </div>
              <div className="flex items-center gap-3 text-[#666666]">
                <div className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <span className="text-[9px] font-medium">{item.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span className="text-[9px] font-medium">{item.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GalleryGrid;