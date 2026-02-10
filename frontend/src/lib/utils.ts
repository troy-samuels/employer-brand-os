/**
 * @module lib/utils
 * Module implementation for utils.ts.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Executes cn.
 * @param inputs - inputs input.
 * @returns The resulting value.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
