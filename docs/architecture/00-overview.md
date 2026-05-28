# Daemi Architecture Overview

Daemi is a private shared scrapbook for long-distance couples. The product is mobile-first and focuses on creating, saving, organizing, and revisiting memories between two partners.

## Product Goal

Create a warm, private, emotionally durable space where two people can save photos, videos, letters, and tickets into a shared relationship timeline.

Daemi is not:

- a social feed
- a public profile
- a chat app
- a CRUD dashboard
- a Locket clone in v1

## Core MVP Loop

1. User signs in.
2. User creates or joins a couple space.
3. User adds a memory.
4. Memory appears on the shared timeline.
5. Partner can view the same memory.
6. Both partners can revisit memories through timeline, search, tags, and later collections.

## MVP Scope

MVP 0.1 includes:

- Auth
- Couple space
- Invite code flow
- Timeline day view
- Photo memories
- Letter memories
- Memory detail
- Basic tags
- Basic search
- Supabase media upload

Deferred:

- Video memories
- Ticket memories
- Collections
- Places browse
- Timeline month/year zoom
- Offline queue
- Advanced animation
- Notifications
- AI organization

## Architecture Principles

- Mobile-first.
- Couple-space scoped data.
- Privacy-first via Row Level Security.
- Simple relational data model.
- Build the emotional loop before advanced organization.
- Keep memory types extensible.
- Use shared primitives for all composers and detail screens.
