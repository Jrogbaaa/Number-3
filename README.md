# PROPS Lead Management Platform

A modern lead management platform built with Next.js 15, React, TypeScript, and Supabase, specialized for PROPS lifestyle brand.

## Features

- 📊 Lead Analytics Dashboard
- 📈 Industry-Specific Lead Scoring
- 📥 CSV Data Import
- 📅 PROPS Outreach Calendar
- 🎙️ Personalized Audio Messages
- 🔄 Real-time Updates
- 🌙 Dark Mode UI with Modern Design
- 🎨 Intuitive User Interface with Enhanced Visuals
- 📱 Responsive Design for Mobile, Tablet and Desktop
- 📋 Clean Data Presentation with Improved Card Layouts
- ♻️ Data Management Tools (Add, Clear, Refresh)

## PROPS Focus

This platform is specifically designed to help PROPS:

- Identify leads with the highest potential interest in lifestyle/cycling fashion
- Prioritize contacts based on industry relevance
- Target marketing professionals and decision-makers
- Schedule outreach to the most promising contacts
- Track progress of leads through the sales pipeline

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jrogbaaa/Chrome-Lead-Management.git
cd Chrome-Lead-Management
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
```

4. Run the development server:
```bash
npm run dev
```

## CSV Upload Guidelines

The platform supports CSV file uploads with flexible data handling:

### Supported Column Names

The system automatically recognizes various common column names:

- **Name**: `name`, `Name`, `contact`, `Contact`
- **Email**: `email`, `Email`, `E-mail`, `e_mail`
- **Company**: `company`, `Company`, `organization`, `Organization`
- **Title**: `title`, `Title`, `position`, `Position`
- **Source**: `source`, `Source`, `channel`, `Channel`
- **Value**: `value`, `Value`

### Requirements

- CSV file must have headers (column names in the first row)
- File should be UTF-8 encoded
- No file size limit - large files are automatically processed in batches

### Data Processing

- All data rows will be processed, even without complete information
- Data is processed in batches for handling files of any size
- The system will generate placeholder values for missing required fields
- Duplicate records are handled via upsert operations with duplicate skipping
- Lead scores are automatically calculated based on PROPS relevance
- Outreach calendar automatically prioritizes high-value leads

## PROPS Scoring Model

Leads are scored on a 0-100 scale based on an advanced methodology that incorporates both explicit (fit) and implicit (engagement/intent) data:

### Explicit Data (Fit) Factors:
- **Job Title/Role**: Higher scores for marketing leadership (CMO, VP Marketing, Head of Growth), director-level positions, and marketing managers
- **Industry/Company Relevance**: Prioritizes companies in target industries (e-commerce, tech, SaaS, CPG, retail, travel, hospitality)
- **Lead Source Quality**: Higher scores for referrals, events, and website visits compared to cold outreach
- **Company Size Estimation**: Additional points for identifiable company size indicators

### Implicit Data (Interest/Intent) Factors:
- **Lead Status**: Points allocated based on position in the sales pipeline (Converted, Proposal, Qualified, etc.)
- **Lead Value**: Potential deal size contribution to the overall score
- **LinkedIn Data**: Analysis of LinkedIn profiles, URLs, and seniority indicators
- **Contact Information Quality**: Scores based on phone, location, and communications data
- **Recency of Contact**: Higher scores for recent interactions
- **Insights & Engagement**: Additional points for topics, interests, background information and notes
- **Email Domain Quality**: Business domains preferred over personal email addresses

The scoring system creates a balanced distribution across five quality tiers:
- Very Low (0-20): Leads unlikely to convert
- Low (21-40): Leads requiring significant nurturing
- Medium (41-60): Average leads with moderate conversion potential
- High (61-80): Quality leads showing strong engagement
- Very High (81-100): Excellent leads with high conversion potential

The dashboard visualization presents this distribution with color-coded segments for easy identification of lead quality distribution.

## Outreach Calendar

The outreach calendar feature:

- Automatically schedules contact with your highest-value leads
- Prioritizes the most promising leads for early-week outreach
- Distributes contacts throughout the week for effective follow-up
- Shows success probability based on lead relevance scores
- Updates in real-time as new leads are uploaded

## Lead Outreach Features

### Personalized Messaging Templates

The platform provides pre-written templates for different outreach scenarios:
- LinkedIn messages
- Email outreach
- Follow-up communications

Templates are automatically personalized with lead details including:
- Name
- Company
- Job title

### Audio Message Recording

New in this version, the outreach page now features audio message recording:

- Record personalized voice messages for leads
- Play back recordings to verify quality before sending
- Download audio messages in WAV format for sharing via other platforms
- Voice messages are proven to increase engagement by up to 3x compared to text-only outreach

## User Interface Highlights

The platform features a carefully designed UI that prioritizes both aesthetics and usability:

### Dashboard Layout
- Clean, modern interface with intuitive navigation
- Card-based design with consistent styling and spacing
- Gradient backgrounds and subtle shadows for depth
- Clear visual hierarchy for easier information scanning

### Data Visualization
- Enhanced pie charts with improved color schemes and tooltips
- Interactive elements with subtle hover and active states
- Better loading states with animated indicators
- Informative empty states when no data is available

### Navigation & Controls
- Sidebar with clear active state indicators
- Consistent button and input styling throughout
- Prominently displayed action buttons
- Helpful context indicators and badges

### Tables & Lists
- Improved table design with better spacing and typography
- User avatars and visual indicators for lead status
- Consistent badge styling for statuses and categories
- Subtle hover effects for interactive elements

### Mobile Responsiveness
- Fully responsive design optimized for phones, tablets, and desktops
- Collapsible sidebar with smooth slide-in/out animation on mobile
- Adaptive table layouts that transform into card views on small screens
- Optimized touch targets for mobile interaction
- Context-sensitive UI that adapts to available screen space
- Improved navigation with hamburger menu on mobile devices
- Mobile-optimized data presentation with prioritized information

## Recent Updates

### Version 15.10.0
- Enhanced PROPS lead scoring algorithm based on industry best practices
- Implemented sophisticated scoring with both explicit (fit) and implicit (engagement/intent) data
- Added LinkedIn data analysis to improve scoring precision
- Optimized score distribution for better lead qualification
- Redesigned pie chart visualization with improved color scheme and interactivity
- Added detailed tooltips with percentage information and lead quality descriptions
- Improved dashboard UI with clearer data representation
- Added center display of average score in the pie chart
- Added explanatory text about scoring criteria
- Enhanced visual appeal with improved color contrast and visual separation

### Version 15.9.0
- Improved mobile hamburger menu for better usability
- Enhanced sidebar navigation accessibility
- Improved content spacing for mobile and tablet views
- Optimized calendars for touch interaction on mobile devices
- Added proper spacing between sidebar and main content
- Fixed mobile UI inconsistencies for better user experience
- Added accessible ARIA attributes to interactive elements
- Standardized mobile UI patterns across all pages
- Rebranded from "CHROME" to "PROPS" throughout the app

### Version 15.8.0
- Implemented comprehensive mobile responsiveness across all app components
- Added collapsible sidebar navigation with touch-friendly controls
- Created responsive table-to-card transformations for small screens
- Enhanced touch targets and spacing for mobile interaction
- Added mobile-first layout adaptations that maintain complete functionality
- Optimized data presentation hierarchy for smaller screens
- Fixed layout issues across various device sizes and orientations

### Version 15.7.0
- Added robust lead management tools for database administration
- Implemented improved CSV upload with detailed progress tracking
- Enhanced lead deletion functionality with better feedback and reliability
- Added batch processing for large datasets with progress indicators
- Improved error handling for database operations
- Added dedicated Data Clear component for lead deletion
- Updated UI to provide better feedback during long-running operations
- Fixed cache issues to prevent stale data display
- Enhanced dashboard with more visible admin controls

### Version 15.6.0
- Completely redesigned UI for improved user experience
- Enhanced card layouts with better visual hierarchy and spacing
- Improved navigation with clearer active state indicators
- Updated color palette for better contrast and visual appeal
- Added subtle animations and transitions for better interactivity
- Improved data visualization components with better tooltips
- Enhanced table layouts with better spacing and typography
- Added avatar placeholders for leads in table views
- Implemented consistent badge styling throughout the application
- Improved loading and error states with better visual feedback

### Version 15.5.0
- Added audio message recording feature to lead outreach
- Improved lead detail pages with direct LinkedIn profile links
- Enhanced calendar navigation with clickable day headers
- Implemented Suspense boundaries for better loading states

### Version 15.4.0
- Added PROPS specialized scoring model
- Implemented outreach calendar for lead prioritization
- Fixed pie chart animation and sizing issues
- Reorganized dashboard to prioritize outreach calendar
- Updated documentation to reflect PROPS focus

### Version 15.3.0
- Fixed data upload functionality with improved error handling
- Added debug page for troubleshooting database connections
- Implemented batch processing for files of any size
- Removed restrictions on required fields (email no longer required)
- Added ability to download sample data templates
- Created database setup utilities for easier deployment

### Version 15.2.4
- Updated to Next.js 15.2.4
- Improved CSV upload with better error handling
- Added batch processing for large files
- Enhanced data validation and error reporting
- Fixed various type issues and improved TypeScript support

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
- Ensure your CSV file is properly formatted with headers
- Check that your file is UTF-8 encoded
- Try uploading smaller batches if experiencing timeout issues
- Try the sample CSV template available at `/sample-leads.csv`

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

#### Mobile Compatibility Issues
- Clear browser cache and reload if CSS doesn't appear correct
- Make sure you're using the latest version of your mobile browser
- Check that JavaScript is enabled on your mobile browser
- Some advanced features may have reduced functionality on older mobile devices 