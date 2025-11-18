# Goldstar Jewel Suite

A comprehensive billing, inventory management and reports application for jewelry shops built with React, TypeScript, and Tailwind CSS.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (PageHeader, Sidebar, etc.)
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── index.ts         # Component exports
├── features/            # Feature-based modules
│   ├── auth/           # Authentication feature
│   ├── dashboard/      # Dashboard feature
│   ├── products/       # Product management
│   ├── customers/      # Customer management
│   ├── inventory/      # Inventory management
│   ├── sales/          # Sales and billing
│   └── analytics/      # Analytics and reports
├── services/           # API and business logic services
│   ├── api.ts          # Base API service
│   ├── auth.ts         # Authentication service
│   └── index.ts        # Service exports
├── utils/              # Utility functions
│   ├── formatters.ts   # Data formatting utilities
│   ├── validators.ts   # Validation utilities
│   ├── helpers.ts      # General helper functions
│   └── index.ts        # Utility exports
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── lib/                # Third-party library configurations
```

## Features

- **Sales & Billing**: GST-compliant billing system with invoice generation
- **Inventory Management**: Real-time stock tracking with barcode system
- **Product Management**: Complete product catalog with tray management
- **Rate Management**: Dynamic pricing per gram for different purities
- **Customer Management**: Customer profiles and purchase history
- **Reports & Analytics**: Sales reports and business insights
- **Barcode System**: Generate and print product barcodes
- **Purchase Entry**: Vendor management and stock inward

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Routing**: React Router v6
- **State Management**: React hooks, Context API
- **API**: RESTful API with Strapi backend
- **Build Tool**: Vite with SWC

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd goldstar-jewel-suite

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Code Organization

### Components
- **Common Components**: Reusable UI components used across features
- **Feature Components**: Components specific to business features
- **UI Components**: Base design system components (shadcn/ui)

### Services
- **API Service**: Centralized HTTP client with authentication
- **Auth Service**: User authentication and session management
- **Feature Services**: Business logic for specific features

### Utils
- **Formatters**: Currency, date, and text formatting
- **Validators**: Form and business rule validation
- **Helpers**: General utility functions

### Types
- Comprehensive TypeScript definitions for type safety
- API response types and business entity types

## Best Practices

- **Feature-based architecture** for scalability
- **TypeScript** for type safety
- **Consistent naming conventions**
- **Centralized constants** and configuration
- **Reusable components** and utilities
- **Error handling** and loading states
- **Responsive design** with Tailwind CSS

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://jewelapi.sricashway.com
```

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch
```

## Deployment

```bash
# Build for production
npm run build:prod

# The dist/ folder contains the production build
```

## License

This project is proprietary software for Sri Cashway jewelry management.