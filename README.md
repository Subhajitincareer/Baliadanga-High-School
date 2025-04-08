# Baliadanga High School Hub

A comprehensive web application for managing school information, staff, and resources.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Components](#components)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- 🏫 School Information Management
- 👥 Staff Directory
- 📢 Announcements & Events
- 📚 Course Management
- 🔐 Admin Dashboard
- 📱 Responsive Design
- 🎨 Modern UI with shadcn-ui

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Routing**: React Router DOM
- **State Management**: React Context
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/baliadanga-high-hub.git

# Navigate to project directory
cd baliadanga-high-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
baliadanga-high-hub/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn-ui components
│   │   └── admin/         # Admin-specific components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json          # Project dependencies
```

## Authentication

The application uses a simple admin authentication system:

```typescript
// Default admin credentials
username: "admin"
password: "bali2025"
```

Protected routes require authentication through the AdminContext provider.

## Components

### Core Components

1. **Layout Component**
   - Main layout wrapper
   - Navigation menu
   - Footer

2. **Staff Directory**
   - Staff listing
   - Staff details
   - Category filtering

3. **Announcements**
   - Event announcements
   - School notices
   - PDF attachments

### Admin Components

1. **AdminDashboard**
   - Overview statistics
   - Quick actions
   - Recent activities

2. **StaffForm**
   - Add/Edit staff members
   - Image upload
   - Validation

## Admin Panel

Access the admin panel at `/admin/login`. Features include:

- Staff management
- Announcement creation
- Resource updates
- Event scheduling

### Protected Routes

```typescript
/admin/dashboard  // Main admin dashboard
/admin/staff      // Staff management
/admin/resources  // Resource management
```

## Development

### Running Tests

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

The application can be deployed using:

1. **Vercel**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

2. **Manual Deployment**
   ```bash
   npm run build
   # Deploy the dist folder to your hosting provider
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit changes
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@baliadangahs.edu or open an issue in the GitHub repository.
