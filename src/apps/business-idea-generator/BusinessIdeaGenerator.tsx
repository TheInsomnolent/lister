import { useState } from 'react'
import './BusinessIdeaGenerator.css'

const ADJECTIVES = [
  'Revolutionary', 'Disruptive', 'AI-Powered', 'Blockchain-Based', 'Sustainable',
  'Quantum', 'Cloud-Native', 'NFT-Enabled', 'Metaverse-Ready', 'Web3',
  'Eco-Friendly', 'Mindful', 'Artisanal', 'Organic', 'Synergistic',
  'Gamified', 'Crowdsourced', 'Data-Driven', 'Algorithm-Optimized', 'Viral'
]

const BUSINESS_TYPES = [
  'Social Network', 'Subscription Service', 'Marketplace', 'SaaS Platform', 'Mobile App',
  'Delivery Service', 'Coaching Program', 'Online Course', 'Streaming Platform', 'Dating App',
  'Consulting Agency', 'E-commerce Store', 'Membership Club', 'Newsletter', 'Podcast Network'
]

const TARGET_MARKETS = [
  'for Pets', 'for Millennials', 'for Gen Z', 'for Boomers', 'for Influencers',
  'for Programmers', 'for Yoga Enthusiasts', 'for Coffee Lovers', 'for Gamers', 'for Parents',
  'for Remote Workers', 'for Entrepreneurs', 'for Investors', 'for Athletes', 'for Artists',
  'for Students', 'for Retirees', 'for Foodies', 'for Travelers', 'for Night Owls'
]

function generateIdea() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)]
  const targetMarket = TARGET_MARKETS[Math.floor(Math.random() * TARGET_MARKETS.length)]
  
  return `${adjective} ${businessType} ${targetMarket}`
}

export function BusinessIdeaGenerator() {
  const [idea, setIdea] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)

  const rollIdea = () => {
    setIsSpinning(true)
    
    // Simulate pokie machine spinning effect
    let spins = 0
    const maxSpins = 20
    const spinInterval = setInterval(() => {
      setIdea(generateIdea())
      spins++
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval)
        setIsSpinning(false)
      }
    }, 100)
  }

  return (
    <div className="business-idea-generator">
      <h1>💡 Business Idea Generator</h1>
      <p className="description">
        Click the button to generate your next billion-dollar startup idea!
      </p>

      <div className={`idea-display ${isSpinning ? 'spinning' : ''}`}>
        {idea || 'Click the button to roll!'}
      </div>

      <button 
        className="roll-button" 
        onClick={rollIdea}
        disabled={isSpinning}
      >
        {isSpinning ? '🎰 ROLLING...' : '🎰 ROLL THE DICE'}
      </button>

      <div className="info-box">
        <p>Each click combines random buzzwords and business models to create uniquely ridiculous startup ideas. Perfect for brainstorming, or just having a laugh!</p>
      </div>
    </div>
  )
}
