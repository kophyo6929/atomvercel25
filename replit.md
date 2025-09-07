# Overview

This is a full-stack web application called "New Atom Point Web" - a digital marketplace for purchasing telecommunications products and services. The application allows users to buy mobile recharge cards, data packages, call minutes, and other telecom products from various operators (ATOM, MYTEL, OOREDOO) using a credit-based system. It features user authentication, order management, credit purchasing with payment proof uploads, and comprehensive admin functionality for managing products, users, and orders.

# Recent Changes

## September 2025 - Replit Environment Setup & Production Ready
- **Project Import**: Successfully imported from GitHub and configured for Replit environment
- **Database Setup**: Configured PostgreSQL database with automated migrations
- **Development Environment**: Both frontend (port 5000) and backend (port 3001) running with proper host configurations  
- **Admin Setup**: Admin account configured with username `tw` and password `Kp@883249943`
- **Product Database**: All 32 products from 4 operators (ATOM, MYTEL, OOREDOO, MPT) populated in database
- **API Testing**: All endpoints working correctly, authentication validated
- **Vercel Deployment**: Ready for deployment with vercel.json configuration
- **CORS Configuration**: Updated backend to allow Replit domain access
- **WebSocket Fix**: Resolved frontend HMR connection issues

## January 2025 - Professional UI & Database Fixes
- **Product Database**: Fixed critical product ID mismatch - populated database with 32 correct products matching frontend expectations
- **Product Purchases**: All operators (ATOM, MYTEL, OOREDOO, MPT) now work correctly with exact product IDs from data.ts
- **Professional UI Upgrade**: Transformed amateur emoji-based refresh system to enterprise-level design:
  - Admin panel refresh controls: Professional SVG icons, stable layouts, smooth animations
  - User-side refresh controls: Applied same professional standards to My Orders view
  - Zero layout shifting with fixed-width containers and professional CSS architecture
- **Rate Limiting**: Upgraded to enterprise configuration (200 requests/minute) with smart error handling
- **Backend Stability**: Resolved server crashes and port conflicts for production-ready deployment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 19 with TypeScript, using Vite as the build tool
- **State Management**: Custom persistent state hooks with localStorage and BroadcastChannel for cross-tab synchronization
- **Routing**: Component-based view management with state-driven navigation
- **Styling**: Custom CSS with CSS variables for theming, responsive design
- **Internationalization**: Custom i18n context supporting English and Myanmar languages
- **Components**: Modular component architecture with shared UI components
- **File Upload**: Base64 encoding for payment proof images with preview functionality
- **Notifications**: Custom toast notification system with context provider

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Prisma ORM with PostgreSQL (includes fallback data when database unavailable)
- **Authentication**: JWT tokens stored in HTTP-only cookies with middleware-based auth
- **Security**: Helmet for security headers, CORS configuration, rate limiting, bcrypt for password hashing
- **File Handling**: Multer for file uploads, base64 image processing
- **Validation**: Express-validator for input validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Prisma ORM for schema management and queries
- **Fallback System**: In-memory fallback data when database is unavailable
- **Frontend Persistence**: localStorage for client-side data caching
- **Session Management**: JWT tokens with configurable expiration

## Authentication and Authorization
- **User Authentication**: Username/password with JWT token system
- **Password Security**: Bcrypt hashing with salt rounds
- **Role-Based Access**: Admin and regular user roles with middleware protection
- **Session Persistence**: HTTP-only cookies for secure token storage
- **Password Recovery**: Security amount-based password reset system
- **Account Management**: User banning, credit management, notification system

# External Dependencies

## Frontend Dependencies
- **React Ecosystem**: React 19, React DOM for UI framework
- **Development Tools**: Vite for bundling, TypeScript for type safety
- **Fonts**: Google Fonts (Inter) for typography

## Backend Dependencies
- **Core Framework**: Express.js for server framework
- **Database**: Prisma Client, PostgreSQL for data persistence
- **Security**: Helmet, CORS, express-rate-limit for security layers
- **Authentication**: JWT, bcrypt for auth and password hashing
- **Validation**: express-validator for input sanitization
- **Utilities**: cookie-parser, multer for request processing
- **Development**: tsx for TypeScript execution, TypeScript compiler

## Third-Party Services
- **Payment Integration**: Manual payment verification system for KPay and Wave Pay
- **File Storage**: Base64 encoded images stored in database
- **Admin Contact**: Telegram integration for customer support
- **AI Studio**: Deployment platform integration (as mentioned in README)