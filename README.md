# CoinOrbit - Investment Platform Demo

## ⚠️ IMPORTANT WARNING ⚠️

**THIS IS A DEMO APPLICATION ONLY**

This application is designed for demonstration and educational purposes only. It simulates an investment platform but:

- **DO NOT** use real cryptocurrency or fiat currency with this application
- **DO NOT** enter real wallet addresses or financial information
- **NO REAL INVESTMENTS** are made through this platform
- All transactions, profits, and balances are simulated

The creators and contributors of this project are not responsible for any financial losses incurred by misusing this demo application for real investments.

## Overview

CoinOrbit is a simulated cryptocurrency investment platform that demonstrates how a modern fintech application might function. It features a sleek UI with interactive elements, user authentication, and simulated investment functionality.

## Features

- **User Authentication**: Sign up, login, and password reset functionality
- **Dashboard**: Overview of simulated investments, balance, and transactions
- **Investment Plans**: Multiple simulated investment plans with different ROI rates
- **Deposit & Withdrawal**: Simulated cryptocurrency deposit and withdrawal processes
- **Referral System**: Simulated referral program with unique referral codes
- **Admin Panel**: Complete admin dashboard for managing users, transactions, and investments
- **Responsive Design**: Fully responsive UI that works on mobile and desktop

## Tech Stack

- **Frontend**: React.js with Next.js framework
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **3D Effects**: OGL for particle effects

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/coinorbit.git
   cd coinorbit
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication (Email/Password)
   - Set up Firestore Database

4. Configure Firebase:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

5. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Rules Setup

For security, make sure to set up proper Firestore rules. You can use the `firestore.rules` file included in the project.

## Project Structure

\`\`\`
coinorbit/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin panel pages
│   ├── dashboard/        # User dashboard
│   ├── deposit/          # Deposit functionality
│   ├── withdraw/         # Withdrawal functionality
│   ├── login/            # Authentication pages
│   └── ...
├── components/           # React components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utility functions and services
│   ├── auth-service.ts   # Authentication functions
│   ├── firebase.ts       # Firebase configuration
│   └── ...
├── public/               # Static assets
└── ...
\`\`\`

## Key Components

### Authentication
- User registration and login
- Password reset functionality
- Admin authentication system

### Investment System
- Multiple investment plans with different ROI rates
- Simulated investment tracking
- Progress visualization

### Admin Dashboard
- User management
- Transaction monitoring
- Investment oversight
- Withdrawal approvals

### User Dashboard
- Portfolio overview
- Transaction history
- Referral tracking
- Account settings

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## Contributing

This is a demo project, but contributions are welcome. Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for demonstration purposes only. It does not provide real investment opportunities or financial services. All transactions, profits, and balances are simulated and do not represent real-world value.

**NEVER USE THIS APPLICATION WITH REAL MONEY OR CRYPTOCURRENCY**

---

Created for educational purposes. Not affiliated with any real financial institution or investment platform.
