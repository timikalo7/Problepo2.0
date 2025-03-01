# Problepo - Comprehensive Prediction Platform

A data-driven prediction platform that offers forecasting for financial markets, sports, entertainment, global events, and more.

## Features

- Prediction requests for multiple categories:
  - Finance & Markets
  - Sports & Competitions
  - Entertainment & Media
  - Global Events & Politics
  - Environment & Climate
  - Technology & Science
- Detailed prediction results including:
  - Confidence levels
  - Supporting data points
  - Variables that could affect outcomes
  - Historical patterns
  - Alternative scenarios
- Interactive orb visualization with category-specific themes
- Responsive design for all devices

## Tech Stack

- React with TypeScript
- Express.js backend
- Framer Motion for animations
- Tailwind CSS for styling
- Natural language processing for analysis

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Application

Start both the frontend and backend servers:

```bash
# Start the backend server
npm run server

# In a separate terminal, start the frontend dev server
npm run dev
```

## How It Works

1. Enter a prediction topic in the search box
2. (Optional) Add additional details like category, timeframe, and context
3. The prediction orb will animate while analyzing data
4. View the comprehensive prediction results, including confidence levels, supporting data, and alternative scenarios

## API Endpoints

- `POST /api/predict`: Generates predictions for any topic
- `POST /api/analyze`: Legacy endpoint for financial sentiment analysis

## License

MIT