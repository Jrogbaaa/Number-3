# Changelog

All notable changes to the PROPS Lead Management Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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