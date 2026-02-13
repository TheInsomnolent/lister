import { Link } from 'react-router-dom'
import './Home.css'

export function Home() {
  return (
    <div className="home">
      <h1>Welcome to Lister</h1>
      <p className="subtitle">A collection of one-page app prototypes</p>
      
      <div className="apps-grid">
        <Link to="/apps/business-idea-generator" className="app-card">
          <h2>💡 Business Idea Generator</h2>
          <p>Generate random, ridiculous business ideas with the click of a button!</p>
        </Link>

        <Link to="/apps/fast-food-tracker" className="app-card">
          <h2>🍔 Fast Food Badge Tracker</h2>
          <p>Track regionally unique fast food items and earn badges! Focus on Australian specialties.</p>
        </Link>
      </div>

      <div className="info">
        <h2>About</h2>
        <p>This is a playground for prototyping single-page applications. Select an app from the menu above or click on a card to get started.</p>
      </div>
    </div>
  )
}
