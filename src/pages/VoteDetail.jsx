import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useStore from '../store/useStore'
import OptionItem from '../components/OptionItem'
import { formatDate, calculateCountdown } from '../utils/helpers'
import { getUserId } from '../supabase'

export default function VoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchVoteDetail, submitVote } = useStore()

  const [vote, setVote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState('')

  const userId = getUserId()
  const hasVoted = vote?.voters?.includes(userId)
  const totalVotes = vote?.voters?.length || 0

  useEffect(() => {
    loadVote()
  }, [id])

  useEffect(() => {
    if (vote?.deadline && vote.status === 'active') {
      const timer = setInterval(() => {
        const cd = calculateCountdown(vote.deadline)
        setCountdown(cd)
        if (cd === '已截止') {
          loadVote()
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [vote?.deadline, vote?.status])

  const loadVote = async () => {
    try {
      const data = await fetchVoteDetail(id)
      setVote(data)

      // 检查用户是否已投票
      if (data.voters?.includes(userId)) {
        const record = data.vote_records?.find(r => r.user_id === userId)
        if (record) {
          setSelectedOption(record.selected_option)
        }
      }
    } catch (error) {
      alert('加载失败：' + error.message)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert('请选择一个选项')
      return
    }

    setSubmitting(true)

    try {
      await submitVote(id, selectedOption)
      alert(hasVoted ? '修改成功！' : '投票成功！')
      loadVote()
    } catch (error) {
      alert('提交失败：' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShareToWechat = () => {
    // 在移动端微信环境中，可以使用微信 JS-SDK 分享
    // 在普通浏览器中，复制链接到剪贴板
    const shareUrl = window.location.href
    const shareText = `${vote.title}\n${vote.type === 'location' ? '📍 地点投票' : '🕐 时间投票'}\n👥 ${totalVotes}人参与\n\n点击链接参与投票：\n${shareUrl}`

    // 尝试复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('分享链接已复制到剪贴板！\n\n请打开微信，粘贴链接发送到群聊。')
      }).catch(() => {
        // 如果复制失败，显示文本让用户手动复制
        alert(shareText)
      })
    } else {
      // 降级方案：显示文本让用户手动复制
      alert(shareText)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>
  }

  if (!vote) {
    return <div className="text-center py-12 text-gray-500">投票不存在</div>
  }

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

        {/* 截止时间 */}
        {vote.deadline && (
          <div className="text-sm text-gray-500 mb-4">
            ⏰ 截止：{formatDate(vote.deadline)}
            {vote.status === 'active' && (
              <span className="ml-2 text-primary-600 font-medium">（剩余 {countdown}）</span>
            )}
          </div>
        )}

        {/* 备注 */}
        {vote.description && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 mb-4">
            {vote.description}
          </div>
        )}

        {/* 选项列表 */}
        <div className="space-y-3">
          {vote.options.map((opt, idx) => (
            <OptionItem
              key={idx}
              option={{ ...opt, totalVotes }}
              selected={selectedOption === opt.name}
              onClick={() => setSelectedOption(opt.name)}
              disabled={vote.status !== 'active'}
              showPercent={hasVoted || vote.status === 'closed'}
            />
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 space-y-3">
          {vote.status === 'active' && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {submitting ? '提交中...' : hasVoted ? '修改投票' : '投票'}
            </button>
          )}
          <button
            onClick={handleShareToWechat}
            className="btn btn-green w-full"
          >
            📱 分享到微信群
          </button>
          <Link to={`/result/${id}`} className="btn btn-secondary w-full text-center block">
            查看结果
          </Link>
        </div>
      </div>
    </div>
  )
}