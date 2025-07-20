import React from 'react'
import { BrowserRouter as Router,Route, Routes} from 'react-router-dom';
import Auth from './pages/Auth/Auth';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/auth' element={<Auth/>}>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
