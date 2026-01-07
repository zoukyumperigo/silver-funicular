# Alexandria - The Premier Digital Community for Liberal Arts Knowledge

![Alexandria Logo](https://img.shields.io/badge/Alexandria-Classical%20Learning-800020?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)

> *"The Library of Alexandria was the greatest repository of knowledge in the ancient world. We're building its digital successor for the modern age."*

## 🏛️ About Alexandria

Alexandria is a digital community platform dedicated to the Liberal Arts—the Trivium (Grammar, Logic, Rhetoric) and Quadrivium (Arithmetic, Geometry, Music, Astronomy). It combines classical education principles with modern marketplace dynamics.

### Core Features

- **📚 The Library**: Browse and discover books categorized by classical disciplines
- **🏛️ The Agora**: Buy and sell physical and digital books
- **🔄 The Match System**: Tinder-style book trading ("Cross-Look" matching)
- **🎓 The Academy**: Take courses and learn from expert instructors

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for backend)
- Stripe account (for payments, optional for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/alexandria.git
cd alexandria

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema migration:
   ```bash
   # Copy the contents of database-schema.sql
   # Paste into Supabase SQL Editor and execute
   ```
3. Update `.env` with your Supabase URL and anon key

## 📖 Documentation

- [System Architecture](./ARCHITECTURE.md) - Technical architecture and design decisions
- [Product Roadmap](./ROADMAP.md) - Feature roadmap and development timeline
- [Database Schema](./database-schema.sql) - Complete database structure

## 🎨 Design System: "Academic-Chic"

Alexandria features a timeless, scholarly aesthetic:

- **Typography**: Crimson Text (serif) + Inter (sans-serif)
- **Colors**: Parchment, Deep Burgundy, Academic Gold
- **Style**: Classical elegance meets modern usability
- **Dark Mode**: Fully supported

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion, React Spring

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Real-time**: Supabase Subscriptions

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Email**: Resend/SendGrid
- **Payments**: Stripe

## 📂 Project Structure

```
alexandria/
├── app/                  # Next.js app directory
│   ├── library/         # Library pages
│   ├── agora/           # Marketplace pages
│   ├── match/           # Book matching pages
│   ├── academy/         # Course pages
│   └── profile/         # User profile pages
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── library/        # Library-specific components
│   ├── match/          # Match-specific components
│   └── layout/         # Layout components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── public/             # Static assets
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🎯 Roadmap

### Phase 1: Browser MVP (Current)
- ✅ System architecture
- ✅ Database schema
- ✅ Core UI components
- ✅ Dashboard/Landing page
- ✅ Library browsing
- ✅ Match discovery feed
- 🚧 User authentication
- 🚧 Book inventory management
- 🚧 Marketplace functionality

### Phase 2: Mobile Apps
- Capacitor integration for iOS/Android
- Barcode scanning
- Push notifications
- Offline mode

### Phase 3: Advanced Features
- AI-powered recommendations
- Advanced marketplace features
- Social features (following, activity feeds)
- Book clubs and discussion forums

See [ROADMAP.md](./ROADMAP.md) for the complete roadmap.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the ancient Library of Alexandria
- Built with reverence for classical Liberal Arts education
- Thanks to all contributors and early beta testers

## 📧 Contact

- Website: [alexandria.edu](https://alexandria.edu) (coming soon)
- Twitter: [@AlexandriaApp](https://twitter.com/AlexandriaApp)
- Email: [hello@alexandria.app](mailto:hello@alexandria.app)

---

**Built with ❤️ for lovers of timeless knowledge**