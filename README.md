# FOSS Club CE Vadakara - Official Website

Welcome to the official website of the **FOSS Club at College of Engineering Vadakara**! We are a community of open-source enthusiasts dedicated to promoting freedom, collaboration, and innovation through technology.

## 🚀 Features

- **Modern Stack**: Built with Next.js 16, React 19, and Tailwind CSS.
- **Dynamic Content**: Events and Team members managed via **Supabase**.
- **Responsive Design**: Optimized for all devices with a "cyberpunk/hacker" aesthetic.
- **SEO Optimized**: Dynamic sitemaps, Open Graph images, and meta tags.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Framer Motion
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (Recommended)

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/foss-cev/website.git
cd website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory. **Do not commit this file.**
```env
# Public (Safe to expose to browser)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Private (Server-side only - for scripts)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup (First Time Only)
Run the setup script to create tables and policies in your Supabase project:
```bash
npm run setup:supabase
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

## 🤝 Contributing
We welcome contributions! Please follow our [Code of Conduct](./app/conduct/page.tsx).
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

---
Built with ❤️ by FOSS Club CE Vadakara
