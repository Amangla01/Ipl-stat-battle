# 🏏 IPL Stat Battle

A production-quality multiplayer IPL cricket card game. 2-6 players compare real IPL player statistics in real-time.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install & Seed
```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install

# Seed 30 IPL players into MongoDB
cd ../server && npm run seed
```

### 2. Start Servers
**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Or use the PowerShell launcher:
```powershell
.\start-dev.ps1
```

### 3. Play
Open **http://localhost:5173** in two+ browser tabs/devices.

---

## 🎮 How to Play

1. **Enter your name** on the home screen
2. **Create a room** or **Join** with a 6-character code
3. Wait for 2-6 players in the **Lobby**
4. Host clicks **Start Game**
5. Each round you receive a random IPL player card
6. The **current player** picks one stat to compare
7. All cards are **revealed simultaneously**
8. **Highest value wins** (except Economy & Bowling Average where lower wins)
9. Win a round = **+1 point**
10. After all cards dealt, **highest score wins**!

---

## 🃏 Players Included (30 IPL Stars)
Virat Kohli, MS Dhoni, Rohit Sharma, Jasprit Bumrah, Rashid Khan, KL Rahul, Suryakumar Yadav, Hardik Pandya, Ravindra Jadeja, Jos Buttler, David Warner, Rishabh Pant, Shubman Gill, Faf du Plessis, Yuzvendra Chahal, Sanju Samson, Pat Cummins, Ruturaj Gaikwad, Glenn Maxwell, Shreyas Iyer, Quinton de Kock, Axar Patel, Mohammad Siraj, Rinku Singh, Tilak Varma, Ishan Kishan, Mitchell Starc, T Natarajan, Devon Conway, Travis Head

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand |
| Backend | Node.js + Express |
| Realtime | Socket.IO |
| Database | MongoDB + Mongoose |

## 📁 Project Structure

```
Game/
├── server/               # Node.js backend
│   └── src/
│       ├── data/         # IPL player data + seeder
│       ├── models/       # MongoDB models
│       ├── gameEngine/   # Game logic, rooms, timers
│       ├── socket/       # Socket.IO event handlers
│       └── routes/       # REST API
└── client/               # React frontend
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Route pages
        ├── hooks/        # Socket hooks
        ├── store/        # Zustand state
        └── types/        # TypeScript types
```

## ⚡ Game Modes

- **Normal** – 15-second turns
- **Lightning** – 10-second turns (fast-paced!)
- **Daily Challenge** – Special daily card set

## 🎯 Stat Comparison Rules

| Higher wins | Lower wins |
|------------|-----------|
| Runs, Wickets, Matches | Economy |
| Highest Score, Average | Bowling Average |
| Strike Rate, 100s, 50s | |
| Sixes, Fours, Boundaries | |
