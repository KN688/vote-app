import { Link, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Layout({ children }) {
  const location = useLocation()
  const userNickname = useStore(state => state.userNickname)

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            🗳️ 聚餐投票
          </Link>
          {userNickname && (
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              {userNickname}
            </Link>
          )}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link
              to="/"
              className={`flex flex-col items-center ${isActive('/') ? 'text-primary-600' : 'text-gray-500'}`}
            >
              <span className="text-2xl mb-1">📊</span>
              <span className="text-xs">投票</span>
            </Link>
            <Link
              to="/create"
              className={`flex flex-col items-center ${isActive('/create') ? 'text-primary-600' : 'text-gray-500'}`}
            >
              <span className="text-2xl mb-1">➕</span>
              <span className="text-xs">创建</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary-600' : 'text-gray-500'}`}
            >
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs">我的</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 底部占位 */}
      <div className="h-20"></div>
    </div>
  )
}