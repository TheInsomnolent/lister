import { Link, Outlet } from 'react-router-dom'
import './Layout.css'

async function clearCacheAndReload() {
  localStorage.clear()
  sessionStorage.clear()
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }
  window.location.reload()
}

export function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <h1 className="nav-title">
          <Link to="/">Lister</Link>
        </h1>
        <ul className="nav-links">
          <li>
            <Link to="/apps/business-idea-generator">Business Idea Generator</Link>
          </li>
          <li>
            <Link to="/apps/fast-food-tracker">Fast Food Tracker</Link>
          </li>
          <li>
            <Link to="/apps/cross-stitch">Cross-Stitch</Link>
          </li>
        </ul>
        <button className="clear-cache-btn" onClick={clearCacheAndReload}>
          Clear Cache & Reload
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
