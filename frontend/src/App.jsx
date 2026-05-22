import { useEffect, useState } from 'react'
import api from './services/api'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(r => r.json())
      .then(setHealth)
  }, [])

  return <pre>{JSON.stringify(health, null, 2)}</pre>
}

export default App