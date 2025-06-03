# PROPS - Lead Management Platform

AI-powered insights and outreach automation for lead management with website intelligence and scalable Cloud Run deployment.

<!-- Deployment trigger: 2024-12-07 Force rebuild -->

## Features

- **🌐 Website & LinkedIn Scraping**: Extract company context and insights during onboarding using Firecrawl API
- **☁️ Cloud Run Deployment**: Production-ready Google Cloud deployment with automatic scaling
- **🔐 Google Authentication** with NextAuth.js
- **📊 Lead management and scoring** with AI-powered insights
- **🔄 Supabase database integration** with robust connectivity
- **⚡ NextJS 15 with App Router** for optimal performance
- **🎓 Interactive Scoring Tutorial**: Comprehensive onboarding tutorial that explains AI-powered lead scoring with company-specific personalization
- **📋 Customizable table columns** that adapt to business needs
- **🏆 "Best Overall" score** that weights factors according to user priorities
- **🌟 Subtle Animated Background**: Sophisticated animated elements with particles, neural networks, and geometric shapes that create a premium tech aesthetic
- **✨ Modern UI/UX**: Clean, floating text design with gradient accents and subtle motion graphics for enhanced visual appeal

## Key Features

### 🌐 **Website Intelligence & Context Extraction**
- **Smart Website Scraping**: Extract company information and context from websites during onboarding
- **LinkedIn Business Profile Analysis**: Analyze LinkedIn company pages for enhanced lead context
- **Content Processing**: Intelligent content extraction focusing on main business information
- **Onboarding Integration**: Optional website context step in user setup flow

### 🎯 **AI-Powered Lead Analysis**
- **📊 Multi-dimensional Contact Scoring** (Marketing Activity, Budget Potential, B2B/C2C Classification)
- **⏱️ Optimal Outreach Time Enrichment**: Automatically determines the best time to contact leads
- **🤖 Heygen AI Video Integration**: Generate AI-powered podcast scripts and access Heygen tools directly
- **✨ AI Message Customization**: Personalize outreach messages with AI-powered prompts
- **📧 Follow-up Email System**: Comprehensive follow-up email generator with 5 strategic approaches

### 🎤 **Communication Tools**
- **Audio Message Recording**: Record, play, and download personalized audio messages
- **Message Transformation**: Apply different tones (conversational, professional, funny)
- **Follow-up Strategies**: 5 distinct follow-up approaches with timing guidance
- **Contextual Personalization**: AI-powered content based on lead and business information

### 🔮 **User Experience**
- **Welcome Onboarding Modal**: First-time visitors receive guidance to the upload page
- **Personalized Onboarding**: Interactive setup to customize lead scoring based on company profile and target audience
- **Website Context Collection**: Optional step to gather company information for better personalization
- **Modern Dark UI**: Enhanced visual consistency, clarity, and professionalism across components

### ☁️ **Enterprise Deployment**
- **Google Cloud Run**: Production-ready deployment with automatic scaling
- **Environment Management**: Secure secret management with Google Secret Manager
- **Multi-project Support**: Isolated deployments across different Google Cloud projects
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google OAuth credentials
- Supabase project

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Jrogbaaa/Number-3.git
   cd Number-3
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://kodddurybogqynkswrzp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI APIs
   REPLICATE_API_KEY=your_replicate_api_key
   HEYGEN_API_KEY=your_heygen_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key

   # Google OAuth credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # NextAuth configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Cloud Run Integration (for production)
   NEXT_PUBLIC_CLOUD_RUN_URL=https://your-cloud-run-service-url.run.app
   CLOUD_RUN_API_URL=https://your-cloud-run-service-url.run.app
   ```

   **Note:** Ensure the Supabase URL is exactly as shown above. The URL contains "bog" not "boq".

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Connectivity

The application implements robust database connectivity with the following features:

- **Retry Logic:** Automatic retries for failed database operations with exponential backoff
- **Fallback Data:** Returns mock data when the database is unreachable to prevent UI failures
- **Error Tracking:** Comprehensive error logging for database connection issues

## Authentication Setup

For detailed authentication setup instructions, see [AUTHENTICATION.md](./docs/AUTHENTICATION.md).

## Deployment

### Option 1: Vercel Deployment (Frontend)
This project is configured for deployment on Vercel. See [Vercel deployment instructions](https://nextjs.org/docs/deployment) for details.

### Option 2: Google Cloud Run (Full-Stack)
For production deployment with backend capabilities:

1. **Prerequisites:**
   - Google Cloud account and project
   - Docker installed
   - gcloud CLI configured

2. **Deploy to Cloud Run:**
   ```bash
   # Make deployment script executable
   chmod +x scripts/deploy-cloudrun.sh
   
   # Deploy to your Google Cloud project
   ./scripts/deploy-cloudrun.sh
   ```

3. **Environment Configuration:**
   The deployment script automatically:
   - Creates Google Secret Manager secrets for sensitive data
   - Configures environment variables for Cloud Run
   - Sets up proper IAM permissions
   - Deploys with auto-scaling configuration

4. **Update OAuth Settings:**
   After deployment, update your OAuth providers:
   - **Google OAuth:** Add `https://your-service-url.run.app/api/auth/callback/google`
   - **Supabase Auth:** Add `https://your-service-url.run.app/api/auth/callback`

