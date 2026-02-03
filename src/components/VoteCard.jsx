import { Link } from 'react-router-dom'
import { formatDate } from '../utils/helpers'

export default function VoteCard({ vote }) {
  const totalVotes = vote.voters ? vote.voters.length : 0

  return (
    <Link to={`/vote/${vote.id}`} className="block">
      <div className="card hover:shadow-xl transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{vote.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            vote.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {vote.status === 'active' ? '进行中' : '已结束'}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <span>{vote.type === 'location' ? '📍 地点投票' : '🕐 时间投票'}</span>
          <span>👥 {totalVotes}人参与</span>
        </div>

        {vote.deadline && (
          <div className="text-sm text-gray-500 mb-3">
            ⏰ 截止：{formatDate(vote.deadline)}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {vote.options.slice(0, 3).map((opt, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
              {opt.name} ({opt.count})
            </span>
          ))}
          {vote.options.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-500">
              +{vote.options.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}