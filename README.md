# OptiLeads.ai - AI-Powered Lead Management Platform

OptiLeads.ai is a comprehensive B2B lead management and AI scoring platform built with Next.js 15, featuring modern UI components, advanced lead scoring algorithms, and intelligent outreach capabilities.

## ✨ Features

### 🎯 **Core Functionality**
- **AI Lead Scoring**: Advanced algorithms analyze and score leads based on conversion potential
- **Smart Contact Management**: Email and LinkedIn profile integration with intelligent contact display
- **Automated Outreach**: AI-generated personalized messages and follow-up sequences
- **CSV Import/Export**: Seamless data import with intelligent field mapping
- **Real-time Analytics**: Dashboard with lead metrics, trends, and performance insights

### 🎨 **Enhanced UI Components (NEW)**
- **Modern Design System**: Beautiful glassmorphism cards and gradient buttons
- **Animated Components**: Smooth transitions and micro-interactions
- **Responsive Layout**: Mobile-first design with advanced responsive features
- **Dark Theme**: Modern dark theme with HSL color variables
- **Component Library**: 8+ enhanced components ready for integration

### 🔐 **Authentication & Security**
- **Google OAuth**: Secure authentication via Google accounts
- **Session Management**: NextAuth.js for robust session handling
- **Error Tracking**: Sentry integration for production monitoring
- **Middleware Protection**: Route-level authentication and authorization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node.js 23.7.0)
- npm or yarn package manager
- Supabase account for database
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Number\ 3
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy `.env.sample` to `.env.local` and configure:
```bash
cp env.sample .env.local
```

Required environment variables:
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for AI features

4. **Database Setup**
Run the database setup script:
```bash
npm run setup-db
```

5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Enhanced UI Components

### Component Preview
Visit [http://localhost:3000/page.uienhancement](http://localhost:3000/page.uienhancement) to see all enhanced components in action.

### Available Components
- `EnhancedButton` - Modern gradient buttons with animations
- `GlassCard` - Glassmorphism cards with backdrop blur
- `ScoreDisplay` - Animated score visualization
- `EnhancedHero` - Stunning hero sections
- `EnhancedDashboard` - Advanced dashboard layouts
- `EnhancedLeadsTable` - Beautiful data tables
- `AnimatedBackground` - Dynamic background effects
- `EnhancedNavigation` - Modern navigation components

### Using Enhanced Components
```tsx
import { EnhancedButton } from '@/components/enhanced/EnhancedButton';
import { GlassCard } from '@/components/enhanced/GlassCard';

// Use in your components
<EnhancedButton variant="default" size="lg">
  Get Started
</EnhancedButton>

<GlassCard className="p-6">
  <h3>Beautiful Glass Card</h3>
</GlassCard>
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── enhanced/          # Enhanced UI components (NEW)
│   ├── ui/                # Base UI components
│   ├── shared/            # Shared components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
├── providers/             # React context providers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI + Enhanced component library
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth
- **AI/ML**: OpenAI GPT for lead scoring and message generation
- **Monitoring**: Sentry for error tracking
- **Testing**: Jest + Playwright for E2E testing

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📝 Documentation

- [Changelog](./CHANGELOG.md) - Detailed release notes
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Features Overview](./FEATURES.md) - Complete feature documentation
- [Scoring System](./docs/SCORING_SYSTEM.md) - Lead scoring algorithm details

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
See [DEPLOYMENT.md](./DEPLOYMENT.md) for other deployment options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