**Cloud Run Features:**
- Automatic scaling (0-10 instances)
- 2GB memory, 2 CPU allocation
- 300-second timeout for long-running operations
- Health monitoring and error tracking
- Secure secret management

## Architecture

### Development Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Replicate API, Heygen API
- **Web Scraping**: Firecrawl API
- **Deployment**: Vercel (frontend) or Google Cloud Run (full-stack)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

# Contact Scoring Platform

A modern contact analysis and scoring platform built with Next.js 15, React, TypeScript, and Supabase.

## Features

- 📊 Contact Scoring Dashboard
- 📈 Multi-dimensional Contact Scoring (Marketing Activity, Budget Potential, B2B/C2C Classification)
- **⏱️ Optimal Outreach Time Enrichment**: Automatically determines the best time to contact leads.
- **🎤 Audio Message Recording**: Record, play, and download personalized audio messages.
- **🤖 Heygen AI Video Integration**: Generate AI-powered podcast scripts and access Heygen tools directly.
- **✨ AI Message Customization**: Personalize outreach messages with AI-powered prompts.
- **📧 Follow-up Email System**: Comprehensive follow-up email generator with 5 strategic approaches.
- **🔮 Welcome Onboarding Modal**: First-time visitors receive guidance to the upload page.
- **🔐 Google Authentication**: Secure user authentication with Google OAuth.
- 📥 Flexible CSV Data Import & Processing
- 🔄 Real-time Updates
- 🎨 Modern Dark UI (Refined)
- 📊 Intuitive Data Table Interface with Sorting & Searching
- 📤 CSV Export of Scored Contacts
- 📱 Responsive Design
- 📋 Clean Data Presentation
- ♻️ Data Management Tools

## Key Features

- 📊 Contact Scoring Dashboard
- 📈 Multi-dimensional Contact Scoring
- **⏱️ Optimal Outreach Time Enrichment**
- **🎤 Audio Message Recording**
- **🤖 Heygen AI Video Integration**:
    - Direct links to Heygen AI Podcast Creation and Studio tools.
    - Podcast Script Generator: Select format, number of hosts, duration, voice style, and focus area (e.g., marketing/finance) to generate tailored podcast scripts.
- **✨ AI Message Customization**:
    - Craft personalized outreach messages with AI assistance
    - Apply pre-defined or custom prompts to transform messages
    - Support for different tones (conversational, professional, funny)
    - One-click message enhancement with intelligent transformations
- **📧 Follow-up Email System**:
    - 5 distinct follow-up strategies with timing guidance
    - AI-powered message customization for follow-ups
    - Personalized content based on lead and business information
    - Easy access from dashboard and individual lead pages
    - Professional, contextually appropriate follow-up templates
- **🔮 Welcome Modal**: Guides new users to start by uploading leads for analysis.
- **🧩 Personalized Onboarding**: Interactive setup to customize lead scoring based on company profile and target audience.
- **🔐 Authentication**: Secure Google OAuth integration for user management
- 📥 Flexible CSV Data Import & Processing
- 🔄 Real-time Updates
- 🎨 Modern Dark UI (Refined): Enhanced visual consistency, clarity, and professionalism across components (Sidebar, Cards, Forms).
- 📊 Intuitive Data Table Interface
- 📤 CSV Export of Scored Contacts
- 📱 Responsive Design
- 📋 Clean Data Presentation
- ♻️ Data Management Tools

## Overview

This platform provides tools to upload, analyze, and score contact data from CSV files. It focuses on providing insights into:

- **Marketing Focus**: Identifying contacts primarily involved in marketing activities.
- **Budget Potential**: Estimating the potential budget or spending capability associated with a contact.
- **Business Orientation**: Classifying contacts as primarily B2B, B2C, or Mixed.

The platform now automatically enriches lead data with optimal outreach times and allows for personalized audio message recording.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jrogbaaa/Number-3.git 
cd Number-3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REPLICATE_API_KEY=your_replicate_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Set up authentication:
   - Run the SQL script in `scripts/setup-nextauth-schema.sql` in your Supabase SQL Editor
   - Expose the `next_auth` schema in your Supabase Project Settings → API → API Settings
   - See `scripts/README.md` for detailed instructions

5. Run the development server:
```bash
npm run dev
```

## Testing and Development

The project includes comprehensive testing infrastructure:

### Pre-push Validation
Run the validation script before pushing code:
```bash
node scripts/pre-push-check.js
```

This script performs:
- ESLint checks
- TypeScript compilation validation
- Jest unit tests
- Playwright E2E tests (if configured)
- Next.js build verification
- Code quality checks (console.log detection, TODO comments)

### Unit Testing with Jest
```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

### End-to-End Testing with Playwright
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
```

