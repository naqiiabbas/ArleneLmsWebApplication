"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  GraduationCap,
  Heart,
  Cpu,
  Briefcase,
  UserCircle,
  BookOpen,
  Star,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { getStudentResources } from "@/lib/data/student";
import type { StudentResource } from "@/lib/data/student.types";

// Icon per known category label (falls back to BookOpen for anything else).
const CATEGORY_ICON: Record<string, typeof GraduationCap> = {
  "College Preparation": GraduationCap,
  "Health & Wellness": Heart,
  "AI & STEM": Cpu,
  "Career Development": Briefcase,
  "Life Skills": UserCircle,
};
const iconForCategory = (label: string) => (label === "All" ? BookOpen : CATEGORY_ICON[label] ?? BookOpen);

/**
 * SUB-COMPONENTS
 */
const ResourceBookmarkIcon = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`inline-block bg-current ${className}`}
    style={{
      WebkitMaskImage: "url('/images/resource-bookmark-icon.svg')",
      maskImage: "url('/images/resource-bookmark-icon.svg')",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const CategoryButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex h-[50px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[9px] border px-[25px] text-[16px] font-normal transition-all duration-200 ${
      active
        ? "border-[#ffa313] bg-[#ffa313] text-white"
        : "border-[#dddddd] bg-white text-[#666666] hover:border-[#ffa313] hover:text-[#ffa313]"
    }`}
  >
    <Icon className="h-[20px] w-[20px] shrink-0" strokeWidth={1.8} />
    {label}
  </button>
);

const FeaturedCard = ({ resource }: any) => (
  <div className="flex min-h-[194px] flex-col rounded-[12px] border border-[#ffa313] bg-white px-[23px] py-[23px] transition-shadow hover:shadow-md">
    <div className="mb-[13px] flex items-start justify-between">
      <div className="flex gap-2">
        <span className="rounded-[5px] bg-[#fff0cf] px-[9px] py-[5px] text-[12px] font-normal leading-none text-[#ffa313]">
          {resource.type}
        </span>
        <span className="rounded-[5px] bg-[#f4f4f4] px-[9px] py-[5px] text-[12px] font-normal leading-none text-[#666666]">
          {resource.tag}
        </span>
      </div>
      <ResourceBookmarkIcon className="h-[20px] w-[20px] text-[#666666]" />
    </div>
    <h3 className="mb-[10px] line-clamp-1 text-[16px] font-normal leading-none text-[#111111]">{resource.title}</h3>
    <p className="line-clamp-2 text-[15px] font-normal leading-[1.35] text-[#666666]">{resource.description}</p>
    <div className="mt-auto flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Star size={15} className="fill-[#ffa313] text-[#ffa313]" />
        <span className="text-[13px] font-normal text-[#666666]">{resource.rating}</span>
      </div>
      <button
        onClick={() => resource.link && window.open(resource.link, "_blank", "noopener,noreferrer")}
        disabled={!resource.link}
        className="flex items-center gap-[3px] text-[13px] font-normal text-[#ffa313] hover:underline disabled:text-[#c9c9c9] disabled:no-underline"
      >
        Open Resource <ExternalLink size={14} strokeWidth={1.8} />
      </button>
    </div>
  </div>
);

const ResourceListItem = ({ resource }: any) => (
  <div className="flex min-h-[124px] items-center justify-between rounded-[12px] border border-[#dddddd] bg-white px-[20px] py-[18px] transition-colors hover:bg-[#fafafa]">
    <div className="min-w-0">
      <div className="mb-[13px] flex flex-wrap items-center gap-[7px]">
        <span className="rounded-[5px] bg-[#f4f4f4] px-[9px] py-[5px] text-[12px] font-normal leading-none text-[#666666]">
          {resource.type}
        </span>
        <span className="rounded-[5px] bg-[#fff8ef] px-[9px] py-[5px] text-[12px] font-normal leading-none text-[#ffa313]">
          {resource.tag}
        </span>
        <div className="flex items-center gap-[3px]">
          <Star size={13} className="fill-[#ffa313] text-[#ffa313]" />
          <span className="text-[12px] font-normal text-[#666666]">{resource.rating}</span>
        </div>
      </div>
      <h4 className="truncate text-[16px] font-normal leading-none text-[#111111]">{resource.title}</h4>
      <p className="mt-[14px] line-clamp-1 text-[15px] font-normal leading-none text-[#666666]">{resource.description}</p>
    </div>
    <div className="ml-4 flex shrink-0 items-center gap-[24px]">
       <ResourceBookmarkIcon className="h-[20px] w-[20px] text-[#666666]" />
       <button
         onClick={() => resource.link && window.open(resource.link, "_blank", "noopener,noreferrer")}
         disabled={!resource.link}
         className="flex h-[41px] items-center gap-[9px] rounded-[9px] bg-[#ffa313] px-[18px] text-[16px] font-normal text-white transition-colors hover:bg-[#f59a0d] disabled:bg-[#dddddd]"
       >
         Open <ChevronRight size={17} strokeWidth={2} />
       </button>
    </div>
  </div>
);

/**
 * MAIN COMPONENT
 */
export default function LearningResources() {
  const [resources, setResources] = useState<StudentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    getStudentResources()
      .then(setResources)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(resources.map((r) => r.category).filter(Boolean)))],
    [resources]
  );
  const types = useMemo(
    () => ["All", ...Array.from(new Set(resources.map((r) => r.type).filter(Boolean)))],
    [resources]
  );

  // Filter Logic
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "All" || item.type === filterType;

      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [resources, activeCategory, searchQuery, filterType]);

  const featured = filteredResources.filter(r => r.isFeatured);
  const others = filteredResources.filter(r => !r.isFeatured);

  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#f5f5f5] px-4 pb-6 pt-6 font-['Poppins',_sans-serif] md:px-6 md:pt-7">
      {/* Header */}
      <div className="mb-[26px]">
        <h1 className="text-[22px] font-semibold leading-none text-[#111111]">Learning Resources</h1>
        <p className="mt-[14px] text-[16px] font-normal leading-none text-[#666666]">Explore curated resources to support your academic and personal growth</p>
      </div>

      {notice && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      {/* Tabs / Categories */}
      <div className="mb-[25px] flex items-center gap-[10px] overflow-x-auto pb-1">
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            active={activeCategory === cat}
            label={cat}
            icon={iconForCategory(cat)}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-[25px] flex flex-col gap-[16px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[22px] md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={20} strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[48px] w-full rounded-[9px] bg-[#f1f1f1] pl-[46px] pr-4 text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#8a8a8a]"
          />
        </div>
        <div className="flex h-[44px] min-w-[151px] items-center gap-[14px] rounded-[9px] bg-[#f1f1f1] px-[14px]">
          <Filter size={20} className="text-[#666666]" strokeWidth={1.8} />
          <select
            className="w-full cursor-pointer bg-transparent text-[16px] font-normal text-[#666666] outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Resources Grid */}
      {featured.length > 0 && (
        <div className="mb-[27px]">
          <div className="mb-[14px] flex items-center gap-[8px]">
            <Star size={20} className="text-[#ffa313]" strokeWidth={1.8} />
            <h2 className="text-[22px] font-semibold leading-none text-[#111111]">Featured Resources</h2>
          </div>
          <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
            {featured.map((item) => (
              <FeaturedCard key={item.id} resource={item} />
            ))}
          </div>
        </div>
      )}

      {/* All Resources List */}
      <div>
        <h2 className="mb-[14px] text-[22px] font-semibold leading-none text-[#111111]">All Resources</h2>
        <div className="flex flex-col gap-[12px]">
          {loading ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 py-20 text-center text-gray-400">Loading resources…</div>
          ) : others.length > 0 ? (
            others.map((item) => (
              <ResourceListItem key={item.id} resource={item} />
            ))
          ) : featured.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400">No resources found matching your criteria.</p>
            </div>
          ) : (
             <p className="text-gray-400 text-sm italic">Additional specialized resources will appear here.</p>
          )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-300">
        <p>© 2025 Mentorship Platform • Version 1.0.0</p>
      </div>
    </section>
  );
}
