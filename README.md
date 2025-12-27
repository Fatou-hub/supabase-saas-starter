# 🚀 Supabase Multi-Tenant SaaS Starter Kit

Build and launch your B2B SaaS in **days**, not months.

**Production-ready** boilerplate with authentication, multi-tenancy, role-based access, and more.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e.svg)

---

## ✨ What You Get

- ✅ **Complete Authentication System** - Login, signup, password reset, email verification
- ✅ **Multi-Tenant Architecture** - Perfect organization isolation with Row Level Security
- ✅ **Role-Based Access Control** - Admin, member, and viewer roles out of the box
- ✅ **Supabase Backend** - PostgreSQL database with Auth and RLS policies
- ✅ **Modern Frontend Stack** - React 18 + TypeScript + Vite for blazing-fast development
- ✅ **Beautiful UI** - Tailwind CSS with responsive design and dark mode ready
- ✅ **Protected Routes** - Automatic role-based navigation and access control
- ✅ **Production Ready** - Clean code, proper error handling, TypeScript types

---

## 🎯 Perfect For

- **B2B SaaS Platforms** - Build tools for businesses and teams
- **Team Collaboration Tools** - Apps requiring multi-user workspaces
- **Client Portals** - Secure customer-facing applications
- **Internal Business Tools** - Company-specific management systems
- **Multi-Tenant Applications** - Any app with organization-based data isolation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Vite + TS)        │
│   • Authentication UI                │
│   • Protected Routes                 │
│   • Organization Dashboard           │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│   Supabase Backend                   │
│   • PostgreSQL Database              │
│   • Row Level Security (RLS)         │
│   • Authentication Service           │
│   • Real-time Subscriptions          │
└─────────────────────────────────────┘
```

---

## 📦 What's Included

```
supabase-saas-starter/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Role-based route protection
│   │   ├── Header.tsx               # Navigation with auth state
│   │   └── LoadingSpinner.tsx       # Reusable loading component
│   ├── pages/
│   │   ├── LoginPage.tsx            # Login with email/password
│   │   ├── SignupPage.tsx           # Registration with role selection
│   │   ├── OrganizationDashboard.tsx # Main dashboard
│   │   └── ManageMembers.tsx        # Team member management
│   ├── hooks/
│   │   └── useAuth.tsx              # Complete authentication logic
│   ├── lib/
│   │   └── supabase.ts              # Supabase client configuration
│   └── types/
│       └── index.ts                 # TypeScript definitions
├── database-schema.sql              # Complete database setup
├── SETUP.md                         # Detailed setup instructions
├── .env.example                     # Environment variables template
└── package.json                     # Dependencies
```

---

## 🚀 Quick Start (10 Minutes)

### 1. Install Dependencies

```bash
npm install
cp .env.example .env
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`
4. Go to SQL Editor and run the contents of `database-schema.sql`

### 3. Launch Your App

```bash
npm run dev
```

Visit `http://localhost:5173` and create your first account! 🎉

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build Tool | 5.x |
| **Tailwind CSS** | Styling | 3.x |
| **Supabase** | Backend & Auth | Latest |
| **React Router** | Routing | 6.x |
| **Lucide React** | Icons | Latest |

---

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level data isolation
- **Organization-Based Access** - Users only see their organization's data
- **Role-Based Permissions** - Fine-grained access control (admin/member/viewer)
- **Secure Authentication** - Supabase Auth with email verification
- **Protected API Routes** - Server-side authorization checks
- **SQL Injection Prevention** - Parameterized queries throughout

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide with screenshots
- **[Database Schema](./database-schema.sql)** - Commented SQL schema
- **[Supabase Docs](https://supabase.com/docs)** - Official Supabase documentation
- **[React Docs](https://react.dev)** - Official React documentation

---

## 🎨 Customization

### Change Branding

1. Update `index.html` title and meta tags
2. Replace logo in `src/components/Header.tsx`
3. Modify Tailwind colors in `tailwind.config.js`

### Add New Roles

1. Update role check in `database-schema.sql`
2. Add role to TypeScript types in `src/types/index.ts`
3. Update role selection in `SignupPage.tsx`

### Extend Database

1. Add new tables in `database-schema.sql`
2. Create RLS policies for new tables
3. Update TypeScript types
4. Create CRUD functions

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add your Supabase environment variables in the Vercel dashboard.

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

Configure environment variables in Netlify settings.

---

## 💡 Example Use Cases

### SaaS Dashboard
- User creates an organization
- Invites team members
- Manages organization data
- Role-based access (admins can invite, members can view)

### Client Portal
- Clients create accounts
- Add users as members
- Track client-specific data
- Isolated multi-tenant data

### Internal Tool
- Departments as organizations
- users as members
- Department-level data access
- Admin controls

---

## 🤝 Support

- 📧 **Email**: [your-email@example.com]
- 💬 **Issues**: Open an issue on GitHub
- 📖 **Docs**: Check SETUP.md for detailed instructions

---

## 📄 License

**MIT License** - Use this for unlimited commercial and personal projects.

See [LICENSE](./LICENSE) file for details.

---

## 🙏 Credits

Built with:
- [Supabase](https://supabase.com) - Amazing backend platform
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Vite](https://vitejs.dev) - Next generation build tool

---

## ⭐ Show Your Support

If this boilerplate helped you ship faster, consider:
- Starring this repository
- Sharing with other developers
- Leaving a review on Gumroad

---

**Built with ❤️ to help developers ship faster**

**Save weeks of development time. Focus on what makes your product unique.**

🚀 **Start building your SaaS today!**
