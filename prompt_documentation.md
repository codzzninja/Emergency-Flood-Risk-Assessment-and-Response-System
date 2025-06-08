# 🧠 AI Prompt Engineering 

# Documentation: Emergency Flood Response System (React + Node.js)

This document captures all the AI-assisted prompts used during the development of the Emergency Flood Risk Assessment and Response System built with React.js (frontend) and Node.js + Express.js (backend). It demonstrates prompt clarity, alignment with project needs, and iterative improvements made throughout development.

# 🏗️ System Architecture Prompts

# 1. Initial System Design

`Prompt:`
Design a scalable emergency flood response system for a district-level deployment. It must:

Handle real-time incident reporting

Integrate GIS mapping of alert zones

Allow multi-role access (responders, coordinators, officials, admin)

Enable rescue unit coordination

Be built with React.js frontend and Node.js + Express backend

Use MongoDB for storage and Leaflet for mapping

Suggest a layered architecture with technology stack choices, directory structure, and performance recommendations.

`AI Response Highlights:`

Proposed a 3-tier architecture (presentation, logic, data)

Suggested modular folders: /routes, /controllers, /services, /models

Recommended JWT-based RBAC

Suggested using mongoose for ODM and react-leaflet for maps

# 🧩 Database Schema Design

# 2. Schema Modelling

`Prompt:`
Design MongoDB schemas for:

Users with roles and login credentials

Incidents with geo-coordinates, title, description, severity, and status

Rescue Units with availability, assignment, and location

Flood Zones with alert level (red, orange, green) and boundaries

Include Mongoose model syntax and indexing suggestions for queries.

`AI Response Highlights:`

Added 2dsphere index on coordinates for spatial queries

Defined ref relationships between Incidents and Users

Included validation and timestamps for each model

# 🔧 Backend Development Prompts

# 3. Express.js API Structure

`Prompt:`
Structure a Node.js + Express.js backend for the above flood response system:

Include routes, controllers, middleware, models

Add JWT authentication, input validation, and error handling

Enable secure API routes for each role

Generate example route and controller for reporting an incident.

`AI Response Highlights:`

Created authMiddleware.js, errorHandler.js, incidentController.js

Sample POST /api/incidents with validation

Modular use of Express Router

# 4. GIS Spatial Queries

`Prompt:`
Implement backend spatial filtering:

Find all incidents within a specified flood zone boundary

Use MongoDB geospatial operators with coordinates

Return filtered incidents based on current alert level

`AI Response Highlights:`

Used $geoWithin and $geometry operators

Suggested adding 2dsphere index on incident coordinates

Output GeoJSON-compatible incident data

# 🌐 Frontend Development Prompts

# 5. React Component Design

`Prompt:`
Design React components for managing and visualizing incidents:

Responsive dashboard layout

Search, filter, sort, and pagination

Interactive map with Leaflet

Role-based conditional rendering

Suggest component hierarchy and folder structure.

`AI Response Highlights:`

Split components: IncidentTable, MapView, Filters, IncidentForm

Suggested hooks for state/data: useIncidents, useAuth

Used Tailwind CSS for clean layout

# 6. Map Integration with Leaflet

`Prompt:`
Integrate react-leaflet to:

Display incidents as markers

Show alert zones with red/orange/green polygons

Provide popups with incident info

Support click-to-zoom and filter by zone

`AI Response Highlights:`

Used <Marker>, <Popup>, <Polygon> components

Dynamic rendering of alert zone layers

Suggested map state management via context

# 📦 State & Real-Time Management

# 7. State Synchronization

`Prompt:`
Synchronize incident state between backend and frontend:

Use axios for API communication

Keep incident list updated in real-time

Support optimistic UI for status change

`AI Response Highlights:`

Suggested centralized context for incident state

Implemented useEffect + setInterval for polling

Optimistic update example with rollback on failure

# 8. Export to Excel

`Prompt:`
Enable filtered incident data export to .xlsx:

Use xlsx and file-saver

Map only selected fields to sheet

Clean header titles and exclude undefined fields

`AI Response Highlights:`

Used XLSX.utils.json_to_sheet

Created blob and triggered download

Renamed headers (e.g., title -> Title)

# 🔐 Security & Validation Prompts

# 9. Authentication

`Prompt:`
Implement login with role-based access control:

JWT authentication middleware

bcrypt for password hashing

Role check middleware (isAdmin, isResponder, etc.)

`AI Response Highlights:`

JWT issued on login with embedded role

Middleware verifies role per route

Example user model with hashed password

# 10. Validation & Error Handling

`Prompt:`
Add validation to all forms and inputs:

Backend with express-validator

Frontend with input constraints and helper messages

Centralized error display on frontend

`AI Response Highlights:`

Validated required fields, formats, lengths

Created reusable ErrorMessage component in frontend

Central error handler in backend for all routes

# 🧠 Summary & Reflections

# Top Prompting Strategies

Clear scope + tools: Asking specifically for React + Node resulted in highly relevant code.

Follow-up refinements: Iterative prompting helped perfect complex GIS components.

Domain context: Mentioning flood zones and responders improved map-based logic generation.

# Outcome

The AI-assisted prompts helped:

Speed up boilerplate setup and spatial logic development

Maintain production-ready quality

Focus my effort on business logic and UX details

# 📌 This document serves as an audit trail of my prompt engineering process and demonstrates a methodical, original, and effective use of AI in critical system development.
