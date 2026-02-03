import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { formatDate, shareVote } from '../utils/helpers'

export default function VoteResult() {
  const { id } = useParams()
  const { fetchVoteDetail } = useStore()

  const [vote, setVote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVote()
  }, [id])

  const loadVote = async () => {
    try {
      const data = await fetchVoteDetail(id)
      setVote(data)
    } catch (error) {
      alert('加载失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    shareVote(window.location.href, vote?.title || '快来参与投票')
  }

  const handleShareToWechat = () => {
    const shareUrl = window.location.href
    const shareText = `${vote.title}\n${vote.type === 'location' ? '📍 地点投票' : '🕐 时间投票'}\n👥 ${totalVotes}人参与\n\n点击链接查看投票结果：\n${shareUrl}`

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('分享链接已复制到剪贴板！\n\n请打开微信，粘贴链接发送到群聊。')
      }).catch(() => {
        alert(shareText)
      })
    } else {
      alert(shareText)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>
  }

  if (!vote) {
    return <div className="text-center py-12 text-gray-500">投票不存在</div>
  }

  const totalVotes = vote.voters?.length || 0
  const sortedOptions = [...vote.options]
    .map(opt => ({ ...opt, percent: totalVotes > 0 ? ((opt.count / totalVotes) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.count - a.count)

  const rankIcons = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="card">
        {/* 标题和状态 */}
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 flex-1 pr-2">{vote.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            vote.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {vote.status === 'active' ? '进行中' : '已结束'}
          </span>
        </div>

        {/* 信息 */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <span>{vote.type === 'location' ? '📍 地点投票' : '🕐 时间投票'}</span>
          <span>👥 {totalVotes}人参与</span>
        </div>

        {/* 投票结果 */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900">投票结果</h2>
          {sortedOptions.map((opt, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  idx === 0 ? 'bg-yellow-500' :
                  idx === 1 ? 'bg-gray-400' :
                  idx === 2 ? 'bg-orange-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {rankIcons[idx] || (idx + 1)}
                </div>
                <span className="flex-1 font-medium">{opt.name}</span>
              </div>

              {/* 进度条 */}
              <div className="ml-13 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                    idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-300' :
                    'bg-gradient-to-r from-primary-500 to-primary-400'
                  }`}
                  style={{ width: `${opt.percent}%` }}
                ></div>
              </div>

              {/* 票数和百分比 */}
              <div className="ml-13 flex justify-between text-sm text-gray-600">
                <span>{opt.count}票</span>
                <span className="font-bold text-primary-600">{opt.percent}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 投票详情 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="font-bold text-gray-900 mb-3">投票详情</h2>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-24 text-gray-500">发起人</span>
              <span className="flex-1">{vote.creator_nickname || '未知'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500">创建时间</span>
              <span className="flex-1">{formatDate(vote.created_at)}</span>
            </div>
            {vote.deadline && (
              <div className="flex">
                <span className="w-24 text-gray-500">截止时间</span>
                <span className="flex-1">{formatDate(vote.deadline)}</span>
              </div>
            )}
            {vote.description && (
              <div className="flex">
                <span className="w-24 text-gray-500">备注</span>
                <span className="flex-1">{vote.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 space-y-3">
          <button onClick={handleShareToWechat} className="btn btn-green w-full">
            📱 分享到微信群
          </button>
          <button onClick={handleShare} className="btn btn-secondary w-full">
            分享给朋友
          </button>
          <Link to={`/vote/${id}`} className="btn btn-primary w-full text-center block">
            返回投票
          </Link>
        </div>
      </div>

      {/* 投票记录 */}
      {vote.vote_records && vote.vote_records.length > 0 && (
        <div className="card mt-4">
          <h2 className="font-bold text-gray-900 mb-3">投票记录</h2>
          <div className="space-y-2">
            {vote.vote_records
              .sort((a, b) => new Date(b.vote_time) - new Date(a.vote_time))
              .map((record, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-medium">{record.user_nickname || '匿名用户'}</span>
                    <span className="text-sm text-gray-500 ml-2">选择了 {record.selected_option}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(record.vote_time)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}