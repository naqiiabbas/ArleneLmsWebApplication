import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { Mail, Phone, MapPin, User, ChevronDown, MessageSquare } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ContactSection = () => {
  return (
    <div className={`${poppins.variable} font-sans`}>
      {/* Hero Header Section */}
      <section className="relative h-[300px] w-full flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/faq.png" // Placeholder path as per design
            alt="Contact Background"
            fill
            className="object-cover brightness-[1]"
            priority
          />
        </div>
        <div className="relative z-10 text-center">
          <nav className="text-[14px] mb-2 flex justify-center items-center gap-1 opacity-90">
            <span>Home</span>
            <span>/</span>
            <span>FAQs</span>
          </nav>
          <h1 className="text-[42px] font-bold tracking-tight">Contact Us</h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-white py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* Contact Form Card */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.08)] border border-gray-50">
              <div className="text-center mb-10">
                <h2 className="text-[24px] font-bold text-[#1A1A1A]">Get In Touch</h2>
                <p className="text-[#717171] text-[14px] mt-1">Start your journey with a greater success</p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">What are you interested in?</label>
                  <div className="relative">
                    <select className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 text-[14px] text-[#717171] appearance-none focus:ring-1 focus:ring-[#FFB800] outline-none">
                      <option>Select anyone of them</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">Full name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Name and surname" 
                      className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 text-[14px] focus:ring-1 focus:ring-[#FFB800] outline-none"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Ex: jonathanland@company.io" 
                      className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 text-[14px] focus:ring-1 focus:ring-[#FFB800] outline-none"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">Phone number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 text-[14px] focus:ring-1 focus:ring-[#FFB800] outline-none"
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">Description</label>
                  <textarea 
                    placeholder="Enter your description" 
                    rows={4}
                    className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 text-[14px] focus:ring-1 focus:ring-[#FFB800] outline-none resize-none"
                  ></textarea>
                </div>

                <button className="w-full bg-white border-2 border-[#FFB800] text-[#1A1A1A] font-bold py-3 rounded-lg hover:bg-[#FFB800] transition-all duration-300">
                  Submit
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-[#FAF8F4] rounded-2xl p-10 md:p-12 h-full">
              <h2 className="text-[28px] font-bold text-[#1A1A1A] leading-tight mb-6">
                Start Your Journey To A Greater Success!
              </h2>
              <p className="text-[#4A4A4A] text-[15px] leading-relaxed mb-10">
                Great partnerships are the best way to create a breakthrough that defines business success. Let us help you to have the best business benefits.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-4">Our Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-lg">
                        <MapPin className="w-5 h-5 text-[#1A1A1A]" />
                      </div>
                      <span className="text-[15px] text-[#4A4A4A]">467 Stutler Lane, Altoona, PA 16602</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-lg">
                        <Mail className="w-5 h-5 text-[#1A1A1A]" />
                      </div>
                      <span className="text-[15px] text-[#4A4A4A]">info@example.com</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-4">Our Office Hours</h3>
                  <p className="text-[#4A4A4A] text-[15px] mb-2">Our team is available to assist you during the following hours:</p>
                  <div className="space-y-1 text-[15px] text-[#4A4A4A]">
                    <p>Monday to Friday 8:00am - 5:00pm [GMT +5]</p>
                    <p>Saturday & Sunday Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 grayscale opacity-80">
             <Image src="/images/faqimg1.png" alt="CalPrivate Bank" width={180} height={40} className="h-10 w-auto object-contain" />
             <Image src="/images/faqimg2.png" alt="African American Alliance Fund" width={200} height={40} className="h-10 w-auto object-contain" />
             <Image src="/images/faqimg3.png" alt="Southern California Edison" width={180} height={40} className="h-10 w-auto object-contain" />
             <Image src="/images/faqimg4.png" alt="Horizon Veterinary Specialists" width={180} height={40} className="h-10 w-auto object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;