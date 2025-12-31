/**
 * Utility function for conditional class names
 * A lightweight alternative to clsx for combining Tailwind CSS classes
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind CSS merge functionality
 * 
 * @param inputs - Class names to combine
 * @returns Merged class string
 * 
 * @example
 * cn('px-2 py-1', 'bg-red-500', 'px-4') // 'py-1 bg-red-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}