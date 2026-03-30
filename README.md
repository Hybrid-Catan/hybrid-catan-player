# hybrid-catan-client

### Description
The **Hybrid Catan Client** is a real-time web application that allows players to interact with the game, view their resources, perform actions, and visualize the evolving board state. It connects to the backend server via WebSockets to ensure all players are synchronized instantly.

Players use this interface to:
* **Join and manage** game sessions.
* **View resources** and current game status.
* **Perform actions** such as rolling dice, building, trading, and moving the robber.
* **Receive real-time updates** and visual feedback for all game events.

---

### Features
* **Real-time multiplayer interface**
* **Live resource tracking**
* **Dice roll interaction**
* **Build actions** (roads, settlements, cities)
* **Instant synchronization** via WebSockets
* **Animated visual feedback**

---

### Tech Stack
* **Frontend:** React
* **Real-time Communication:** Socket.IO Client
* **Rendering (optional):** Canvas / SVG / Three.js

---

### Project Structure
```text
src/
├── components/      # Reusable UI components
├── pages/           # Screens (Lobby, Game)
├── hooks/           # Custom hooks (e.g., WebSocket)
├── services/        # API + socket logic
├── state/           # Global state management
└── utils/           # Helper functions
```

---

### Getting Started
1. Install dependencies
```npm install```
2. Run the development server
```npm run dev```

---

### Authors
* Pratul Wadhwa [@PratulW5](https://github.com/PratulW5)

---

### 📄 License
This project is developed for academic purposes as part of the **DECO3801** course at **The University of Queensland**.
