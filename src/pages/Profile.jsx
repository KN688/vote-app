import { useState } from 'react'
import useStore from '../store/useStore'
import { getUserId, setUserNickname } from '../supabase'

export default function Profile() {
  const { userNickname, setUserNickname: setStoreNickname } = useStore()
  const [nickname, setNickname] = useState(userNickname)
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    if (nickname.trim()) {
      setUserNickname(nickname.trim())
      setStoreNickname(nickname.trim())
      setEditing(false)
      alert('昵称已更新')
    }
  }

  const handleReset = () => {
    if (confirm('确定要重置用户信息吗？这将清除你的投票历史。')) {
      localStorage.removeItem('vote_user_id')
      localStorage.removeItem('vote_user_nickname')
      window.location.reload()
    }
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-4xl mb-4">
            👤
          </div>
          <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户ID
            </label>
            <div className="input bg-gray-50 text-gray-600">{getUserId()}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input flex-1"
                  placeholder="输入昵称"
                  maxLength={20}
                />
                <button onClick={handleSave} className="btn btn-primary">
                  保存
                </button>
                <button onClick={() => { setEditing(false); setNickname(userNickname) }} className="btn btn-secondary">
                  取消
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="input flex-1 bg-gray-50">{userNickname || '未设置'}</div>
                <button onClick={() => setEditing(true)} className="btn btn-secondary">
                  编辑
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">关于</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>聚餐投票 v1.0.0</p>
          <p>帮助群成员快速选择聚餐地点和时间，让聚会更轻松！</p>
          <div className="pt-4 border-t border-gray-200">
            <p className="font-medium text-gray-900 mb-2">功能说明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>创建投票（地点/时间）</li>
              <li>参与投票（支持修改）</li>
              <li>查看投票结果</li>
              <li>分享到群聊</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <button onClick={handleReset} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
          重置用户信息
        </button>
      </div>
    </div>
  )
}