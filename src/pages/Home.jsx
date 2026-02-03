import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import VoteCard from '../components/VoteCard'

export default function Home() {
  const [activeTab, setActiveTab] = useState('all')
  const { votes, loading, fetchVotes } = useStore()

  useEffect(() => {
    fetchVotes(activeTab)
  }, [activeTab, fetchVotes])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">投票列表</h1>

        {/* 筛选标签 */}
        <div className="flex gap-2">
          {['all', 'active', 'closed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'all' ? '全部' : tab === 'active' ? '进行中' : '已结束'}
            </button>
          ))}
        </div>
      </div>

      {/* 投票列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : votes.length > 0 ? (
        <div className="space-y-4">
          {votes.map(vote => (
            <VoteCard key={vote.id} vote={vote} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 mb-4">暂无投票记录</p>
          <Link to="/create" className="btn btn-primary inline-block">
            创建第一个投票
          </Link>
        </div>
      )}
    </div>
  )
}