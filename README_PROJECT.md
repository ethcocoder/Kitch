# Kitch - Premium Kitchen Equipment & Solutions Platform

A full-stack web application for browsing, managing, and purchasing premium kitchen equipment and materials. Built with React, Express, tRPC, and SQLite.

## 🎯 Features

### Public Landing Page
- **Advanced Animations**: Morph transitions, shape-shifting hero section, staggered entrance animations
- **Smooth Scroll Navigation**: Seamless navigation between sections (Hero, Features, How It Works, Testimonials, CTA)
- **Responsive Design**: Mobile-first approach with hamburger menu for small screens
- **Product Showcase**: Featured products with elegant presentation
- **Testimonials Section**: Customer reviews with star ratings
- **Call-to-Action**: Multiple conversion points throughout the page

### User Authentication
- **Manus OAuth Integration**: Secure login/signup flow
- **Role-Based Access Control**: Admin and user roles
- **Session Management**: Persistent authentication with JWT cookies
- **Protected Routes**: Admin-only access to dashboard

### Admin Dashboard (ERP-Style)
- **Sidebar Navigation**: Collapsible sidebar with quick access to all modules
- **Dashboard Overview**: Real-time statistics and analytics
- **Product Management**: Create, read, update, delete kitchen equipment
- **User Management**: Manage user accounts and roles
- **Order Management**: Track and manage customer orders
- **CMS System**: Edit landing page content (hero, features, testimonials)
- **Analytics**: Track user interactions and page views

### Content Management System (CMS)
- **Hero Section Editor**: Customize hero title, subtitle, and call-to-action
- **Features Management**: Add/edit/delete feature highlights
- **Testimonials Management**: Manage customer testimonials and ratings
- **Product Listings**: Manage product catalog with categories, prices, and inventory
- **Real-Time Updates**: Changes reflect immediately on the landing page

### Database
- **SQLite with Drizzle ORM**: Lightweight, file-based database perfect for Render deployment
- **Comprehensive Schema**: Users, products, orders, CMS content, testimonials, features, analytics
- **Type-Safe Queries**: Full TypeScript support with Drizzle ORM
- **Migration Support**: Versioned database migrations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- SQLite 3

### Installation

```bash
# Clone the repository
git clone https://github.com/ethcocoder/Kitch.git
cd Kitch

# Install dependencies
pnpm install

# Initialize database
node init-db.mjs

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Kitch-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (Home, AdminDashboard)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # tRPC client setup
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.tsx           # Main app routing
│   ├── index.html            # HTML entry point
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── storage.ts            # File storage helpers
│   └── _core/                # Core server infrastructure
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # SQL migration files
├── shared/                    # Shared types and constants
├── package.json              # Dependencies and scripts
├── drizzle.config.ts         # Drizzle ORM configuration
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript configuration
└── RENDER_DEPLOYMENT.md      # Deployment guide
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type check
pnpm check

# Format code
pnpm format

# Generate database migrations
pnpm drizzle-kit generate
```

### Database Schema

The application uses the following tables:

- **users**: User accounts with OAuth integration
- **products**: Kitchen equipment and materials
- **orders**: Customer orders
- **orderItems**: Individual items in orders
- **cmsContent**: Landing page content (hero, features, etc.)
- **testimonials**: Customer testimonials
- **features**: Feature highlights
- **analytics**: Event tracking for analytics

### API Routes

All API endpoints are under `/api/trpc`. Key procedures:

**Public Procedures:**
- `products.list` - Get all products
- `products.featured` - Get featured products
- `cms.content` - Get all CMS content
- `testimonials.list` - Get all testimonials
- `features.list` - Get all features

**Protected Procedures:**
- `orders.userOrders` - Get user's orders
- `orders.byId` - Get specific order

**Admin Procedures:**
- `admin.dashboard` - Get dashboard statistics

## 🎨 Design

### Color Palette
- **Primary**: Amber (#f59e0b)
- **Secondary**: Orange (#f97316)
- **Background**: Slate (#0f172a)
- **Text**: White (#ffffff)

### Typography
- **Headings**: Bold, large sizes for hierarchy
- **Body**: Clean, readable sans-serif
- **Accents**: Gradient text for emphasis

### Animations
- **Morph Transitions**: Smooth shape-shifting animations
- **Staggered Entrance**: Cascading animations for lists
- **Hover Effects**: Subtle scale and color changes
- **Scroll Animations**: Trigger animations on scroll

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Hamburger menu, stacked layout, touch-friendly buttons
- **Tablet**: Optimized grid layouts
- **Desktop**: Full sidebar navigation, multi-column layouts

## 🔐 Security

- **OAuth Authentication**: Secure login via Manus OAuth
- **JWT Sessions**: Secure session management with signed cookies
- **Role-Based Access**: Admin routes protected by role checks
- **Type Safety**: Full TypeScript for compile-time safety
- **Environment Variables**: Sensitive data stored in environment

## 🚀 Deployment

### Render Deployment

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment instructions.

Quick summary:
1. Connect GitHub repository to Render
2. Set up SQLite disk for persistence
3. Configure environment variables
4. Deploy with `pnpm build` and `pnpm start`

### Environment Variables

```
DATABASE_URL=/var/data/kitch.db
NODE_ENV=production
JWT_SECRET=<secure-random-string>
VITE_APP_ID=<manus-oauth-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

## 📊 Analytics

The application tracks the following events:
- Page views
- Product views
- User signups
- Order creation
- Feature interactions

Analytics data is stored in the `analytics` table and can be queried for insights.

## 🧪 Testing

The project includes Vitest for unit testing. Run tests with:

```bash
pnpm test
```

Example test file: `server/auth.logout.test.ts`

## 📚 Technology Stack

### Frontend
- **React 19**: UI framework
- **Framer Motion**: Advanced animations
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Component library
- **tRPC**: End-to-end type-safe APIs
- **Wouter**: Lightweight routing

### Backend
- **Express 4**: Web server
- **tRPC 11**: Type-safe RPC framework
- **Drizzle ORM**: Type-safe database queries
- **SQLite**: Lightweight database
- **better-sqlite3**: SQLite driver for Node.js

### Build & Dev
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **ESBuild**: Production bundling
- **pnpm**: Package manager

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review existing issues on GitHub
3. Create a new issue with detailed information

## 🎯 Future Enhancements

Planned features for future releases:
- Payment integration (Stripe)
- Email notifications
- Advanced analytics dashboard
- Inventory management
- Customer reviews and ratings
- Wishlist functionality
- Multi-language support
- Mobile app

## 📞 Contact

For questions or feedback, please reach out through GitHub issues.

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Maintained by**: Kitch Team
