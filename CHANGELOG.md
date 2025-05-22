# Changelog

All notable changes to this Contact Scoring Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-07-15

### Added
- **Enhanced Database Connectivity**: 
  - Implemented retry logic in Supabase client with exponential backoff
  - Added fallback to mock data during database connection failures
  - Improved error logging for database operations
- **Customizable Lead Table Columns**:
  - Added dynamically generated columns based on user preferences
  - Implemented "Best Overall" score that adapts to user's business priorities
  - Created enhanced scoring algorithm that weights factors based on onboarding data
  - Added visual explanation tooltips for all score metrics
  - Added hidden debug mode for testing (triple-click search field to activate)

### Fixed
- **Critical Connection Issue**: Fixed Supabase URL typo (changed "boq" to "bog") that was causing intermittent connection failures
- **Database Security**: Consolidated and optimized Row Level Security policies
- **Database Schema**: Fixed tables lacking primary keys and addressed unused indexes
- **Lead Display**: Resolved issues with lead scores sometimes showing as "-" instead of numerical values

## [Unreleased] - YYYY-MM-DD

### Added
- **Secure Authentication**: Implemented NextAuth.js with Google OAuth:
  - Created authentication flow with Google Sign-In
  - Added protected routes requiring authentication
  - Set up Supabase adapter for storing user credentials
  - Added user session management
  - Created authentication migration script
  - Updated documentation with setup instructions
- **AI Message Customization**: Implemented a complete AI-powered message customization system:
  - Created `MessageGenerator` component in `src/components/shared/MessageGenerator.tsx` with interactive prompt interface
  - Added `/api/generate-message` endpoint with intelligent message transformation capabilities
  - Implemented prompt-based message customization with support for different styles (conversational, professional, funny, etc.)
  - Added auto-apply functionality for example prompts
  - Enhanced user experience with keyboard support and improved accessibility
- **Lead Enrichment**: Implemented automatic enrichment of leads with `location`, `timezone`, `optimal_outreach_time`, `optimal_outreach_time_eastern`, and `outreach_reason` using `src/lib/leadEnrichment.ts` and external APIs.
- **Audio Message Recording**: Added a feature in the Lead Outreach page (`src/app/outreach/lead/[id]/page.tsx`) allowing users to record, play, and download personalized audio messages for leads.
- **Personalized onboarding flow**: Added a multi-step process to customize lead scoring
- **User preferences database schema**: Added schema for storing onboarding preferences
- **Custom lead scoring algorithm**: Implemented algorithm that incorporates user preferences
- **Interactive UI components**: Added components for gathering user information during onboarding
- **Context provider**: Created provider for managing user preferences state
- **API endpoints**: Added endpoints for fetching and updating user preferences
- **Documentation updates**: Updated documentation with information about onboarding features

### Changed
- **Message Signature Handling**: Improved message signature placement to ensure professional formatting
- **Content Calendar**: Updated `src/components/ContentCalendar.tsx` and `src/types/lead.ts` to add and display the `companyName` in the calendar view.
- **Lead Scoring**: Updated `getLeads` in `src/lib/supabase.ts` to integrate newly calculated scores (`marketingScore`, `budgetPotential`, `budgetConfidence`, `businessOrientation`, `orientationConfidence`) into the returned `Lead` objects.
- **UI Layout**: Improved padding, spacing, and typography on the Lead Outreach page (`src/app/outreach/lead/[id]/page.tsx`) for better readability and presentation.
- **Modified dashboard**: Added onboarding flow for new users
- **Updated layout**: Included UserPreferencesProvider
- **Refactored lead scoring algorithm**: Incorporated user preferences

### Fixed
- **Message Formatting**: Fixed message transformation to maintain proper structure with signatures at the end
- **AI Prompt Handling**: Improved handling of complex prompts like "make it longer and funnier" with smarter prompt recognition
- **CSV Upload**: 
    - Resolved database column mismatch error (`optimalOutreachTime`) by adding `.select('*')` to the Supabase insert query in `src/lib/supabase.ts`.
    - Fixed "No data found in CSV file" errors by improving parsing logic in `src/components/shared/DataUpload.tsx`, adding pre-checks, fallback delimiter handling, and better logging.
    - Improved cancellation handling in the `DataUpload.tsx` component UI.
