# FutureLex - Current State

**Last Updated:** 2026-03-09
**Status:** Active Development
**Priority:** Medium

## Active Decisions
- Vite 6 + React 19 + TypeScript 5.8
- Firebase 12 for auth and Firestore sync
- Local-first architecture: localStorage primary, Firebase sync in background
- Flashcard-based language learning with spaced repetition
- Framer Motion 11 for animations
- Flat project structure (no src/ directory)
- Futuristic dark UI theme

## Current Focus
- Language learning flashcard features
- Plan management and learning session flows

## Blockers
- None

## Recent Changes
- Core pages: Auth, Dashboard, FlashcardSession, PlanManager
- Firebase integration with local-first data pattern
- Language selector component
- Migration service for data schema updates

## Tech Debt
- No Tailwind CSS in dependencies (styling approach unclear - check index.css)
- No test framework
- test-scenario.md and test-toggle.js in root suggest manual testing approach
- Services layer has multiple data sources (firebase, localStorage, migration) that could be unified
