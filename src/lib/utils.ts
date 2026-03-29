import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  try {
    const date = parseISO(dateString);
    return format(date, "d MMMM yyyy", { locale: id });
  } catch (error) {
    if (error) {
      return dateString;
    }
    return dateString;
  }
}
