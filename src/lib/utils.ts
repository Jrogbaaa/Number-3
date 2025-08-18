import { clsx, type ClassValue } from "clsx"

// Simple utility to merge class names without external dependencies
function twMerge(classNames: string): string {
  if (!classNames) return '';
  
  // Split classes and remove duplicates while preserving order
  const classes = classNames.split(' ').filter(Boolean);
  const uniqueClasses = Array.from(new Set(classes));
  
  return uniqueClasses.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}