### Available Scripts
- `npm run lint` - Run ESLint
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run clean` - Clean build cache

### Deployment to Vercel

The project is configured for easy deployment to Vercel. Follow these steps:

1. Push your changes to your GitHub repository
2. Connect your repository to Vercel
3. Add the following environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REPLICATE_API_KEY=your_replicate_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-vercel-url.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url
```

4. Add your production callback URL to the Google Cloud Console OAuth configuration:
```
https://your-vercel-url.vercel.app/api/auth/callback/google
```

5. Important Vercel deployment notes:
   - The Prisma schema is automatically generated during build
   - Database connectivity is established via the DATABASE_URL environment variable
   - Authentication is handled by NextAuth.js with Google OAuth
   - Supabase is used for data storage and retrieval

## Welcome Modal and First-Time Experience

The platform features an onboarding welcome modal for first-time visitors:

- **First Visit Detection**: The application tracks whether a user has visited before using localStorage.
- **Intuitive Guidance**: New users are presented with a modal that explains the platform's purpose and guides them to start by uploading leads.
- **Quick Start Guide**: The modal includes a step-by-step process to help users get value from the platform quickly.
- **Multiple Options**: Users can choose to either go directly to the upload page or explore the dashboard first.
- **Developer Tools**: For testing purposes, developers can use `window.resetFirstVisitFlag()` in the browser console to reset the first-visit state.

This feature ensures new users understand the intended workflow and helps them achieve success with the platform faster.

## Personalized Onboarding Flow

The platform offers a comprehensive onboarding experience for new users:

- **Interactive Setup Wizard**: Multi-step process to collect user preferences and company information
- **Empty State Management**: New users start with a clean platform and guided experience
- **Lead Scoring Customization**: The onboarding process collects key information that influences how leads are scored:
  - **Company Profile**: Information about the user's business, products/services, and industry
  - **Target Customer Definition**: Detailed information about ideal customer profiles including:
    - Preferred roles (e.g., CMO, Marketing Director, Founder)
    - Demographic preferences (e.g., gender, location)
    - Company size priorities (e.g., enterprise, mid-market, startup)
- **Preference Persistence**: All user preferences are stored in the database and applied to the lead scoring algorithm
- **Adaptive Scoring**: The lead scoring system automatically adjusts based on user-defined priorities
- **Preference Management**: Users can modify their preferences at any time through the platform settings

This personalized approach ensures that the platform provides the most relevant lead scoring and insights for each user's specific business needs.

## CSV Upload Guidelines

The platform supports CSV file uploads with flexible data handling:

### Supported Column Names

The system automatically recognizes various common column names for core fields:

- **Name**: `name`, `Name`, `contact`, `Contact`
- **Email**: `email`, `Email`, `E-mail`, `e_mail`
- **Company**: `company`, `Company`, `organization`, `Organization`
- **Title**: `title`, `Title`, `position`, `Position`
- **Source**: `source`, `Source`, `channel`, `Channel`
- **Value**: `value`, `Value` (Used in Budget Potential calculation)
- **Location**: `location`, `Location`, `city`, `City`, `state`, `State`, `country`, `Country`
- **Phone**: `phone`, `Phone`, `mobile`, `Mobile`
- **LinkedIn URL**: `linkedin`, `LinkedIn`, `linkedinUrl`, `linkedin_url`
- **Tags**: `tags`, `Tags` (Comma-separated values expected)

*Note: The scoring system will attempt to infer information even if specific columns like `insights` are not present.* 

### Requirements

- CSV file must have headers (column names in the first row)
- File should be UTF-8 encoded
- **Recommended file size**: Under 1000 lines for optimal performance
- **Large file handling**: Files over 1000 lines are automatically validated before processing

### Data Processing

- All data rows will be processed with comprehensive error handling
- **Timeout Protection**: 30-second timeout prevents browser hanging on large files
- **Early Validation**: File size and format validation before processing begins
- **Robust Parsing**: Advanced error handling and delimiter detection for CSV uploads
- **Batch Processing**: Large files are automatically processed in batches for reliability
- Duplicate records are handled based on email uniqueness
- Contact scores (Marketing, Budget, Orientation) are automatically calculated upon retrieval
- **Automatic Enrichment**: Location, timezone, and optimal outreach times are determined during processing.

## Lead Deletion System

The platform features a revolutionary **auto-continue deletion system** that ensures 100% complete lead removal with a single confirmation.

### 🎉 Key Features

#### **Single-Click Complete Deletion**
- **One Confirmation**: Click "Delete X Leads" once and the system automatically deletes ALL leads
- **No Manual Intervention**: Runs continuously until database is completely empty
- **Handles Any Size**: Successfully processes 3,000+ leads in one automated sequence
- **Zero Interruption**: No need to click delete multiple times

