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
