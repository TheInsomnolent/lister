import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './components/Home'
import { BusinessIdeaGenerator } from './apps/business-idea-generator/BusinessIdeaGenerator'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="apps/business-idea-generator" element={<BusinessIdeaGenerator />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