#### **Real-Time Progress Tracking**
- **Live Progress Bar**: Shows deletion progress (e.g., "1,247/3,000 leads deleted")
- **Batch Indicators**: Displays current batch progress (e.g., "Batch 15 of 60")
- **Percentage Complete**: Real-time percentage updates during deletion
- **Lead Count Display**: Shows exact number of leads before deletion confirmation

#### **Prominent Success Notifications**
- **Double Toast Messages**: 
  - First: "🎉 DELETION COMPLETE!" (10 seconds)
  - Second: "🗑️ Database Cleared!" (6 seconds)
- **Visual Button Feedback**: Button turns green with "✅ Leads Cleared!" and pulse animation
- **Console Celebrations**: Multiple emoji-rich success messages for confirmation
- **State Persistence**: Success state visible for 5 seconds before reset

### 🔧 Technical Excellence

#### **Multi-Phase Deletion Process**
1. **Direct Delete**: Attempts to delete all leads in one operation
2. **Batch Deletion**: Falls back to iterative batch processing if needed
3. **Verification**: Checks for any remaining leads after completion
4. **Additional Cleanup**: Runs extra cleanup phases if any leads remain

#### **Robust Error Handling**
- **Continues on Failure**: Deletion continues even if individual batches fail
- **Multiple Fallback Methods**: Several strategies ensure complete deletion
- **Safety Mechanisms**: Prevents infinite loops with built-in safety checks
- **Rate Limiting**: Optimized for Supabase constraints with proper delays

#### **Performance Optimizations**
- **Efficient Batching**: 50 leads per batch for optimal performance
- **Fast Processing**: 100ms delays between batches for speed
- **Memory Management**: Improved handling of large datasets
- **Progress Accuracy**: Real-time updates without performance impact

### 🎯 User Experience

#### **Clear Feedback System**
- **Before Deletion**: Shows exact lead count (e.g., "1,000 leads will be deleted")
- **During Deletion**: Real-time progress with batch indicators
- **After Completion**: Multiple confirmation methods ensure clarity
- **Ready State**: Clear indication when database is ready for new uploads

#### **Visual States**
- **Confirmation Dialog**: Shows lead count and deletion warnings
- **Progress Display**: Animated progress bar with batch information
- **Success State**: Green button with checkmark and celebration messages
- **Reset State**: Returns to normal after 5 seconds

### 🛠️ Usage Instructions

1. **Navigate** to the Data Input page
2. **Click** "Clear All Leads" button
3. **Review** the confirmation dialog showing lead count
4. **Click** "Delete X Leads" to confirm
5. **Watch** real-time progress as deletion proceeds automatically
6. **Receive** prominent success notifications when complete

### 🔍 Troubleshooting

#### **If Deletion Appears Incomplete**
- Check browser console for detailed progress logs
- Look for success messages: "🎉 DELETION COMPLETE!"
- Verify lead count shows 0 in dashboard
- Refresh page to confirm database is empty

#### **Performance Considerations**
- Large datasets (3,000+ leads) may take 2-3 minutes
- Progress bar provides accurate time estimates
- Browser may appear busy during processing - this is normal
- Do not close browser tab during deletion process

#### **Error Recovery**
- System automatically retries failed batches
- Multiple cleanup phases ensure complete deletion
- If process stops unexpectedly, simply run deletion again
- Partial deletions are handled gracefully with progress tracking

## Contact Scoring Model

The platform utilizes a **deterministic, multi-dimensional scoring system** (0-100 where applicable) to analyze contacts based on available CSV data. The scoring system has been completely redesigned to ensure **consistent, reproducible results** across all user sessions.

### 1. Marketing Activity Score (0-100)
- **Purpose**: Identifies contacts with a strong focus on marketing roles or activities.
- **Factors**: Analyzes job titles (prioritizing marketing leadership & specific roles), company/industry type (agencies, media), lead source, keywords in insights/notes, and relevant tags.

### 2. Budget Potential (0-100) & Confidence (Low/Medium/High)
- **Purpose**: Estimates the potential budget associated with a contact.
- **Factors**: Analyzes role seniority (leadership, director, manager), provided `value` field, inferred company size/type (enterprise vs startup), industry indicators (finance, tech), location (financial hubs), and relevant tags or insights notes mentioning budget/funding.
- **Confidence**: Indicates the reliability of the estimate based on the quality and directness of the available data points (e.g., known `value` and seniority increase confidence).

### 3. Business Orientation (B2B/B2C/Mixed/Unknown) & Confidence (Low/Medium/High)
- **Purpose**: Classifies the contact's likely business focus.
- **Factors**: Analyzes email domain (business vs personal), company name indicators (keywords like `inc`, `retail`, `solutions`), job title keywords (sales vs customer service), lead source, and relevant tags.
- **Confidence**: Indicates the certainty of the classification based on the strength and consistency of the signals.

The dashboard table displays these scores and classifications, allowing for sorting and filtering to prioritize contacts based on specific criteria.

### 4. Best Overall Score (0-100)
- **Purpose**: Provides a unified score that combines all dimensions based on user preferences from onboarding
- **Factors**: Intelligently weights Marketing Activity, Budget Potential, Business Orientation, and Intent scores according to:
  - Target roles and industries specified during onboarding
  - Company size preferences
  - Business focus (B2B vs B2C alignment)
  - Budget sensitivity indicators
