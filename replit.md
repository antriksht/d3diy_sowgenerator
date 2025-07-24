# D3 Proposal Generator

## Overview

This is a React-based proposal generator application that allows users to create professional Statement of Work documents using AI assistance. The application features a tabbed interface for configuration, AI-powered section generation, and DOCX export functionality. It's designed to run entirely in the browser with no backend dependencies for proposal generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom D3 Alpha brand colors
- **State Management**: React hooks with local state and localStorage persistence
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for API state management

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Development**: Hot module replacement with Vite integration
- **Production**: Static file serving with Express

The backend is minimal and primarily serves the frontend application. The core proposal generation functionality runs entirely in the browser.

## Key Components

### Configuration System
- **Company Information**: Forms for both user company and client company details
- **Project Setup**: Title and service description configuration
- **Section Management**: Customizable list of proposal sections
- **Validation**: Zod-based schema validation for all configuration data

### AI Integration
- **Multi-Provider Support**: OpenAI GPT-4o and Google Gemini API integration
- **Browser-Based**: All AI API calls made directly from the frontend
- **Section Generation**: Individual section generation with contextual prompts
- **Error Handling**: Retry mechanisms and user-friendly error messages

### Document Management
- **Section Editor**: Individual section editing with status tracking
- **Progress Tracking**: Visual progress indicators for generation status
- **Export System**: DOCX generation using the docx library
- **Local Storage**: Automatic persistence of all data

### UI/UX Features
- **Tabbed Interface**: Clean navigation between configuration, generation, and settings
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Glass Morphism**: Modern glass-effect styling for cards and components
- **Status Indicators**: Real-time feedback for generation progress
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

1. **Configuration Phase**:
   - User inputs company and project information
   - Configuration is validated and stored in localStorage
   - Sections list is configured (with default values)

2. **Generation Phase**:
   - AI service generates content for each section individually
   - Section status is tracked (idle, generating, success, error, modified)
   - Generated content is immediately saved to localStorage

3. **Export Phase**:
   - All sections are compiled into a professional DOCX document
   - Document includes title page, table of contents, and formatted sections
   - File is downloaded directly to user's device

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for content generation
- **Google Gemini API**: Alternative AI provider option
- **Client-Side Integration**: Direct API calls from browser (requires CORS handling)

### Document Processing
- **docx Library**: Microsoft Word document generation
- **Browser-Based Export**: No server-side processing required

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management (minimal usage in this app)

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for fast development
- **Express Server**: Serves API routes and static files in development
- **Database**: PostgreSQL with Drizzle migrations
- **Environment Variables**: API keys and database connection strings

### Production Build
- **Static Generation**: Vite builds optimized static assets
- **Server Bundle**: esbuild packages Express server for production
- **Database Deployment**: Drizzle push for schema deployment
- **Asset Serving**: Express serves built static files

### Key Considerations
- **API Keys**: Can be provided by user or configured at deployment
- **CORS Configuration**: Required for direct AI API calls from browser
- **Database**: Optional for basic functionality (proposal generation works without backend)
- **Storage**: localStorage provides persistence without server dependency

The application is designed to work as a standalone frontend application with optional backend services for enhanced features like user management and proposal history.