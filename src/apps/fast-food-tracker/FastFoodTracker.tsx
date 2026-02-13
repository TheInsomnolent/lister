import { useState, useEffect } from 'react'
import { Award, MapPin, Trash2, Star } from 'lucide-react'
import './FastFoodTracker.css'

interface FoodItem {
  id: string
  name: string
  chain: string
  location: string
  description: string
}

interface TrackedItem {
  foodId: string
  dateAdded: string
  location: string
}

const FAST_FOOD_ITEMS: FoodItem[] = [
  // McDonald's Australia
  { id: 'mcd-grand-angus', name: 'Grand Angus', chain: 'McDonald\'s', location: 'Australia', description: 'Premium Angus beef burger' },
  { id: 'mcd-mcoz', name: 'McOz', chain: 'McDonald\'s', location: 'Australia', description: 'Australian-style burger with beetroot' },
  { id: 'mcd-aussie-angus', name: 'Aussie Angus', chain: 'McDonald\'s', location: 'Australia', description: 'Angus beef with Aussie toppings' },
  
  // KFC Australia
  { id: 'kfc-zinger-stacker', name: 'Zinger Stacker', chain: 'KFC', location: 'Australia', description: 'Triple layer Zinger burger' },
  { id: 'kfc-supercharged', name: 'Supercharged Dipping Sauce', chain: 'KFC', location: 'Australia', description: 'Australian exclusive dipping sauce' },
  { id: 'kfc-original-tenders', name: 'Original Recipe Tenders', chain: 'KFC', location: 'Australia', description: 'Chicken tenders with secret herbs and spices' },
  
  // Hungry Jack's (Burger King) Australia
  { id: 'hj-aussie-burger', name: 'Aussie Burger', chain: 'Hungry Jack\'s', location: 'Australia', description: 'With beetroot, egg, and bacon' },
  { id: 'hj-big-jack', name: 'Big Jack', chain: 'Hungry Jack\'s', location: 'Australia', description: 'Flame-grilled whopper-style burger' },
  { id: 'hj-storm', name: 'Storm', chain: 'Hungry Jack\'s', location: 'Australia', description: 'Soft serve with chocolate or caramel' },
  
  // Red Rooster Australia
  { id: 'rr-rooster-roll', name: 'Rooster Roll', chain: 'Red Rooster', location: 'Australia', description: 'Australian chicken chain special' },
  { id: 'rr-peri-peri', name: 'Peri Peri Chicken', chain: 'Red Rooster', location: 'Australia', description: 'Spicy grilled chicken' },
  { id: 'rr-rippa', name: 'Rippa Sub', chain: 'Red Rooster', location: 'Australia', description: 'Classic Australian chicken sub' },
  
  // Oporto Australia
  { id: 'oporto-bondi', name: 'Bondi Burger', chain: 'Oporto', location: 'Australia', description: 'Portuguese-style grilled chicken burger' },
  { id: 'oporto-sunset', name: 'Sunset Strip', chain: 'Oporto', location: 'Australia', description: 'Grilled chicken strips with chili sauce' },
  { id: 'oporto-rapido', name: 'Rapido Wrap', chain: 'Oporto', location: 'Australia', description: 'Portuguese chicken wrap' },
]

export function FastFoodTracker() {
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>(() => {
    try {
      const stored = localStorage.getItem('fastFoodTrackedItems')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to parse tracked items from localStorage:', error)
      return []
    }
  })
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [showConfetti, setShowConfetti] = useState(false)

  // Save tracked items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fastFoodTrackedItems', JSON.stringify(trackedItems))
  }, [trackedItems])

  const addItem = (foodId: string, location: string) => {
    const newItem: TrackedItem = {
      foodId,
      dateAdded: new Date().toISOString(),
      location
    }
    setTrackedItems([...trackedItems, newItem])
    
    // Show confetti animation
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  const removeItem = (foodId: string) => {
    setTrackedItems(trackedItems.filter(item => item.foodId !== foodId))
  }

  const isTracked = (foodId: string) => {
    return trackedItems.some(item => item.foodId === foodId)
  }

  const getUniqueChains = () => {
    const chains = [...new Set(FAST_FOOD_ITEMS.map(item => item.chain))]
    return chains.sort()
  }

  const filteredItems = selectedChain === 'all'
    ? FAST_FOOD_ITEMS
    : FAST_FOOD_ITEMS.filter(item => item.chain === selectedChain)

  const badgeCount = trackedItems.length
  const totalItems = FAST_FOOD_ITEMS.length
  const progressPercent = (badgeCount / totalItems) * 100

  return (
    <div className="fast-food-tracker">
      {showConfetti && (
        <div className="confetti-overlay">
          <div className="confetti"></div>
          <div className="badge-popup">
            <Award size={48} />
            <span>Badge Earned! 🎉</span>
          </div>
        </div>
      )}

      <div className="header">
        <h1>🍔 Fast Food Badge Tracker</h1>
        <p className="tagline">Track regionally unique fast food items and earn badges!</p>
      </div>

      <div className="stats-panel">
        <div className="stat-card glow">
          <div className="stat-icon">
            <Award size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{badgeCount}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
        </div>

        <div className="stat-card glow">
          <div className="stat-icon">
            <Star size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(progressPercent)}%</div>
            <div className="stat-label">Collection Complete</div>
          </div>
        </div>

        <div className="stat-card glow">
          <div className="stat-icon">
            <MapPin size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{getUniqueChains().length}</div>
            <div className="stat-label">Chains Available</div>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="progress-text">
          {badgeCount} / {totalItems} items collected
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="chain-filter">Filter by Chain:</label>
        <select 
          id="chain-filter"
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="chain-select glow"
        >
          <option value="all">All Chains</option>
          {getUniqueChains().map(chain => (
            <option key={chain} value={chain}>{chain}</option>
          ))}
        </select>
      </div>

      <div className="items-grid">
        {filteredItems.map(item => {
          const tracked = isTracked(item.id)
          return (
            <div 
              key={item.id} 
              className={`food-card ${tracked ? 'tracked' : ''} glow`}
            >
              {tracked && (
                <div className="badge-icon">
                  <Award size={24} />
                </div>
              )}
              
              <div className="food-header">
                <h3>{item.name}</h3>
                <span className="chain-badge">{item.chain}</span>
              </div>
              
              <p className="food-description">{item.description}</p>
              
              <div className="food-location">
                <MapPin size={16} />
                <span>{item.location}</span>
              </div>

              {!tracked ? (
                <button 
                  className="track-button"
                  onClick={() => {
                    const location = prompt(`Where did you try ${item.name}?`, item.location)
                    if (location) {
                      addItem(item.id, location)
                    }
                  }}
                >
                  <Award size={18} />
                  Track Item
                </button>
              ) : (
                <button 
                  className="remove-button"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              )}
            </div>
          )
        })}
      </div>

      {badgeCount === totalItems && (
        <div className="completion-message glow">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You've collected all {totalItems} fast food badges!</p>
          <p>You're a true Australian fast food connoisseur!</p>
        </div>
      )}
    </div>
  )
}
