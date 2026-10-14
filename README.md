# 🎵 Sound Sync — Connect to your surroundings

> **Ultra-Low Latency WiFi Audio Relay & Streamer across Devices**  
> Stream tab audio, system sound, microphone, and music between computers, phones, and tablets over your local Wi-Fi network with pristine 48kHz stereo fidelity and sub-20ms latency.

---

## ✨ Features

- **🌐 WiFi Peer-to-Peer & Relay**: Connect devices directly over local Wi-Fi without cables, Bluetooth range limits, or extra hardware.
- **⚡ Ultra-Low Latency (~10-25ms)**: Uses high-speed WebRTC Opus audio streaming with dynamic jitter buffers for real-time synchronization.
- **🌊 Skiper12-Inspired Liquid Hero**:
  - Interactive WebGL/Three.js fluid morphing simulation inspired by `@skiper-ui/skiper12` (Vercel Liquid simulation).
  - **Center Vercel triangle removed and replaced with an animated Music Equalizer Lines symbol** that pulses dynamically.
- **🎨 3 Handcrafted Luxury Themes**:
  1. **Ivory** — Warm minimalist cream, ivory gold accents, and antique paper elegance.
  2. **Gold** — Deep metallic obsidian backdrop with radiant amber & pure burnished gold.
  3. **Deep Atlas Navy** — High-tech oceanic atlas navy (`#070F1E`) with gold trim and neon cyan audio waves.
- **📱 Instant Mobile QR Scanner**:
  - Automatically detects host local Wi-Fi IP address (e.g. `10.0.244.3` or `192.168.1.X`).
  - Generates a 1-click scannable QR code for phones and tablets.
- **🎙️ Multiple Audio Sources**:
  - **Tab / Screen Audio**: Project YouTube, Netflix, Spotify, DAW, or game audio with 1 click.
  - **Microphone / Line-In**: Broadcast voice or instruments wirelessly.
  - **Local Audio File Player**: Stream MP3, WAV, FLAC, and AAC files synchronously.
  - **Sync Latency Test Tone**: Rhythmic 880Hz test blips to physically verify audio sync.
- **📊 Real-Time Spectrum Analyzer & VU Meter**:
  - HTML5 canvas audio visualizer with frequency bars and oscilloscope.
- **👥 Created by VIK-V-VKS (sharp & rythamic)**:
  - Interactive creator hover tooltip easter egg in the sidebar:
    - **V** — Vikash
    - **I** — Ishitwa
    - **K** — Kowshik
    - **V** — Vardhan
    - **V** — Varshith
    - **K** — Karthik
    - **S** — Srinidhi

---

## 🚀 Quick Start (Local WiFi Usage)

### Prerequisites
- Node.js (v18 or higher recommended)
- Devices connected to the same Wi-Fi network

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Mode
```bash
npm run dev
```
This starts:
- The WebSocket & WebRTC signaling server on `http://localhost:3001` (and `http://<YOUR_LOCAL_IP>:3001`)
- The Vite frontend client on `http://localhost:5173`

### 3. Run Production Server
```bash
npm run build
npm start
```

---

## 🎧 How to Stream Audio across Devices

### A. Host Machine (e.g. Your Laptop or PC)
1. Open `http://localhost:3001` or `http://localhost:5173`.
2. Click **Share Audio (HOST)** in the sidebar or hero section.
3. Enter your **Name of the room** and **Name of the device**.
4. Click **"Share the audio (Tab / Screen) — Project to sound"**.
5. When the browser prompt opens, choose the tab or screen and **make sure to tick "Share audio"**.
6. A 6-character room code (e.g. `SYNC88`) and QR code will appear!

### B. Receiver Device (e.g. Your Mobile Phone or Second Laptop)
1. Ensure your phone is connected to the same Wi-Fi.
2. Either:
   - **Scan the QR Code** displayed on the host screen using your phone camera, OR
   - Open `http://<HOST-IP>:3001` in your mobile browser, navigate to **Connect your device (Listener)**, enter your device name, and input the 6-character room code.
3. Tap **"Connect"** (and "Tap to Start Sound" if prompted by your browser).
4. Audio plays in real-time through your phone speaker or connected headphones!

---

## 📦 How to Push to GitHub

Run the following commands in your terminal:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files
git add .

# 3. Create your first commit
git commit -m "Initial commit: Sound Sync - WiFi Audio Relay with Skiper12 liquid simulation"

# 4. Link your GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/sound-sync.git

# 5. Push to GitHub
git push -u origin main
```

---

## ☁️ Deployment Guide

### Deploying to Render.com (Free)
1. Go to [Render.com](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Click **Create Web Service**. Your app is live with WebSocket support!

### Deploying to Railway.app
1. Go to [Railway.app](https://railway.app) and create a new project from your GitHub repo.
2. Railway automatically detects `package.json` and runs `npm run build` and `npm start`.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Three.js WebGL Liquid Simulation Shader
- **Backend**: Node.js, Express, Socket.IO, WebRTC (STUN / P2P Opus 48kHz)
- **Audio API**: Web Audio API (`AudioContext`, `AnalyserNode`, `MediaStreamDestination`, `GainNode`)
- **Themes**: CSS variables supporting Ivory, Gold, and Deep Atlas Navy

---

## 📜 Authors & Credits

Crafted by **VIK-V-VKS (sharp & rythamic)**:
- **V** — Vikash *(System Architecture)*
- **I** — Ishitwa *(DSP Engineering)*
- **K** — Kowshik *(Network Protocol)*
- **V** — Vardhan *(Full-Stack Developer)*
- **V** — Varshith *(UI/UX Design)*
- **K** — Karthik *(Audio Streaming)*
- **S** — Srinidhi *(Performance Optimization)*
