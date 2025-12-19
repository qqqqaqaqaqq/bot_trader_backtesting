import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css'

import DAY from './pages/DAY'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/day" />} />
        <Route path="/day" element={<DAY />} />
      </Routes>
    </>
  )
}

export default App