- **Consistency**: Uses deterministic algorithms to ensure leads always appear in the same order
- **Personalization**: Automatically adjusts scoring weights based on user's business profile and target customer definitions

### Scoring System Reliability
- **🔒 Deterministic Results**: All scoring calculations use consistent hash functions to eliminate randomness
- **🎯 Preference-Aware**: Scoring adapts to user preferences while maintaining consistency
- **⚡ Performance Optimized**: Single scoring pass with intelligent caching prevents duplicate calculations
- **🔄 Stable Ordering**: Leads maintain their relative positions across page refreshes and navigation

## User Interface Highlights

The platform features a carefully designed UI, recently refined for enhanced clarity, consistency, and professionalism:

### Dashboard & Components
- **Refined Dark Theme**: Consistent dark backgrounds (`bg-gray-900`, `bg-gray-800`), borders (`border-gray-700`), and subtle shadows across the application.
- **Improved Sidebar**: Cleaner active/hover states, better alignment, slightly larger logo.
- **Enhanced Cards**: Replaced gradients with solid backgrounds and borders for clearer information hierarchy (e.g., Heygen Tools).
- **Professional Forms**: Consistent styling for select inputs and buttons, including focus states for accessibility (e.g., Podcast Generator).
- **Clearer Hierarchy**: Improved use of spacing, font weights, and component separation to guide user attention.
- **Subtle Interactivity**: Added smooth transitions and refined hover/focus states for buttons, links, and interactive elements.
- **Welcome Modal**: User-friendly onboarding experience with clear guidance for first-time visitors.

### Data Presentation
- Enhanced data table with sorting, searching, and export capabilities.
- Visual indicators (badges, colors) for scores and classifications.
- Interactive elements with subtle hover and active states.
- Better loading states with animated indicators.
- Informative empty states when no data is available.

### Navigation & Controls
- Sidebar with clear active state indicators.
- Consistent button and input styling throughout.
- Prominently displayed action buttons (Refresh, Clear, Export).
- Helpful context indicators and badges.

### Mobile Responsiveness
- Fully responsive design optimized for phones, tablets, and desktops.
- Collapsible sidebar with smooth slide-in/out animation on mobile.
- Adaptive table layouts that transform into card views on small screens.
- Optimized touch targets for mobile interaction.
- Context-sensitive UI that adapts to available screen space.
- Improved navigation with hamburger menu on mobile devices.
- Mobile-optimized data presentation with prioritized information.

## AI Message Customization

The platform includes an advanced AI-powered message customization feature to help with lead outreach:

### Key Capabilities

- **Intelligent Message Transformation**: Modify outreach messages based on natural language prompts
- **Multiple Customization Options**: Make messages more conversational, professional, personal, brief, industry-specific, or humorous
- **Context-Aware Processing**: AI considers recipient's industry, role, and company when applying transformations
- **Example Prompts**: Pre-defined prompt buttons for common customization needs
- **Custom Instructions**: Free-form text field for specific customization requirements

### User Experience

- **Interactive Interface**: Select a lead, view the default template, and customize with one click
- **One-Click Customization**: Apply example prompts directly by clicking the suggestion buttons
- **Real-Time Updates**: See message transformations immediately after applying a prompt
- **Message Management**: Copy to clipboard, reset to default template, or apply multiple transformations
- **Keyboard Support**: Press Enter in the prompt field to apply customizations

### Technical Features

- **Clean Message Generation**: Advanced prefix removal system eliminates AI response artifacts like "Here is the transformed message:"
- **Context Preservation**: Properly formats messages and maintains signature placement
- **Company Branding**: Automatically includes user's company name in message signatures
- **Iterative Cleaning**: Multiple-pass cleaning to handle nested AI response prefixes
- **Fallback Handling**: Multiple strategies to ensure prompts are properly applied
- **Accessibility Support**: Full keyboard navigation and ARIA attributes
- **Error Recovery**: Graceful handling of API failures with helpful error messages
- **Caching**: Maintains state between navigation to preserve customized messages

### Example Use Cases

- Making formal messages more conversational for early-stage leads
- Adding humor to break the ice with marketing professionals
- Including industry-specific insights for enterprise prospects
- Shortening messages for C-level executives
- Adding urgency for time-sensitive opportunities
- Combining transformations (e.g., "make it longer and funnier")

## Recent Updates

### Version 15.13.6 - 2025-01-XX
- **Critical Bug Fixes**:
    - **🔧 CSV Upload Reliability**: Fixed PapaParse hanging indefinitely on large CSV files (500+ leads)
    - **⏱️ Timeout Protection**: Added 30-second timeout mechanism to prevent browser freezing
    - **📏 Early Validation**: File size validation (1000+ lines) before processing begins
    - **🛡️ Error Handling**: Comprehensive error handling throughout CSV processing pipeline
    - **🧪 Test Improvements**: Fixed Playwright test race conditions and Firefox upload errors
