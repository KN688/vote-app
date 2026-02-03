import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { setUserNickname as setSupabaseNickname } from '../supabase'

export default function CreateVote() {
  const navigate = useNavigate()
  const { createVote, userNickname, setUserNickname: setNickname } = useStore()

  const [title, setTitle] = useState('')
  const [type, setType] = useState('location')
  const [options, setOptions] = useState(['', ''])
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [nickname, setNicknameState] = useState(userNickname)
  const [submitting, setSubmitting] = useState(false)

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('请输入投票标题')
      return
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert('至少需要2个有效选项')
      return
    }

    // 更新昵称
    if (nickname.trim()) {
      setSupabaseNickname(nickname.trim())
      setNickname(nickname.trim())
    }

    setSubmitting(true)

    try {
      const vote = await createVote({
        title: title.trim(),
        type,
        options: validOptions,
        deadline: deadline || null,
        description: description.trim()
      })

      alert('创建成功！')
      navigate(`/vote/${vote.id}`)
    } catch (error) {
      alert('创建失败：' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">创建新投票</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 昵称设置 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            你的昵称
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNicknameState(e.target.value)}
            className="input"
            placeholder="输入昵称，让其他人知道你是谁"
            maxLength={20}
          />
        </div>

        {/* 投票类型 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            投票类型
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('location')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === 'location'
                  ? 'border-primary-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">📍</div>
              <div className="font-medium">地点投票</div>
            </button>
            <button
              type="button"
              onClick={() => setType('time')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === 'time'
                  ? 'border-primary-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🕐</div>
              <div className="font-medium">时间投票</div>
            </button>
          </div>
        </div>

        {/* 投票标题 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投票标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="例如：本周聚餐地点选择"
            maxLength={50}
          />
        </div>

        {/* 选项列表 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            投票选项
          </label>
          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="input"
                  placeholder={`选项 ${index + 1}`}
                  maxLength={30}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="w-12 h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 10}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + 添加选项（最多10个）
          </button>
        </div>

        {/* 截止时间 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            截止时间（可选）
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input"
          />
        </div>

        {/* 备注 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注说明（可选）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[100px]"
            placeholder="添加投票备注..."
            maxLength={200}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {submitting ? '创建中...' : '创建投票'}
        </button>
      </form>
    </div>
  )
}