- **Database Schema**: Added necessary columns to the `leads` table to support enrichment and new scoring features (e.g., `location`, `timezone`, `optimal_outreach_time`, `marketingScore`, etc.).
- **Lead Score Display**: Fixed issue with lead scores not displaying properly in the UI by adding proper mapping in `src/app/api/fetch-leads/route.ts` between database column names (snake_case) and frontend property names (camelCase).

### Removed
- Old `/api/enrich-lead-location`, `/api/leads/[id]`, `/api/update-lead`, `/api/add-database-columns` API routes as logic moved to `src/lib/supabase.ts` and `src/lib/leadEnrichment.ts`.
- `OutreachTimeEnricher` component and related demo page/integrations as enrichment is now handled server-side during upload/fetch.

## [15.11.0] - 2024-06-19

### Added
- New Contact Scoring System with three dimensions:
  - **Marketing Activity Score**: Quantifies marketing focus based on title, company, source, insights, tags, and activity.
  - **Budget Potential Estimation**: Estimates budget potential (0-100) with confidence levels (Low, Medium, High) based on seniority, lead value, company type, industry, location, tags, and insights.
  - **Business Orientation Classification**: Categorizes contacts as B2B, B2C, Mixed, or Unknown with confidence levels (Low, Medium, High) based on email domain, company name, title, source, and tags.
- Enhanced `LeadsTable` component with search, sorting by multiple columns, and CSV export functionality.
- New helper functions for calculating the new scoring dimensions in `src/lib/supabase.ts`.
- Updated `Lead` type definition in `src/types/lead.ts` with new scoring fields.

### Changed
- **Major Overhaul**: Replaced previous lead scoring model (`calculatePropsScore`, `calculateChromeIndustriesScore`) with the new three-dimensional contact scoring system.
- Refocused application from "PROPS Lead Management" to a more general "Contact Scoring Platform".
- Simplified `Dashboard` component, removing the pie chart and focusing on the enhanced `LeadsTable`.
- Renamed "Leads" to "Contacts" in various UI elements (Dashboard title, buttons, table labels).
- Updated `getLeads` function to compute and return the new scoring metrics for each contact.
- Refined scoring logic to utilize more fields (`insights`, `tags`, `location`, `status`, `last_contacted_at`) for better accuracy.