- **Technical Improvements**:
    - Enhanced memory management during large file processing
    - Better error messages for different failure scenarios
    - Improved test reliability across all browsers (Chrome, Firefox, Safari)
    - Added comprehensive debugging output for troubleshooting
- **Reliability Enhancements**:
    - Increased upload success rate for files of all sizes
    - Reduced browser crashes and hanging during large file uploads
    - Enhanced user feedback during processing with proper error states

### Version 15.13.1 - 2025-01-XX
- **New Features**:
    - **🌟 Subtle Animated Background**: Sophisticated animated background with particles, neural networks, and geometric shapes
    - **🎨 Premium Tech Aesthetic**: Very subtle motion graphics with low opacity elements (4-8%)
    - **⚡ Performance Optimized**: Hardware-accelerated CSS animations with minimal performance impact
- **Build System Fixes**:
    - **🔧 Vercel Deployment**: Fixed React Client Manifest error that prevented deployments
    - **🔄 Next.js 15.2.4 Compatibility**: Resolved useSearchParams Suspense boundary requirement
    - **🏗️ Component Architecture**: Refactored homepage for better server-side compatibility
- **Technical Improvements**:
    - Enhanced component separation between server and client rendering
    - Added proper Suspense boundaries for search params handling
    - Improved build stability and deployment reliability

### Version 15.13.0 - 2025-01-XX
- **Critical Fixes**:
    - **🎯 Lead Scoring Consistency**: Fixed major issue where leads appeared in different orders after navigation
    - **🔄 Deterministic Scoring**: Eliminated all randomness from lead scoring calculations
    - **📧 Clean Outreach Messages**: Removed "Here is the transformed message:" prefixes from AI-generated messages
    - **🏢 Company Signatures**: Ensured company names are properly included in outreach message signatures
- **Technical Improvements**:
    - Unified scoring system to prevent duplicate calculations
    - Enhanced caching with preferences-aware cache keys
    - Improved message generation with comprehensive prefix removal
    - Added iterative cleaning for nested AI response prefixes
- **Performance**:
    - Reduced redundant scoring calculations
    - Improved lead ordering stability across page refreshes
    - Enhanced message generation reliability

### Version 15.12.0 - 2025-05-21
- **Features**:
    - Added Google Sign-In integration on the homepage
    - Improved authentication flow with proper session management
    - Added Prisma ORM integration for better database management
    - Added proper Vercel deployment support
- **UI Improvements**:
    - Updated homepage with Google authentication button
    - Enhanced error page with proper loading states
    - Improved middleware to handle authentication redirects correctly
- **Fixes**:
    - Fixed Suspense boundary for useSearchParams in signin error page
    - Fixed Vercel build issues related to Prisma generation
    - Resolved potential security issues with environment variables
    - Fixed authentication-related redirects in middleware
- **Development**:
    - Implemented proper .gitignore rules for sensitive files
    - Added Prisma schema for database models
    - Made build scripts more robust for CI/CD

### [Previous Release] - YYYY-MM-DD
- **Features**:
    - Added AI Message Customization for personalized outreach with prompt-based message generation.
    - Integrated Replicate API for advanced AI-powered message generation.
    - Added Welcome Modal for first-time visitors with onboarding guidance to the upload page.
    - Added Heygen AI Video Integration (Tools links, Podcast Script Generator).
    - Added Lead Enrichment (location, timezone, optimal outreach time).
    - Implemented Audio Message Recording feature for personalized outreach.
- **UI Overhaul**:
    - Refined overall dark theme consistency (backgrounds, borders, shadows).
    - Improved Sidebar styling (active/hover states, logo).
    - Redesigned card components (Heygen Tools).
    - Enhanced form elements (Podcast Generator inputs/buttons).
    - Removed non-functional theme toggle, standardizing on dark mode.
- **Fixes**:
    - Fixed Heygen tool links not being clickable.
    - Implemented podcast script generation logic.
    - Resolved multiple CSV upload issues.
    - Improved UI layout on the Lead Outreach page.
- **Changes**:
    - Updated Lead Scoring integration.
    - Refactored enrichment logic.
    - Added mechanism to track first-time visitors using localStorage.

### Version 15.11.0
- **Major Scoring Overhaul**: Replaced previous scoring with a new multi-dimensional system (Marketing Activity, Budget Potential, Business Orientation).
- **Dashboard Redesign**: Removed pie chart, focusing on an enhanced data table with search, sort, and export.
- **Application Refocus**: Shifted context from "PROPS Lead Management" to a more general "Contact Scoring Platform".
- **UI Updates**: Renamed "Leads" to "Contacts" in UI elements.
- **Code Cleanup**: Removed old scoring functions and related dashboard logic.

### Version 15.10.0
- Enhanced PROPS lead scoring algorithm based on industry best practices

## Tech Stack

