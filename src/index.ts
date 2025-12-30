import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static files if you have a public folder (optional, but good practice)
app.use(express.static(path.join(__dirname, 'public')))

// Home route - The Landing Page
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FOSS Club CE Vadakara</title>
        <style>
          /* --- THEME SETUP (Black, White, Green) --- */
          :root {
            /* Light Mode */
            --bg-color: #ffffff;
            --text-main: #000000;
            --text-muted: #4b5563;
            --accent: #16a34a; /* Green-600 */
            --accent-glow: rgba(22, 163, 74, 0.15);
            --card-bg: #f9fafb;
            --border: #e5e7eb;
            --nav-bg: rgba(255, 255, 255, 0.8);
          }

          @media (prefers-color-scheme: dark) {
            :root {
              /* Dark Mode */
              --bg-color: #000000;
              --text-main: #ffffff;
              --text-muted: #9ca3af;
              --accent: #4ade80; /* Green-400 */
              --accent-glow: rgba(74, 222, 128, 0.15);
              --card-bg: #111111;
              --border: #262626;
              --nav-bg: rgba(0, 0, 0, 0.8);
            }
          }

          /* Global Resets */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            transition: background-color 0.3s, color 0.3s;
          }

          /* Layout */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          /* Navigation */
          nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: var(--nav-bg);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            z-index: 1000;
          }
          .nav-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
          }
          .logo {
            font-weight: 800;
            font-size: 1.25rem;
            color: var(--accent);
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .nav-links {
            display: flex;
            gap: 20px;
          }
          .nav-links a {
            color: var(--text-main);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.2s;
          }
          .nav-links a:hover {
            color: var(--accent);
          }

          /* Hero Section */
          .hero {
            padding: 160px 0 100px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--accent-glow);
            color: var(--accent);
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
          }
          h1 {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            letter-spacing: -1px;
          }
          h1 span {
            color: var(--accent);
          }
          .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 2.5rem;
          }
          .cta-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s;
          }
          .btn-primary {
            background-color: var(--accent);
            color: #000; /* Black text on green usually reads well, or white depending on shade */
            color: white; 
          }
          /* Fix for text contrast on bright green in dark mode if needed */
          @media (prefers-color-scheme: dark) {
             .btn-primary { color: #000; }
          }
          
          .btn-secondary {
            background-color: var(--card-bg);
            color: var(--text-main);
            border: 1px solid var(--border);
          }
          .btn:hover {
            transform: translateY(-2px);
          }

          /* Features Grid */
          .features {
            padding: 4rem 0;
            border-top: 1px solid var(--border);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }
          .card {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid var(--border);
          }
          .card h3 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }
          .card p {
            color: var(--text-muted);
          }

          /* Responsive Tweaks */
          @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .hero { padding-top: 120px; }
          }
        </style>
      </head>
      <body>

        <!-- Navigation -->
        <nav>
          <div class="container nav-content">
            <a href="/" class="logo">FOSS Club CEV</a>
            <div class="nav-links">
              <a href="/about">About</a>
              <a href="/api-data">API</a>
              <a href="https://fossunited.org" target="_blank">FOSS United</a>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <header class="hero container">
          <span class="badge">College of Engineering Vadakara</span>
          <h1>Open Source.<br><span>Limitless Possibilities.</span></h1>
          <p>
            Join a community of students dedicated to learning, building, and sharing free software. 
            We are the FOSS Club at CEV.
          </p>
          <div class="cta-group">
            <a href="/about" class="btn btn-primary">Meet the Club</a>
            <a href="https://github.com/fosscev" target="_blank" class="btn btn-secondary">GitHub</a>
          </div>
        </header>

        <!-- Brief Features -->
        <section class="container features">
          <div class="grid">
            <div class="card">
              <h3>🌱 Learn</h3>
              <p>Workshops on Linux, Git, Python, and Rust. We help you go from zero to deployment.</p>
            </div>
            <div class="card">
              <h3>🔨 Build</h3>
              <p>Contribute to real-world open source projects and build tools that matter.</p>
            </div>
            <div class="card">
              <h3>🤝 Share</h3>
              <p>Part of the larger FOSS United family. Connect with mentors and peers across India.</p>
            </div>
          </div>
        </section>

      </body>
    </html>
  `)
})

// About route - Serves the file from previous steps
// Make sure 'components/about.htm' exists or update this path to where you saved the previous file
app.get('/about', function (req, res) {
  // Using path.resolve to handle relative paths reliably
  // Assuming structure: /api/index.js and /components/about.htm
  res.sendFile(path.resolve(__dirname, '..', 'components', 'about.htm')) 
})

// API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    club: "FOSS Club CEV",
    founded: 2024,
    status: "Active",
    stack: ['Express', 'Vercel', 'Node.js'],
    theme_colors: ['#000000', '#ffffff', '#16a34a']
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
