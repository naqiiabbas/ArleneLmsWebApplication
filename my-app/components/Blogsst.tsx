"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import { ArrowLeft, ChevronDown, Clock3, Eye, Search } from "lucide-react";
import { listPublishedBlogPosts } from "@/lib/data/blog";
import type { UIBlogPost } from "@/lib/data/blog.types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const CATEGORIES = ["Mentorship", "Skills Development", "Career", "Technology", "Education"];

function AssetIcon({ src, className = "h-[18px] w-[18px]" }: { src: string; className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function renderContent(content: string) {
  if (content.includes("<")) {
    return (
      <div
        className="[&_a]:text-[#0078d4] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#ffa313] [&_blockquote]:pl-[14px] [&_blockquote]:italic [&_h1]:mb-[14px] [&_h1]:text-[30px] [&_h1]:font-semibold [&_h2]:mb-[12px] [&_h2]:text-[24px] [&_h2]:font-semibold [&_li]:ml-[22px] [&_ol]:list-decimal [&_pre]:rounded [&_pre]:bg-[#f1f1f1] [&_pre]:p-[12px] [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return content.split("\n").map((line, i) =>
    line.trim() ? <p key={i} className="mb-[14px]">{line}</p> : <div key={i} className="h-[14px]" />
  );
}

export default function BlogReaderSection() {
  const [posts, setPosts] = useState<UIBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selected, setSelected] = useState<UIBlogPost | null>(null);

  useEffect(() => {
    listPublishedBlogPosts()
      .then(setPosts)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <div className="mb-[26px] flex items-center gap-[12px]">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#ffa313] text-white">
          <AssetIcon src="/images/blog-pen-tool.svg" className="h-[24px] w-[24px]" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold leading-none text-[#111111]">Blog</h1>
          <p className="mt-[12px] text-[15px] font-normal leading-none text-[#666666]">
            Read the latest posts from your mentorship community
          </p>
        </div>
      </div>

      {notice && (
        <div className="mb-[16px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      {selected ? (
        <div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-[20px] flex h-[44px] items-center gap-[8px] rounded-[9px] border border-[#dddddd] bg-white px-[17px] text-[15px] font-normal text-[#666666] transition hover:bg-[#fafafa]"
          >
            <ArrowLeft size={18} strokeWidth={1.8} /> Back to Posts
          </button>
          <article className="overflow-hidden rounded-[12px] border border-[#dddddd] bg-white px-[24px] pb-[28px] pt-[24px]">
            {selected.image && <img src={selected.image} alt="" className="h-[320px] w-full rounded-[9px] object-cover" />}
            <h2 className="mt-[20px] text-[32px] font-normal leading-[1.15] text-[#111111]">{selected.title}</h2>
            <div className="mt-[16px] flex flex-wrap items-center gap-[14px] text-[14px] font-normal text-[#999999]">
              {selected.author && <span>By {selected.author}</span>}
              <span>&bull;</span>
              <span>{selected.date}</span>
              {selected.category && (
                <span className="ml-auto rounded-[7px] bg-[#e0f2fe] px-[10px] py-[5px] text-[12px] text-[#0078d4]">{selected.category}</span>
              )}
            </div>
            <div className="mt-[22px] text-[17px] font-normal leading-[1.6] text-[#111111]">
              {renderContent(selected.content || selected.excerpt)}
            </div>
            {selected.tags.length > 0 && (
              <div className="mt-[28px] flex flex-wrap gap-[8px]">
                {selected.tags.map((tag) => (
                  <span key={tag} className="rounded-[6px] bg-[#f1f1f1] px-[6px] py-[4px] text-[12px] font-normal leading-none text-[#666666]">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        </div>
      ) : (
        <div>
          <div className="mb-[24px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[24px]">
            <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[1fr_260px]">
              <div className="relative">
                <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#999999]" size={18} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[52px] w-full rounded-[9px] border border-[#dddddd] bg-white pl-[43px] pr-4 text-[15px] font-normal outline-none placeholder:text-[#999999]"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-[52px] w-full appearance-none rounded-[9px] border border-[#dddddd] bg-white px-[16px] pr-[40px] text-[14px] font-normal text-[#666666] outline-none"
                >
                  <option>All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-[16px]">
            {loading && (
              <div className="rounded-[12px] border border-dashed border-[#dddddd] bg-white py-16 text-center text-[15px] text-[#666666]">Loading posts…</div>
            )}
            {!loading && filteredPosts.length === 0 && (
              <div className="rounded-[12px] border border-dashed border-[#dddddd] bg-white py-16 text-center text-[15px] text-[#666666]">No posts found.</div>
            )}
            {filteredPosts.map((post) => (
              <article key={post.id} className="relative min-h-[160px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[25px] transition hover:shadow-sm">
                <div className="pr-[54px]">
                  <h2 className="text-[21px] font-normal leading-tight text-[#111111]">{post.title}</h2>
                  <div className="mt-[14px] flex flex-wrap items-center gap-[12px] text-[14px] font-normal leading-none text-[#999999]">
                    <span className="flex items-center gap-[4px]"><Clock3 size={15} strokeWidth={1.8} />{post.date}</span>
                    {post.author && <span>By {post.author}</span>}
                    {post.category && <span className="rounded-[7px] bg-[#e0f2fe] px-[8px] py-[5px] text-[12px] text-[#0078d4]">{post.category}</span>}
                  </div>
                  <p className="mt-[18px] line-clamp-2 text-[16px] font-normal leading-[1.45] text-[#666666]">{post.excerpt}</p>
                  <div className="mt-[16px] flex flex-wrap gap-[8px]">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-[6px] bg-[#f1f1f1] px-[6px] py-[4px] text-[12px] font-normal leading-none text-[#666666]">#{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(post)}
                  className="absolute right-[25px] top-[30px] text-[#0078d4] transition hover:scale-110"
                  aria-label={`Read ${post.title}`}
                >
                  <Eye size={20} strokeWidth={2.2} />
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
