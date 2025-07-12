# DriveBuddy - Fleet Management System

## Overview

DriveBuddy is a client-side fleet management web application designed to manage drivers, trips, and payments for a transportation service. The application provides role-based access control with different user types (admin, executive, manager, finance, driver) and comprehensive fleet management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Architecture Pattern**: Single Page Application (SPA) with client-side routing
- **Styling**: Custom CSS with Font Awesome icons for UI elements
- **State Management**: In-memory JavaScript objects with localStorage for session persistence

### Data Storage
- **Primary Storage**: JSON files for static data (users.json, drivers.json, trips.json, payments.json)
- **Session Storage**: localStorage for user authentication state
- **Data Access**: Fetch API for loading JSON files asynchronously

### Authentication System
- **Method**: Simple mobile number and password authentication
- **Session Management**: localStorage-based session persistence
- **Role-based Access**: Five user roles with different permissions:
  - Admin: Full system access
  - Executive: Trip and driver management
  - Manager: Reporting and oversight
  - Finance: Payment management
  - Driver: Personal trip viewing

## Key Components

### 1. Authentication Module
- Login form with mobile number and password validation
- Session management using localStorage
- Role-based dashboard access control

### 2. User Management
- Pre-defined user accounts with different roles
- User data stored in users.json with encrypted passwords
- Role-based feature access control

### 3. Driver Management
- Driver registration and profile management
- Driver data includes personal details and license information
- Tracking of who added each driver and when

### 4. Trip Management
- Trip booking with multiple options:
  - In-station vs out-station trips
  - Round-trip vs one-way routes
  - Vehicle type selection (automatic/manual)
  - Transmission type (sedan/suv/luxury)
- Trip status tracking (active, in-progress, completed)
- Trip ID generation with "DVBDY" prefix

### 5. Payment System
- Payment tracking linked to trips and drivers
- Payment status management (paid/pending)
- Payment amount and description tracking
- Audit trail for payment processors

### 6. Navigation System
- Sidebar navigation with role-based menu items
- Single-page application with JavaScript-based page switching
- Responsive design for different screen sizes

## Data Flow

### Authentication Flow
1. User enters mobile number and password
2. System validates credentials against users.json
3. Successful login stores user data in localStorage
4. Dashboard loads with role-appropriate navigation

### Trip Management Flow
1. User creates trip with required details
2. System generates unique trip ID
3. Trip data stored in memory and synced with JSON
4. Trip status updated through lifecycle
5. Payment records created and linked to completed trips

### Data Persistence
- All data changes are maintained in memory during session
- JSON files serve as initial data source
- No real-time database synchronization (client-side only)

## External Dependencies

### CDN Dependencies
- **Font Awesome 6.0.0**: Icon library for UI elements
- **Source**: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css

### Browser APIs
- **Fetch API**: For loading JSON data files
- **localStorage**: For session management and data persistence
- **DOM API**: For dynamic content manipulation

## Deployment Strategy

### Current Setup
- **Type**: Static web application
- **Hosting**: Can be deployed on any static hosting service
- **Requirements**: Web server to serve static files and handle JSON file requests

### File Structure
```
/
├── index.html          # Main application entry point
├── style.css           # Application styling
├── script.js           # Application logic
├── users.json          # User account data
├── drivers.json        # Driver information
├── trips.json          # Trip records
└── payments.json       # Payment records
```

### Deployment Considerations
- All data is client-side, no server-side processing required
- JSON files must be accessible via HTTP requests
- CORS considerations for local development vs production
- No database setup required for basic functionality

### Future Enhancements
- Backend API integration for real-time data persistence
- Database migration from JSON files to proper database
- Real-time updates and notifications
- Mobile app development using the same data structure

## Technical Decisions

### Why Client-Side Only?
- **Rapid Prototyping**: Quick setup without backend infrastructure
- **Simplicity**: No server management or database setup required
- **Demonstration**: Perfect for showcasing application flow and UI/UX

### Why JSON Files?
- **Simplicity**: Easy to understand and modify data structure
- **Flexibility**: Quick iterations on data schema
- **Portability**: Easy to migrate to proper database later

### Why Vanilla JavaScript?
- **Performance**: No framework overhead
- **Learning**: Clear understanding of core web technologies
- **Flexibility**: Easy to integrate with any future framework