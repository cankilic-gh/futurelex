# 🚀 FutureLex

**Master English with 3000 core words through gamified flashcard learning.** A futuristic, interactive language learning platform with glassmorphism aesthetics and real-time progress tracking.

[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Live Demo:** [futurelex.thegridbase.com](https://futurelex.thegridbase.com)

---

## ✨ Features

### 📚 Comprehensive Word Library
- **3000 Core Words** - Essential English vocabulary for effective learning
- **Level-Based System** - Progress through different difficulty levels
- **Organized Categories** - Words grouped by themes and usage
- **Smart Selection** - Adaptive word selection based on progress

### 🎮 Gamified Learning
- **Interactive Flashcards** - Beautiful, animated flashcard interface
- **Progress Tracking** - Real-time tracking of learned words
- **Achievement System** - Visual feedback for learning milestones
- **Session Management** - Track daily learning sessions

### 🎨 Modern Design
- **Glassmorphism UI** - Futuristic glass-like aesthetic
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Works seamlessly on all devices
- **Dark Theme** - Eye-friendly dark interface with neon accents

### 🔐 User Experience
- **Firebase Authentication** - Secure user accounts
- **Cloud Sync** - Progress saved across devices
- **Dashboard Analytics** - View learning statistics and progress
- **Session History** - Track your learning journey

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Firebase Project** - For authentication and data storage
- **Firebase API Key** - Get one at [Firebase Console](https://console.firebase.google.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cankilic-gh/futurelex.git
   cd futurelex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firebase**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Set up security rules for user data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
futurelex/
├── components/              # React components
│   ├── Flashcard/          # Flashcard components
│   │   └── Card.tsx        # Main flashcard component
│   ├── Layout/             # Layout components
│   │   ├── Background.tsx  # Animated background
│   │   └── Navbar.tsx      # Navigation bar
│   └── ui/                 # UI components
│       └── GlassButton.tsx # Glassmorphism button
├── pages/                   # Page components
│   ├── Auth.tsx            # Authentication page
│   ├── Dashboard.tsx       # User dashboard
│   ├── FlashcardSession.tsx # Learning session
│   └── LevelSelect.tsx     # Level selection
├── context/                 # React context
│   └── AuthContext.tsx     # Authentication context
├── services/                # Services
│   ├── data.ts             # Word data management
│   └── firebase.ts         # Firebase client setup
├── types.ts                 # TypeScript type definitions
└── App.tsx                  # Main application component
```

---

## 🛠 Tech Stack

### Frontend
- **Vite 6.2** - Next-generation build tool
- **React 19.2** - UI library
- **TypeScript 5.8** - Type safety
- **React Router DOM 6.22** - Client-side routing
- **Tailwind CSS 3.3** - Utility-first CSS
- **Framer Motion 11.0** - Animation library
- **Lucide React** - Icon library

### Backend & Database
- **Firebase 12.7** - Authentication and database
  - Firebase Authentication
  - Cloud Firestore
  - Real-time data sync

### Build & Deploy
- **Vite** - Fast HMR and optimized builds
- **Vercel** - Deployment platform (configured)

---

## 📖 Usage

### Getting Started

1. **Sign up/Login** using the authentication page
2. **Select a level** to start learning
3. **Begin flashcard session** to study words
4. **Track progress** in your dashboard

### Learning with Flashcards

1. **View the word** on the flashcard
2. **Think about the meaning** or definition
3. **Flip the card** to see the answer
4. **Mark as known/unknown** to track progress
5. **Continue** to the next word

### Dashboard Features

- **View statistics** - Total words learned, sessions completed
- **Track progress** - Visual progress indicators
- **Review history** - See your learning journey
- **Level progression** - Unlock new levels as you learn

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication (Email/Password provider)

2. **Set up Firestore**
   - Create Firestore database
   - Set up security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Get Configuration**
   - Go to Project Settings
   - Copy Firebase configuration
   - Add to `.env.local`

### Adding New Words

Edit `services/data.ts` to add word definitions:

```typescript
export const WORDS = [
  {
    id: 'word-id',
    word: 'example',
    definition: 'a thing characteristic of its kind',
    level: 1,
    category: 'general',
  },
];
```

---

## 🚢 Deployment

### Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Deploy!

The project includes `vercel.json` for optimal configuration.

### Environment Variables

Make sure to set all required Firebase environment variables in your deployment platform.

---

## 🎨 Design Philosophy

**Glassmorphism Aesthetic:**
- Frosted glass effects with backdrop blur
- Subtle borders and shadows
- Neon accent colors
- Smooth, futuristic animations

**User Experience:**
- Intuitive flashcard interactions
- Clear visual feedback
- Minimal cognitive load
- Engaging learning experience

**Learning Science:**
- Spaced repetition principles
- Active recall methodology
- Progress visualization
- Gamification elements

---

## 📝 License

This project is private and proprietary.

---

## 👤 Author

**Can Kilic**

- Portfolio: [cankilic.com](https://cankilic.com)
- GitHub: [@cankilic-gh](https://github.com/cankilic-gh)

---

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev)
- Authentication and database by [Firebase](https://firebase.google.com)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide](https://lucide.dev)

---

## 🚀 Future Enhancements

- [ ] Spaced repetition algorithm
- [ ] Audio pronunciation
- [ ] Multiple language support
- [ ] Social features (leaderboards, sharing)
- [ ] Advanced analytics and insights
- [ ] Custom word lists
- [ ] Export progress data
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Voice recognition practice
