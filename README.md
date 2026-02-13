# Lister

A playground for prototyping one-page apps.

## 🚀 Live Demo

Visit the live site: [https://theinsomnolent.github.io/lister/](https://theinsomnolent.github.io/lister/)

## 📱 Apps

- **Business Idea Generator** - Generate ridiculous startup ideas with a pokie machine-style randomizer
- **Fast Food Badge Tracker** - Track regionally unique fast food items and earn badges (focusing on Australian specialties)

💡 **Want to add a new app?** Check out [IDEAS.md](IDEAS.md) for a list of app ideas and contribute your own!

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🏗️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

## 📦 Project Structure

```
src/
├── apps/                    # Individual app prototypes
│   └── business-idea-generator/
├── components/              # Shared components
│   ├── Layout.tsx          # Main layout with navigation
│   └── Home.tsx            # Home page
├── App.tsx                 # Main app with routing
└── main.tsx               # Entry point
```

## 🚢 Deployment

The app is automatically deployed to GitHub Pages when:
- Changes are pushed to the `main` branch
- A pull request is merged into `main`
- Manually triggered from the Actions tab

The deployment workflow:

1. Installs dependencies
2. Runs linter
3. Builds the app
4. Deploys to GitHub Pages

### 🤖 Auto-Merge for Copilot PRs

GitHub Copilot PRs are automatically approved and merged once they're ready (title doesn't start with `[WIP]`). See [AUTO_MERGE_SETUP.md](AUTO_MERGE_SETUP.md) for configuration details and required repository settings.

## 📝 Adding New Apps

1. Create a new directory in `src/apps/`
2. Build your app component
3. Add a route in `src/App.tsx`
4. Add a link in the navigation (`src/components/Layout.tsx`)
5. Add a card on the home page (`src/components/Home.tsx`)

