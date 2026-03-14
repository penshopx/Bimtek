# Context: BimtekKita - Construction Training Platform

## Current State
Complete construction training platform with AI chatbot system built and deployed.

## Recently Completed
- [x] Navbar with all navigation routes (responsive mobile support)
- [x] Landing page with 9 feature cards and stats
- [x] Knowledge Base - 16+ expandable articles
- [x] BIMTEK - 67 modules with PKB tracker, localStorage
- [x] BIMTEK Detail - Lesson progress, AI learning companion chatbot
- [x] Quiz - 65+ questions across 13 categories
- [x] Solver - 6 calculation templates (beam, column, foundation, concrete mix, earthwork, ramp)
- [x] Tools - RAB calculator & Mix Design calculator
- [x] Matrix - Interactive subklasifikasi & job position connections
- [x] Sertifikasi - 36+ positions (334 in database)
- [x] Certify - 5-step guide with requirements table
- [x] Chat - AI Orchestrator with 8 Expert Agents & Toolboxes
- [x] Learning Companion - Per-module AI mentor chatbot
- [x] Dark Mode - Toggle di navbar, persist di localStorage
- [x] Profile Dashboard - Progress tracking, achievements, favorit
- [x] Global Search - Cmd+K shortcut, 25+ items indexed
- [x] PWA Support - Manifest, service worker, offline-ready
- [x] Push Notifications - Browser notifications, daily reminders
- [x] PDF Export - Print progress report to PDF
- [x] Learning Streak - Track consecutive learning days
- [x] Bookmarks - Save and organize favorite content
- [x] Keyboard Shortcuts - Reference page with key tester
- [x] Settings - Theme, data management, about
- [x] Dashboard - Comprehensive stats overview with personalized greeting
- [x] Activity Log - Track all user actions with filtering
- [x] Achievements - 14 unlockable achievements with progress tracking
- [x] Learning Calendar - Visualize daily learning activity
- [x] Bimtek Offline - Event system (ride-sharing style)
  - [x] OfflineEventProvider - Context with localStorage persistence
  - [x] /offline - Event listing with search & filters
  - [x] /offline/create - Create new event form
  - [x] /offline/[id] - Event detail & registration
  - [x] /offline/[id]/manage - Instructor event management
- [x] Backend Database - SQLite with Drizzle ORM
  - [x] Database schema (13 tables) for all features
  - [x] API route for offline events CRUD
  - [x] Hybrid localStorage + database approach (works offline)
- [x] Agentic AI Chatbot System
  - [x] AgenticAIProvider - Context with app knowledge
  - [x] /agentic-chat - Main AI agent page
  - [x] Knows all app features (20+ features)
  - [x] Can execute tasks (navigation, search)
  - [x] Provides smart suggestions
  - [x] AIMentor component - Per-module AI companion
  - [x] Category-specific responses (sipil, k3, manajemen, elektrikal)
- [x] Authentication System
  - [x] AuthProvider with session management
  - [x] /login - User login page
  - [x] /register - User registration page
  - [x] /api/auth - Auth API (login, register, logout, verify)
  - [x] Database tables: users, sessions, user_progress, user_quiz_scores
  - [x] Navbar shows login/register or user profile/logout
- [x] Admin System
  - [x] /admin - Admin dashboard
  - [x] User management (view, update role, delete)
  - [x] Role: user, instructor, admin
  - [x] System settings panel

## Architecture
- Next.js 16 with App Router
- TypeScript + Tailwind CSS 4
- Client-side state management with localStorage for progress tracking
- AI Chat system: Orchestrator → Expert Agents (8) → Toolbox (per expert)

## Tech Stack
- React 19, Next.js 16
- TypeScript, Tailwind CSS 4
- Bun package manager
- ESLint for code quality
- SQLite + Drizzle ORM for database

## Session History
| Date | Changes |
|------|---------|
| 2026-03-14 | Complete platform built - 13 pages, AI chatbot system, 65+ modules, 65+ quiz questions |
| 2026-03-14 | Added Bimtek Offline - Event system with 4 sample events, registration, attendance tracking, certificates |
| 2026-03-14 | Added SQLite database with Drizzle ORM - Schema for all features, API routes, hybrid localStorage fallback |
