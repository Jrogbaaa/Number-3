# Props - Lead Management Dashboard

A modern lead management dashboard built with Next.js, TypeScript, and TailwindCSS. The application helps track, analyze, and manage leads with features like lead scoring, content calendar, and AI-powered outreach tools.

## Features

### Dashboard
- Lead scoring and analysis
- Comprehensive leads table with sorting and filtering
- Weekly content calendar with success rate tracking
- Visual lead score distribution
- High-value leads tracking

### Data Input
- Drag-and-drop file upload
- Support for CSV and JSON formats
- Demo data generation
- Data format validation and guidelines
- Current dataset status tracking

### Outreach Tools
- AI-powered script generator
- Multiple script templates:
  - Lead Overview
  - Personalized Outreach
  - Source Performance Analysis
  - Lead Segmentation
- One-click copy and regenerate functionality
- Content calendar integration

### Heygen Integration
- AI Podcast Creation tool integration
- Heygen Studio for AI avatar videos
- Podcast script generator with multiple formats:
  - Interview Style
  - Discussion Format
  - Debate Format

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide Icons
- **State Management**: React Hooks
- **Data Visualization**: Custom components

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   ├── data-input/
│   ├── outreach/
│   └── heygen-integration/
├── components/
│   ├── LeadsTable.tsx
│   ├── ContentCalendar.tsx
│   └── layout/
├── types/
│   └── lead.ts
└── lib/
```

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Types

### Lead
\`\`\`typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  createdAt: string;
  lastContactedAt?: string;
}
\`\`\`

### Calendar Event
\`\`\`typescript
interface CalendarEvent {
  id: string;
  leadName: string;
  startTime: string;
  endTime: string;
  successRate: number;
}
\`\`\`

## Component Documentation

### LeadsTable
Displays lead information in a sortable table format with:
- Lead name and email
- Score visualization with star rating
- Source and status badges
- Lead value

### ContentCalendar
Shows weekly scheduled contacts with:
- Daily view for Monday through Friday
- Time slots with lead names
- Success rate visualization
- Best practice timing recommendations

### Data Input Form
Handles data import through:
- File upload with drag-and-drop
- Format selection (CSV/JSON)
- Demo data generation
- Format guidelines and validation

### Script Generator
Creates customized outreach scripts with:
- Multiple template options
- Data-driven insights
- One-click copy functionality
- Script regeneration

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 