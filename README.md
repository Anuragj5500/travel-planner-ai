# 🌍 TravelAI - Intelligent Travel Planner

![TravelAI Demo](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop)
**TravelAI** is a full-stack web application that generates personalized, day-by-day travel itineraries using the power of advanced generative AI. It features a modern, glassmorphic UI, dynamic image generation, and secure authentication.

🔗 **Live Demo:** [Insert your Vercel Link Here]

---

## ✨ Features

* **🤖 AI-Powered Itineraries:** Generates detailed daily plans including timing, activities, and budget breakdowns using advanced AI models.
* **🎨 Dynamic Visuals:** Instantly generates cinematic, location-specific images for every activity using Pollinations AI.
* **🔐 Secure Authentication:** Google Sign-In integration via Firebase Authentication.
* **💾 Trip History:** Automatically saves generated trips to your local history for easy access.
* **🎲 Explore Mode:** "Surprise Me" feature that suggests trending luxury destinations.
* **📱 Fully Responsive:** immersive, edge-to-edge design optimized for 4K monitors and mobile devices.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Auth:** Firebase SDK

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **AI Model:** OpenAI GPT-5 (via OpenAI API)
* **CORS:** Enabled for secure cross-origin requests

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### **1. Clone the Repository**
```bash
git clone [https://github.com/YOUR_USERNAME/travel-planner-ai.git](https://github.com/YOUR_USERNAME/travel-planner-ai.git)
cd travel-planner-ai

```

### **2. Setup Backend (Server)**

Navigate to the server folder and install dependencies:

```bash
cd server
npm install

```

Create a `.env` file in the `server` directory:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here

```

Start the server:

```bash
node index.js

```

### **3. Setup Frontend (Client)**

Open a new terminal, navigate to the client folder, and install dependencies:

```bash
cd client
npm install

```

Create a `.env` file in the `client` directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```

Start the frontend:

```bash
npm run dev

```

---

## 📂 Project Structure

```text
travel-planner-ai/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── App.jsx         # Main Application Logic
│   │   ├── firebase.js     # Auth Configuration
│   │   └── main.jsx        # Entry Point
│   └── .env                # Frontend Secrets (Firebase)
│
├── server/                 # Node.js Backend
│   ├── index.js            # API Routes & AI Logic
│   └── .env                # Backend Secrets (OpenAI Key)
│
└── README.md               # Documentation

```

```
