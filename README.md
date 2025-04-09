# Chrome Industries Lead Management Platform

A modern lead management platform built with Next.js 15, React, TypeScript, and Supabase, specialized for Chrome Industries lifestyle brand.

## Features

- 📊 Lead Analytics Dashboard
- 📈 Industry-Specific Lead Scoring
- 📥 CSV Data Import
- 📅 Chrome Industries Outreach Calendar
- 🎙️ Personalized Audio Messages
- 🔄 Real-time Updates
- 🌙 Dark Mode UI with Modern Design
- 🎨 Intuitive User Interface with Enhanced Visuals
- 📱 Responsive Design
- 📋 Clean Data Presentation with Improved Card Layouts

## Chrome Industries Focus

This platform is specifically designed to help Chrome Industries:

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
- Lead scores are automatically calculated based on Chrome Industries relevance
- Outreach calendar automatically prioritizes high-value leads

## Chrome Industries Scoring Model

Leads are scored on a 0-100 scale based on their relevance to Chrome Industries:

- **Industry Relevance**: Higher scores for fashion, apparel, cycling, and outdoor industries
- **Role Relevance**: Higher scores for marketing, creative, and product design roles
- **Decision Authority**: Higher scores for managers, directors, and executives
- **Lead Source Quality**: Higher scores for referrals, partners, and industry events
- **Sales Pipeline Status**: Higher scores for leads further along in the pipeline

The dashboard automatically sorts leads by their Chrome Industries relevance score.

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

## Recent Updates

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
- Added Chrome Industries specialized scoring model
- Implemented outreach calendar for lead prioritization
- Fixed pie chart animation and sizing issues
- Reorganized dashboard to prioritize outreach calendar
- Updated documentation to reflect Chrome Industries focus

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

### Common Issues and Solutions

#### CSV Upload Failures
- Ensure your CSV file is properly formatted with headers
- Check that your file is UTF-8 encoded
- Try uploading smaller batches if experiencing timeout issues
- Try the sample CSV template available at `/sample-leads.csv`

#### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Ensure that the leads table exists in your Supabase database
- Check if your IP is allowed in Supabase security settings
- Use the SQL schema from `/setup-database.sql` to recreate the table if needed

#### Duplicate Email Errors
- The system now properly handles duplicate emails by skipping them
- You can see counts of successful uploads vs. skipped duplicates in the console
- Each lead is identified by email, so duplicates are determined by matching emails 