# Emergency-Flood-Risk-Assessment-and-Response-System

A robust, full-stack web application designed to support emergency flood management operations for district governments and NGOs. This system provides a centralized platform for real-time incident reporting, GIS-based spatial analysis, rescue coordination, and multi-role collaboration.

# 🧭 Project Purpose

In response to heavy rainfall and flood alerts, E-FRARS serves as a rapid-deployment digital tool that enables:

Incident visibility across departments

Rescue team coordination

Role-specific action tracking

Geographic flood zone analysis (GIS)

Real-time reporting and communication

# 💡 Key Features

# 🎯 Incident Management

Log new incidents with title, description, coordinates, priority, and status

Edit status dynamically: Reported, Assigned, In-Progress, Resolved, Closed

Filter and sort based on priority, status, or title

Delete incidents (Official role only)

# 🌍 GIS Integration

Interactive map built with Leaflet

Incidents displayed as location markers

Red, Orange, Green alert zones visualized

Marker popups show incident metadata

Responsive map interaction with zoom and layer control

# 🧑‍🤝‍🧑 Role-Based Access Control

Field Responder: Report and update incidents

Coordinator: Track, filter, assign the commanders, update the Official notes, Team notes, Rescue steps taken, and Export the incidents

Official: Track, filter, Update the status, Assign the priorities, and Export the incidents


# 📤 Export & Reporting

Export filtered incidents to Excel (.xlsx)

Clean formatting and renamed headers

No empty or undefined columns

# 📱 Responsive UI

Built with React.js + Tailwind CSS

Mobile-compatible layout

Accessible forms and keyboard navigation

# 🛠️ Tech Stack

| Layer         | Technology                      |
|---------------|---------------------------------|
| Frontend      | React.js, Tailwind CSS          |
| Backend       | Node.js, Express.js             |
| Database      | MongoDB + Mongoose              |
| Map Layer     | Leaflet.js + OpenStreetMap      |
| Auth & RBAC   | JWT, bcrypt                     |
| Data Export   | SheetJS (xlsx), file-saver      |
| GIS Zones     | Static geo-boundaries + markers |


# ⚙️ Installation Guide

Prerequisites:

Node.js v16+

MongoDB (local or Atlas)

npm or yarn

# Backend Setup
cd backend

npm install

npm start

# Frontend Setup

cd frontend 

npm install

npm start

# Environment Configuration

Create a .env file in root:

# Frontend Environment Variables

REACT_APP_API_BASE=http://localhost:5000

# Backend Environment Variables (for server)

PORT=5000

MONGO_URI=mongodb://localhost:27017/trimble_emergency

JWT_SECRET=my-ultra-secret-key-123

# 🧪 Feature Testing

| Feature                   | Route/Component             | Description                            |
|---------------------------|------------------------------|----------------------------------------|
| Create Incident           | POST /api/incidents          | Responders can submit new data         |
| Fetch All Incidents       | GET /api/incidents           | Lists incidents for all roles          |
| Filter by Priority/Status | UI Filters + Query Params    | Filter data dynamically                |
| GIS Map Display           | `/viewincident` component    | Interactive map with zones and markers |
| Excel Export              | `Export` button              | Uses SheetJS to generate file          |

# 🧠 Development Principles

Modularized backend with routes/controllers/services

Reusable React components & hooks

Secure endpoints via middleware

Performance optimization with memoization and pagination

# 📚 Additional Files Included

`prompt_documentation.md`: Detailed list of prompts used with AI and rationale

`README.md`: Full system documentation

# 📬 Contact

Developer: K.A.Thaneesha

📧 Email: 22pt14@psgtech.ac.in

🔗 GitHub: github.com/codzzninja

# “Real-time decisions save lives. This system delivers insight when every second matters.”

© 2025 — Trimble Task Evaluation Submission. 
