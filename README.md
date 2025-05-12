# Contact Scoring Platform

A modern contact analysis and scoring platform built with Next.js 15, React, TypeScript, and Supabase.

## Features

- 📊 Contact Scoring Dashboard
- 📈 Multi-dimensional Contact Scoring (Marketing Activity, Budget Potential, B2B/C2C Classification)
- **⏱️ Optimal Outreach Time Enrichment**: Automatically determines the best time to contact leads.
- **🎤 Audio Message Recording**: Record, play, and download personalized audio messages.
- **🤖 Heygen AI Video Integration**: Generate AI-powered podcast scripts and access Heygen tools directly.
- **✨ AI Message Customization**: Personalize outreach messages with AI-powered prompts.
- **🔮 Welcome Onboarding Modal**: First-time visitors receive guidance to the upload page.
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
- **🔮 Welcome Modal**: Guides new users to start by uploading leads for analysis.
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
```

4. Run the development server:
```bash
npm run dev
```

## Welcome Modal and First-Time Experience

The platform features an onboarding welcome modal for first-time visitors:

- **First Visit Detection**: The application tracks whether a user has visited before using localStorage.
- **Intuitive Guidance**: New users are presented with a modal that explains the platform's purpose and guides them to start by uploading leads.
- **Quick Start Guide**: The modal includes a step-by-step process to help users get value from the platform quickly.
- **Multiple Options**: Users can choose to either go directly to the upload page or explore the dashboard first.
- **Developer Tools**: For testing purposes, developers can use `window.resetFirstVisitFlag()` in the browser console to reset the first-visit state.

This feature ensures new users understand the intended workflow and helps them achieve success with the platform faster.

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
- No file size limit - large files are automatically processed in batches

### Data Processing

- All data rows will be processed
- Data is processed in batches for handling files of any size
- **Robust Parsing**: Improved error handling and delimiter detection for CSV uploads.
- Duplicate records are handled based on email uniqueness
- Contact scores (Marketing, Budget, Orientation) are automatically calculated upon retrieval
- **Automatic Enrichment**: Location, timezone, and optimal outreach times are determined during processing.

## Contact Scoring Model

The platform utilizes a multi-dimensional scoring system (0-100 where applicable) to analyze contacts based on available CSV data:

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

- **Context Preservation**: Properly formats messages and maintains signature placement
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

### [Unreleased] - YYYY-MM-DD
- **Features**:
    - Added AI Message Customization for personalized outreach with prompt-based message generation.
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