### Removed
- Pie chart visualization from the dashboard.
- Old scoring functions (`calculatePropsScore`, `calculateChromeIndustriesScore`) from `src/lib/supabase.ts`.
- `analytics` state and related logic from `Dashboard.tsx` (as `getLeadAnalytics` wasn't updated for new scores).

## [15.10.0] - 2024-06-19

### Added
- Enhanced PROPS lead scoring algorithm based on industry best practices
- Implemented sophisticated scoring system incorporating both explicit (fit) and implicit (engagement/intent) data
- Added LinkedIn data analysis to improve scoring precision
- Added detailed tooltips with percentage information to pie chart
- Added lead quality descriptions in tooltips
- Added center display of average score in the pie chart
- Added explanatory text about scoring criteria below the pie chart

### Changed
- Completely revised lead scoring methodology with more sophisticated criteria
- Optimized score distribution for better lead qualification
- Redesigned pie chart visualization with improved color scheme
- Enhanced visual appeal with white borders and exploded pie segments
- Increased pie chart animation duration for better visual effect
- Updated dashboard header to clearly indicate PROPS branding
- Improved sorting of top leads list to use the new scoring system

### Fixed
- Fixed TypeScript errors in chart rendering components
- Fixed calculation of percentages in pie chart tooltips
- Resolved issues with score distribution clustering in a single segment

## [15.9.0] - 2024-06-10

### Changed
- Improved mobile hamburger menu for better usability
- Enhanced sidebar navigation accessibility
- Improved content spacing for mobile and tablet views
- Optimized calendars for touch interaction on mobile devices

### Fixed
- Added proper spacing between sidebar and main content
- Fixed mobile UI inconsistencies for better user experience

### Added
- Added accessible ARIA attributes to interactive elements
- Standardized mobile UI patterns across all pages
- Rebranded from "CHROME" to "PROPS" throughout the app

## [15.8.0] - 2024-05-27

### Added
- Implemented comprehensive mobile responsiveness across all app components
- Added collapsible sidebar navigation with touch-friendly controls
- Created responsive table-to-card transformations for small screens
- Enhanced touch targets and spacing for mobile interaction
- Added mobile-first layout adaptations that maintain complete functionality
- Optimized data presentation hierarchy for smaller screens

### Fixed
- Fixed layout issues across various device sizes and orientations

## [15.7.0] - 2024-05-12

### Added
- Added robust lead management tools for database administration
- Implemented improved CSV upload with detailed progress tracking
- Enhanced lead deletion functionality with better feedback and reliability
- Added batch processing for large datasets with progress indicators
- Added dedicated Data Clear component for lead deletion
- Updated UI to provide better feedback during long-running operations

### Fixed
- Improved error handling for database operations
- Fixed cache issues to prevent stale data display

### Changed
- Enhanced dashboard with more visible admin controls

## [15.6.0] - 2024-04-07

### Added
- Subtle animations and transitions for better interactivity
- Avatar placeholders for leads in table views
- Consistent badge styling throughout the application

### Changed
- Completely redesigned UI for improved user experience
- Enhanced card layouts with better visual hierarchy and spacing
- Improved navigation with clearer active state indicators
- Updated color palette for better contrast and visual appeal
- Improved data visualization components with better tooltips
- Enhanced table layouts with better spacing and typography
- Improved loading and error states with better visual feedback

## [15.5.0] - 2024-04-06

### Added
- Audio message recording feature to lead outreach
- Direct LinkedIn profile links on lead detail pages
- Suspense boundaries for better loading states

### Changed
- Enhanced calendar navigation with clickable day headers

## [15.4.0] - 2024-04-05

### Added
- PROPS specialized scoring model
- Outreach calendar for lead prioritization

### Changed
- Reorganized dashboard to prioritize outreach calendar
- Updated documentation to reflect PROPS focus

### Fixed
- Pie chart animation and sizing issues

## [15.3.0] - 2024-04-04

### Added
- Debug page for troubleshooting database connections
- Batch processing for files of any size
- Ability to download sample data templates
- Database setup utilities for easier deployment

### Changed
- Removed restrictions on required fields (email no longer required)

### Fixed
- Data upload functionality with improved error handling

## [15.2.4] - 2024-04-03

### Added
- Batch processing for large files

### Changed
- Updated to Next.js 15.2.4
- Improved CSV upload with better error handling
- Enhanced data validation and error reporting

### Fixed
- Various type issues and improved TypeScript support

## [1.4.0] - 2023-07-24

### Added
- Interactive animated background on the homepage
- Dynamic particle animations that visualize AI and data connections
- Abstract data visualization elements including hexagons, pulse effects, and connection points
- AI visual metaphors (data lines, scanners, connection dots) to reinforce the platform's capabilities

### Changed
- Redesigned homepage with floating text directly on animated background
- Improved logo styling with color accents and better contrast
- Enhanced typography with gradient text effects for headlines
- Optimized testimonial section for better readability against animated background
- Refined color palette to create better visual hierarchy

### Fixed
- Fixed issues with lead scoring algorithm to ensure consistent results
- Resolved error with MessageGenerator component (Missing required parameters: baseMessage)
- Improved button hover states and interaction feedback
- Enhanced overall responsiveness of the landing page

## [1.3.0] - 2023-07-10

### Added
- Personalized lead scoring based on user preferences
- Lead management dashboard with sortable columns
- "Best Overall" score calculation using weighted factors

### Changed
- Improved data table with better sorting capabilities
- Enhanced user onboarding experience
- Updated navigation for better accessibility

### Fixed
- Resolved authentication issues with Google login
- Fixed data inconsistencies in lead scoring
- Improved error handling throughout the application 