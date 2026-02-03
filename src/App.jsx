import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateVote from './pages/CreateVote'
import VoteDetail from './pages/VoteDetail'
import VoteResult from './pages/VoteResult'
import Profile from './pages/Profile'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateVote />} />
        <Route path="/vote/:id" element={<VoteDetail />} />
        <Route path="/result/:id" element={<VoteResult />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App