- Next.js 15.2.4
- React 18.3
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI Components
- Papa Parse (CSV parsing)
- Chart.js (data visualization)
- MediaRecorder API (audio recording)
- Lucide Icons

## Contributing and Source Control

### Pushing Changes to GitHub

After making updates to the codebase, follow these steps to push your changes to GitHub:

1. Check the status of your changes:
```bash
git status
```

2. Add all modified and new files to the staging area:
```bash
git add .
```

3. Commit your changes with a descriptive message:
```bash
git commit -m "Enhanced lead scoring algorithm and improved pie chart visualization"
```

4. Push your changes to the remote repository:
```bash
git push origin main
```

5. Verify your changes have been pushed by checking the GitHub repository.

Always make sure to update the version number in the README.md when making significant changes to the codebase.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

If you encounter issues with data uploads or database functionality, the application includes a built-in diagnostic tool:

1. Navigate to `/debug` in your browser
2. The diagnostics page will:
   - Test your Supabase connection
   - Verify the leads table structure
   - Provide tools to download sample data
   - Allow you to clear all leads if needed

### Data Management

#### Clearing All Leads
You can clear all leads from two locations:
1. **Dashboard** - Use the red "Clear All Leads" button in the top navigation
2. **Debug Page** (`/debug`) - Use the "Clear All Leads" button in the Data Management section

If you encounter issues clearing leads:
- Make sure your Supabase connection is working (check the Debug page)
- Verify you have proper RLS policies in your Supabase project that allow deletes
- Try clearing in smaller batches by uploading fewer leads at a time

#### Refreshing Data
If you see stale data or need to refresh:
1. Use the "Refresh Data" button on the Dashboard
2. This forces a full reload from the database, bypassing any cached data

### Common Issues and Solutions

#### CSV Upload Failures
- **File Format**: Ensure your CSV file is properly formatted with headers
- **Encoding**: Check that your file is UTF-8 encoded
- **File Size**: For files over 1000 lines, consider splitting into smaller batches
- **Timeout Issues**: Large files now have 30-second timeout protection to prevent browser hanging
- **Processing Errors**: Early validation catches format issues before processing begins
- **Template**: Try the sample CSV template available at `/sample-leads.csv`
- **Browser Compatibility**: All major browsers (Chrome, Firefox, Safari) are fully supported

#### Database Connection Issues
- Verify your Supabase URL and anon key are correct in the environment variables
- Check if your Supabase project is active and not paused
- Ensure your database has the required 'leads' table (use the Debug page)
- Check browser console for specific error messages

#### Permission Issues
- The application uses Row Level Security (RLS) policies in Supabase
- If you can't add, modify or delete leads, check your RLS policies
- For testing, you can temporarily enable full access by configuring your RLS policy to return true

#### Data Not Displaying After Upload
- Use the "Refresh Data" button on the dashboard
- Check the browser console for any API errors
- Verify the data was successfully uploaded via the Supabase Table Editor
- Try clearing browser cache and reloading the page

#### Lead Upload Issues (Recent Fix - December 2024)
**Problem**: Leads uploaded but not appearing in dashboard
**Solution**: This was a critical issue that has been resolved in the latest update. If you experience this:
1. Make sure you're signed in with Google OAuth before uploading leads
2. The system now properly routes authenticated users to database storage instead of localStorage
3. Clear your browser's localStorage: `localStorage.clear()` in browser console
4. Refresh the page and try uploading again
5. Check that the upload success message indicates database storage, not localStorage

**Technical Details**: Previous versions incorrectly used `allowUnauthenticated={true}` on the data-input page, causing all uploads to go to localStorage regardless of authentication status. This has been fixed to use `allowUnauthenticated={!isAuthenticated}`.

#### Lead Scoring Consistency Issues (Fixed in v15.13.0)
**Problem**: Leads appearing in different orders after navigation or page refresh
**Solution**: This critical issue has been resolved. If you still experience inconsistent ordering:
1. Clear browser cache and reload the page
2. Ensure you're using the latest version of the application
3. Check browser console for any JavaScript errors
4. Try refreshing the data using the "Refresh Data" button

**Technical Details**: The previous version had dual scoring systems that could run at different times with different preference states. This has been unified into a single, deterministic scoring system.

#### Outreach Message Formatting Issues (Fixed in v15.13.0)
**Problem**: Generated messages showing "Here is the transformed message:" or similar prefixes
**Solution**: This has been automatically resolved with enhanced message cleaning:
1. All AI-generated messages now have prefixes automatically removed
2. Company signatures are properly included at the end of messages
3. Multiple cleaning passes handle nested or complex AI responses
4. No user action required - the fix is automatic

#### Mobile Compatibility Issues
- Clear browser cache and reload if CSS doesn't appear correct
- Make sure you're using the latest version of your mobile browser
- Check that JavaScript is enabled on your mobile browser
- Some advanced features may have reduced functionality on older mobile devices 

## Testing

The application includes comprehensive testing to ensure reliability and prevent regressions:

### Unit and Integration Tests (Jest)

We use Jest for testing individual components, utility functions, and API routes:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

