import { Link, Outlet } from 'react-router-dom'
import './Layout.css'

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
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
