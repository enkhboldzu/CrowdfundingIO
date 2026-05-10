import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fundingPercent(raised: number, goal: number): number {
  if (goal === 0) return 0;
  return (raised / goal) * 100;
}

export function daysLeftLabel(days: number): string {
  if (days <= 0) return "Дууссан";
  if (days === 1) return "1 өдөр үлдсэн";
  return `${days} өдөр үлдсэн`;
}