Playwright is used for end-to-end testing to ensure the application works correctly from a user's perspective:

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (for debugging)
npm run test:e2e:ui

# Install Playwright browsers (first-time setup)
npx playwright install
```

### Test Coverage

The test suite covers:
- Core functionality (message generation, data upload/processing)
- API routes (handling requests, data validation, error cases)
- UI components (rendering, user interactions)
- End-to-end user flows (complete scenarios from upload to message customization)

### Test Structure
- `src/__tests__/` - Jest unit and integration tests
- `e2e/` - Playwright end-to-end tests 

## Authentication Setup

The platform uses NextAuth.js for authentication with Google OAuth:

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add your authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: Your production domain
7. Add your authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
8. Click "Create" and note your Client ID and Client Secret
9. Add these credentials to your `.env` file as described in the installation section

### Required Permissions

1. **Google Cloud IAM Roles**:
   - No special IAM roles are needed for basic OAuth functionality
   - The OAuth client needs the "Google Sign-In" API enabled in the Google Cloud Console

2. **Supabase Permissions**:
   - The `SUPABASE_SERVICE_ROLE_KEY` is required for the NextAuth adapter to create and manage user records
   - Ensure your Supabase database has appropriate tables for NextAuth (created by the migration script)
   - Make sure Row Level Security (RLS) policies allow the service role to manage auth-related tables

### User Management

- New users are automatically created in the database when they sign in with Google
- User sessions are maintained using JWT tokens
- Authentication state is accessible throughout the application via the NextAuth session provider 

## UI/UX Enhancements

### Interactive Animated Background
The platform features a dynamic, interactive background animation on the homepage that creates a modern, tech-forward impression:

- **Particle Animation**: Floating particles that respond subtly to user interaction
- **Data Visualization Elements**: Abstract representations of AI data processing and connections
- **Ambient Glow Effects**: Soft color gradients that add depth without compromising readability
- **AI Visual Metaphors**: Hexagons, data lines, and scan patterns that reinforce the AI-powered nature of the platform

### Modern Interface Design
The user interface has been carefully crafted to balance aesthetics with usability:

- **Floating Text Design**: Content appears to float directly on the animated background for a seamless experience
- **Strategic Contrast**: Text and interactive elements maintain high readability against the dynamic background
- **Gradient Accents**: Subtle color gradients highlight important information and create visual hierarchy
- **Responsive Adaptations**: The UI automatically adjusts to provide optimal experiences across all device sizes

These enhancements work together to create a memorable, professional impression while ensuring the platform remains highly functional and accessible. 

## ✨ Key Features

### 🎯 **Unified AI-Powered Lead Scoring**
- **Consistent Scoring**: Same algorithm across dashboard and outreach calendar
- **Multi-dimensional analysis**: Intent, spend authority, marketing fit, and budget potential
- **User preference integration**: Scores adapt to your target criteria
- **Deterministic results**: Stable, reproducible lead prioritization

### 📊 **Smart Dashboard & Analytics**
- **Dual-view interface**: Leads table and outreach calendar with identical top leads
- **Real-time scoring**: AI-powered lead evaluation with multiple factors
- **Visual insights**: Score distributions and lead analytics
- **Preference-based filtering**: Customized lead ranking based on your criteria

### 📅 **Intelligent Outreach Calendar**
- **Weekly scheduling**: Top leads distributed across weekdays
- **Priority-based timing**: Higher-scoring leads scheduled earlier
- **Consistent lead selection**: Same top 15 leads as dashboard view
- **Click-to-contact**: Direct navigation to lead details and outreach tools 

## 🎓 Scoring Tutorial System

### Overview
The OptiLeads scoring tutorial is an intelligent onboarding system that educates users about our AI-powered lead scoring methodology. It appears at strategic moments to maximize user understanding without interrupting critical workflows.

### Key Features
- **Company-Specific Personalization**: Tutorial content adapts to use the user's actual company name and targeting preferences
- **Smart Timing**: Appears after first lead uploads or settings resets, but never during onboarding processes
- **Three-Dimensional Scoring Explanation**:
  - **Intent Score (40-80)**: Purchase likelihood based on role, industry, and growth indicators
  - **Company Focus (0-100)**: ICP alignment based on size, vertical, and location
  - **Engagement Potential (25-85)**: Decision-making power and budget authority assessment
- **Pro Tips Section**: Actionable advice personalized to the user's business model and target market
- **Mobile-Optimized**: Sticky headers and responsive design for all device types

### Technical Implementation
- **Hook-Based State Management**: `useScoringTutorial()` hook for consistent state across components
- **localStorage Persistence**: Tutorial completion state persists across sessions
- **Intelligent Triggering**: 
  - Triggers 1.5s after successful authenticated uploads for new users
  - Triggers 1.5s after leads load following settings resets
  - Never interferes with onboarding or reset processes
- **Reset Detection**: 60-second window to detect recent settings resets
- **Test Functions**: Built-in testing utilities for development and QA 