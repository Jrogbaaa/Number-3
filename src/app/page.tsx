'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Zap, Target, TrendingUp, Users, BarChart3, CheckCircle, Star } from 'lucide-react';

// Animated Background Components
const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate deterministic positions for particles - much more subtle
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i * 17 + 23) % 100,
    y: (i * 31 + 47) % 100,
    delay: (i * 2) % 20,
    duration: 25 + (i % 15),
    size: 1 + (i % 2) * 0.5
  }));

  // Generate deterministic positions for orbs - smaller and more transparent
  const orbs = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: (i * 23 + 31) % 90 + 5,
    y: (i * 37 + 19) % 90 + 5,
    delay: (i * 3) % 15,
    duration: 35 + (i % 10),
    size: 60 + (i % 30)
  }));

  // Generate deterministic positions for neural network lines - fewer and more subtle
  const neuralLines = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x1: (i * 19 + 13) % 100,
    y1: (i * 29 + 41) % 100,
    x2: (i * 43 + 7) % 100,
    y2: (i * 53 + 17) % 100,
    delay: (i * 2) % 12,
    duration: 20 + (i % 10)
  }));

  // Generate deterministic positions for data points - fewer and slower
  const dataPoints = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (i * 21 + 11) % 100,
    y: (i * 33 + 27) % 100,
    delay: (i * 1.5) % 8,
    duration: 15 + (i % 8)
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Particles - Very subtle and slow */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-blue-400/8 rounded-full animate-drift"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration + 20}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
        />
      ))}

      {/* Floating Orbs - Very gentle and transparent */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full bg-gradient-to-r from-blue-500/4 to-indigo-500/4 animate-float"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration + 25}s`
          }}
        />
      ))}

      {/* Neural Network Lines - Very subtle */}
      <svg className="absolute inset-0 w-full h-full">
        {neuralLines.map((line) => (
          <line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="rgba(59, 130, 246, 0.04)"
            strokeWidth="0.5"
            className="animate-neural-pulse"
            style={{
              animationDelay: `${line.delay}s`,
              animationDuration: `${line.duration + 15}s`
            }}
          />
        ))}
      </svg>

      {/* Data Processing Points - Very subtle flow */}
      {dataPoints.map((point) => (
        <div
          key={point.id}
          className="absolute w-0.5 h-0.5 bg-indigo-400/20 rounded-full animate-data-flow"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            animationDelay: `${point.delay}s`,
            animationDuration: `${point.duration + 10}s`
          }}
        />
      ))}

      {/* Additional Geometric Elements - Very subtle */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 border border-blue-400/5 rotate-45 animate-drift" style={{ animationDuration: '45s' }} />
      <div className="absolute top-3/4 right-1/4 w-6 h-6 border border-indigo-400/5 rotate-12 animate-float" style={{ animationDuration: '50s' }} />
      <div className="absolute top-1/2 left-3/4 w-4 h-4 border border-blue-300/5 -rotate-12 animate-drift" style={{ animationDuration: '55s' }} />
      
      {/* Very subtle scanning lines */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/8 to-transparent animate-drift" style={{ animationDuration: '60s' }} />
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/6 to-transparent animate-drift" style={{ animationDuration: '65s', animationDelay: '20s' }} />
      
      {/* Subtle circular elements */}
      <div className="absolute top-1/5 right-1/5 w-20 h-20 border border-blue-400/4 rounded-full animate-pulse-glow" style={{ animationDuration: '15s' }} />
      <div className="absolute bottom-1/4 left-1/6 w-16 h-16 border border-indigo-400/4 rounded-full animate-pulse-glow" style={{ animationDuration: '18s', animationDelay: '8s' }} />

      {/* Very subtle gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/8 via-transparent to-indigo-900/8" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/4 to-transparent" />
    </div>
  );
};

// Mock testimonials data
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechNova',
    quote: 'OptiLeads.ai helped us find hundreds of quality leads that converted at 3x our previous rate.',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Growth Lead',
    company: 'Sequoia Startups',
    quote: 'We increased our qualified leads by 240% in just 2 months with OptiLeads.ai.',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Sales Operations',
    company: 'EnterpriseCloud',
    quote: 'The AI-powered lead scoring saved our team countless hours and improved conversion by 45%.',
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
  },
];

// Mock stats data
const stats = [
  { value: '250%', label: 'Average increase in qualified leads' },
  { value: '45%', label: 'Reduction in lead qualification time' },
  { value: '3.2x', label: 'Higher conversion rate' },
  { value: '78%', label: 'of users see results in first month' },
];

// Companies using the platform
const companies = [
  'Adobe', 'Shopify', 'Stripe', 'Dropbox', 'Slack', 'Atlassian'
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isLandingPage = searchParams.get('landing') === 'true';

  // Check authentication status on page load
  useEffect(() => {
    if (status === 'authenticated' && session && !isLandingPage) {
      console.log('[Home] User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, isLandingPage, router]);

  const handleGetStarted = () => {
    try {
      setIsLoading(true);
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.log('[Home] Error navigating:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Header/Navigation */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/?landing=true"
                className="text-2xl font-bold"
                aria-label="OptiLeads.ai Home"
              >
                <span className="text-white">Opti<span className="text-blue-400">Leads</span><span className="text-white opacity-80">.</span><span className="text-indigo-300">ai</span></span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              {status === 'authenticated' ? (
                <Link 
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/signin"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signin"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8">
        {/* Glow effect behind hero content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: '6s' }}></div>
        </div>
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-tight">
            <span className="drop-shadow-2xl">Find Your Best Leads</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
              with AI Precision
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            OptiLeads.ai uses advanced AI to identify, score, and engage high-quality leads that are most likely to convert, saving you time and maximizing your ROI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-70 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <>
                  Get Started for Free
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            
            <a 
              href="#features" 
              className="text-lg font-semibold text-white hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              Learn more 
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-40 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-semibold mb-12 text-gray-300">
            Trusted by innovative companies worldwide
          </h2>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {companies.map((company) => (
              <div 
                key={company} 
                className="text-gray-400 text-2xl font-bold hover:text-white transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              Powerful Features for Lead Generation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to find, score, and convert high-quality leads with AI precision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-indigo-600/20 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold">AI Lead Scoring</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Advanced machine learning algorithms analyze multiple data points to score leads based on conversion probability.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600/20 p-3 rounded-xl">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Smart Automation</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Automate your outreach with intelligent sequencing, personalized messaging, and optimal timing.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-600/20 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">Analytics & Insights</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Get detailed analytics on lead performance, conversion rates, and campaign effectiveness.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-600/20 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Lead Enrichment</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Automatically enrich lead profiles with comprehensive data including company information and contact details.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-600/20 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold">Predictive Analytics</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Leverage predictive models to identify trends, forecast lead quality, and optimize your sales pipeline.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-cyan-600/20 p-3 rounded-xl">
                  <Star className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Updates</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Stay informed with real-time notifications about lead activities and new opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8 bg-white/5" id="testimonials">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Real Results from Real Customers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-40 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">
              Proven Performance
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="p-6">
                <p className="text-5xl font-bold text-indigo-400 mb-2">{stat.value}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8 bg-white/5" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that fits your business needs. Start free and scale as you grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <p className="text-gray-300 mb-6">Perfect for small teams getting started</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-gray-300">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Up to 100 leads per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Basic AI lead scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Basic analytics</span>
                </li>
              </ul>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors border border-white/20">
                Get Started Free
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-b from-indigo-600 to-blue-600 p-8 rounded-2xl relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <p className="text-indigo-100 mb-6">For growing businesses and teams</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-indigo-100">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Up to 1,000 leads per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Advanced AI lead scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Smart automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span className="text-indigo-100">Lead enrichment</span>
                </li>
              </ul>
              <button className="w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <p className="text-gray-300 mb-6">For large organizations with custom needs</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Unlimited leads</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Custom AI models</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">White-label options</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Dedicated support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">SLA guarantees</span>
                </li>
              </ul>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-colors border border-white/20">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your lead generation?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Get started today and see the difference AI-powered lead management can make for your business.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-all duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              'Start Your Free Trial'
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.064-.926-2.064-2.064 0-1.138.92-2.063 2.064-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.064-2.064 2.064zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                &copy; 2023 OptiLeads.ai. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 p-2 bg-gray-800/90 rounded-md text-xs text-gray-300 max-w-48 z-50">
          <h3 className="font-medium text-amber-400 mb-1 text-xs">Debug</h3>
          <p className="text-xs">Auth: {status}</p>
          <p className="text-xs">Session: {session ? 'Yes' : 'No'}</p>
          <p className="text-xs">Landing: {isLandingPage ? 'Yes' : 'No'}</p>
          
          <div className="mt-1 pt-1 border-t border-gray-700/50">
            <div className="space-y-1">
              <a 
                href="/signin" 
                className="block text-xs text-blue-300 hover:underline"
              >
                Sign In
              </a>
              <a 
                href="/dashboard" 
                className="block text-xs text-blue-300 hover:underline"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 