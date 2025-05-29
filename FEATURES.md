# PROPS Application Features

## Core Features

### Lead Management
- Import and manage leads from various sources
- Organize leads by campaign and status
- Track lead interactions and communication history

### Scoring Tutorial System
- **Interactive Learning Experience**: Comprehensive tutorial explaining AI-powered lead scoring methodology
- **Company-Specific Personalization**: Content adapts to user's company name and targeting preferences
- **Smart Timing**: Appears after first uploads or settings resets, never during onboarding
- **Multi-Dimensional Education**: Explains Intent Score, Company Focus, and Engagement Potential
- **Actionable Pro Tips**: Personalized recommendations based on user's business model
- **Mobile-Responsive Design**: Optimized experience across all devices
- **Persistent State Management**: Tutorial completion tracked across sessions
- **Test Functions**: Built-in utilities for development testing

### Data Upload
- Upload CSV files with lead information
- Map CSV columns to database fields
- Validate data before importing

### User Authentication
- Secure login and session management
- Role-based access control
- Password recovery functionality

### Database Connectivity
- Robust connection management with automatic retry logic
- Exponential backoff for failed database operations
- Fallback to mock data during connection issues
- Comprehensive error logging and tracking

### Lead Scoring and Visualization
- Multi-dimensional scoring system (Marketing, Budget, Intent, Spend Authority)
- "Best Overall" adaptive scoring based on user's business priorities
- Customizable table columns that reflect user preferences
- Visual score explanations with interactive tooltips
- Score calculation that considers:
  - Role alignment with target profiles
  - Industry matches with preferred sectors
  - Company size and structure compatibility
  - Decision-maker identification and authority level
  - B2B vs B2C business orientation

## New Features

### AI-Powered Message Generation
- Customizable outreach message generation using AI
- Personalized content based on lead data (name, company, title, etc.)
- Prompt customization options:
  - Conversational tone
  - Formal tone
  - Add urgency
  - Make it shorter
  - Make it longer
  - Custom prompts

### Replicate API Integration
- Secure AI model access via server-side API
- Environment variable configuration for API keys
- Advanced text generation capabilities

### User Onboarding Flow
- Interactive onboarding wizard for new users
- Company profile and target audience collection
- Website and LinkedIn context scraping for enhanced lead scoring
- Customized lead scoring based on user preferences:
  - Industry focus (e.g., tech, healthcare, education)
  - Target customer role prioritization (e.g., marketing executives, founders)
  - Gender preferences and demographic targeting
  - Company size and budget potential parameters
- Empty dashboard state with guided setup process
- Persistent user preferences that influence lead scoring algorithm
- Ability to modify preferences after initial setup

### Website Context Analysis
- Automated website content scraping using Firecrawl API
- LinkedIn company page information collection (manual input due to platform restrictions)
- Business context extraction for improved lead scoring accuracy
- Company messaging and positioning analysis
- Enhanced lead scoring based on website content and business model
- Optional step in onboarding process with significant scoring benefits

## Upcoming Features

### Message Templates
- Save and reuse successful message formats
- A/B testing for message effectiveness
- Analytics on message performance

### Campaign Automation
- Schedule message sending
- Follow-up sequence automation
- Engagement tracking

## Technical Implementation

### Environment Setup
- Configure Replicate API integration by adding `REPLICATE_API_KEY` to `.env.local` file
- Configure Firecrawl API integration by adding `FIRECRAWL_API_KEY` to `.env.local` file
- Ensure API keys are properly secured and never committed to version control
- Verify Supabase URL format (must contain "bog" not "boq" in the subdomain)

### Security Considerations
- All API calls to AI services are made server-side
- Sensitive information is never exposed to client-side code
- Environment variables are used for all credentials and API keys
- Database tables secured with proper Row Level Security policies

# OptiLeads.ai Features

## 🎯 **Lead Scoring & Analytics**

### **Unified AI-Powered Scoring System**
- **Best Overall Score**: Comprehensive lead evaluation using multiple factors
  - Intent signals (40-80 range)
  - Spend authority assessment (25-85 range)  
  - Marketing fit analysis
  - Budget potential evaluation
- **Consistent Scoring**: Same algorithm used across dashboard and outreach calendar
- **User Preference Integration**: Scores adapt based on target roles, industries, and company sizes
- **Deterministic Results**: Stable, reproducible scoring for reliable lead prioritization

### **Multi-Dimensional Analysis**
- **Intent Score**: Evaluates likelihood of purchase intent
- **Spend Authority**: Assesses decision-making power and budget control
- **Marketing Score**: Measures fit with marketing tools and solutions
- **Budget Potential**: Estimates available budget for solutions 