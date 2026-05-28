import { useState } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [results, setResults] = useState(null)

  return results
    ? <Dashboard results={results} onReset={() => setResults(null)} />
    : <Home onResults={setResults} />
}
