# Baliadanga High School Hub

A modern web application for managing school information, built with React, TypeScript, and shadcn/ui.

## 📚 Project Overview

This project serves as a comprehensive school management system with both public-facing pages and an admin dashboard.

### 🎯 Key Features

- Student & Staff Management
- Course Catalog
- Event Announcements
- Resource Library
- Protected Admin Dashboard
- Responsive Design

## 🛠 Tech Stack

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v6
- **State Management:** React Context
- **Icons:** Lucide React
- **Building:** Vite
- **Component Library:** Custom components with shadcn/ui

## 🏗 Project Structure

```
baliadanga-high-hub/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   └── admin/       # Admin dashboard components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── types/          # TypeScript types
├── public/             # Static assets
├── components.json     # shadcn/ui configuration
└── tailwind.config.ts # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

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

## 🔐 Authentication

The admin panel is protected by authentication:

```typescript
username: "admin"
password: "bali2025"
```

## 🎨 Component Configuration

The project uses shadcn/ui with custom configuration:

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

## 📁 Key Components

### Layout Components

- `Header.tsx`: Main navigation header
- `Footer.tsx`: Site footer with contact information
- `Layout.tsx`: Main layout wrapper

### Admin Components

- `Dashboard.tsx`: Admin dashboard overview
- `StaffManagement.tsx`: Staff CRUD operations
- `AnnouncementEditor.tsx`: Announcement management

### Public Pages

- `Home.tsx`: Landing page
- `Staff.tsx`: Staff directory
- `Courses.tsx`: Course catalog
- `Events.tsx`: School events and announcements

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contact

- School Email: info@baliadangahs.edu
- Admin Support: admin@baliadangahs.edu
