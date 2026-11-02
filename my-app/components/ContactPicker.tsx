"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { listContacts } from "@/lib/data/messaging";
import type { UIContact } from "@/lib/data/messaging.types";

/**
 * "Contact Name" field for starting a chat: focusing it lists every contact and
 * typing narrows the list. The parent only gets a contact picked from the list,
 * so a chat can't start from a misspelled name or with the wrong person of the
 * same name.
 */
export default function ContactPicker({
  value,
  onChange,
  placeholder = "Type a name to search contacts",
  inputClassName,
  optionClassName = "text-[#111111]",
}: {
  value: UIContact | null;
  onChange: (contact: UIContact | null) => void;
  placeholder?: string;
  inputClassName: string;
  optionClassName?: string;
}) {
  const [contacts, setContacts] = useState<UIContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listContacts()
      .then(setContacts)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const matches = useMemo(() => {
    // Once someone is picked, reopening shows everybody rather than only them.
    const q = value ? "" : query.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.role, c.email ?? ""].some((field) => field.toLowerCase().includes(q))
    );
  }, [contacts, query, value]);

  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = (contact: UIContact) => {
    onChange(contact);
    setQuery(contact.name);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) event.stopPropagation();
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (matches.length) setActiveIndex((i) => (i + step + matches.length) % matches.length);
    } else if (event.key === "Enter" && open && matches[activeIndex]) {
      event.preventDefault();
      select(matches[activeIndex]);
    }
  };

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        className={inputClassName}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
          if (value) onChange(null); // edited the name: no longer that contact
        }}
      />
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-[220px] overflow-y-auto rounded-[8px] border border-[#d6d6d6] bg-white py-[4px] shadow-lg"
        >
          {matches.map((contact, index) => (
            <li
              key={contact.id}
              role="option"
              aria-selected={value?.id === contact.id}
              // Keep focus in the input so its blur doesn't close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(contact)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-[14px] py-[9px] ${index === activeIndex ? "bg-[#fff7e8]" : "bg-white"}`}
            >
              <p className={`truncate text-[15px] font-normal leading-[1.3] ${optionClassName}`}>{contact.name}</p>
              <p className="truncate text-[13px] font-normal leading-[1.3] text-[#666666]">
                {contact.email ? `${contact.role} · ${contact.email}` : contact.role}
              </p>
            </li>
          ))}
          {!matches.length && (
            <li className="px-[14px] py-[9px] text-[14px] font-normal text-[#666666]">
              {loading ? "Loading contacts..." : loadError ? "Couldn't load contacts. Please try again." : "No contacts found."}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
