import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInYears, differenceInMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const calculateCompanyExperience = (joiningDate: string) => {
  const join = new Date(joiningDate);
  const now = new Date();
  const years = differenceInYears(now, join);
  const months = differenceInMonths(now, join) % 12;
  return `${years} Years ${months} Months`;
};
