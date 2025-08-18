'use client';

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EnhancedButton } from "./EnhancedButton";

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface EnhancedNavigationProps {
  className?: string;
  logo?: {
    text: string;
    href: string;
  };
  items?: NavigationItem[];
  actions?: {
    signin?: {
      text: string;
      href: string;
    };
    cta?: {
      text: string;
      href: string;
    };
  };
  variant?: 'default' | 'glass' | 'minimal';
  children?: React.ReactNode;
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  className,
  logo = {
    text: "OptiLeads.ai",
    href: "/?landing=true"
  },
  items = [
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" }
  ],
  actions = {
    signin: {
      text: "Sign in",
      href: "/signin"
    },
    cta: {
      text: "Get Started",
      href: "/signin"
    }
  },
  variant = 'glass',
  children
}) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    default: "bg-gray-900/90 border-gray-800/50",
    glass: "backdrop-blur-md bg-white/5 border-white/10",
    minimal: "bg-transparent border-transparent"
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b transition-all duration-300",
      navVariants[variant],
      isScrolled && variant === 'glass' && "bg-white/10 shadow-lg shadow-black/10",
      isScrolled && variant === 'default' && "bg-gray-900/95 shadow-lg",
      className
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link 
              href={logo.href}
              className="text-2xl font-bold group transition-all duration-300 hover:scale-105"
              aria-label={`${logo.text} Home`}
            >
              <span className="text-white group-hover:text-blue-400 transition-colors duration-300">
                Opti
              </span>
              <span className="text-blue-400 group-hover:text-indigo-400 transition-colors duration-300">
                Leads
              </span>
              <span className="text-white/80 group-hover:text-white transition-colors duration-300">
                .
              </span>
              <span className="text-indigo-300 group-hover:text-purple-400 transition-colors duration-300">
                ai
              </span>
            </Link>
          </div>

          {/* Enhanced Navigation Items */}
          <nav className="hidden md:flex space-x-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-gray-300 hover:text-white transition-all duration-300 py-2 group",
                  item.active && "text-white"
                )}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-4">
            {actions.signin && (
              <Link
                href={actions.signin.href}
                className="text-gray-300 hover:text-white transition-colors duration-300 hidden sm:block"
              >
                {actions.signin.text}
              </Link>
            )}
            
            {actions.cta && (
              <EnhancedButton
                variant="default"
                size="sm"
                asChild
              >
                <Link href={actions.cta.href}>
                  {actions.cta.text}
                </Link>
              </EnhancedButton>
            )}

            {/* Additional children content */}
            {children}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-300 hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { EnhancedNavigation };