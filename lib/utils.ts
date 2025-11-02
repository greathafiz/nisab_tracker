import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const TROY_OUNCE_TO_GRAMS = 31.1035;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
