import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | number | Date | null | undefined) {
  if (!dateInput) return "";
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : new Date(dateInput);
    return format(date, "d MMMM yyyy", { locale: id });
  } catch (error) {
    return String(dateInput);
  }
}

export function slugifyText(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getMemorySlug(memory: {
  id: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
}): string {
  const baseText =
    memory.title?.trim() ||
    memory.location?.trim() ||
    memory.description?.trim() ||
    "memori";
  const slug = slugifyText(baseText);
  return slug || memory.id;
}

export function getMemoryUrl(memory: {
  id: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
}): string {
  return `/memories/${encodeURIComponent(getMemorySlug(memory))}`;
}
