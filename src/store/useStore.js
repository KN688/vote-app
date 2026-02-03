import { create } from 'zustand'
import { supabase, getUserId, getUserNickname } from '../supabase'

const useStore = create((set, get) => ({
  // 当前用户
  userId: getUserId(),
  userNickname: localStorage.getItem('vote_user_nickname') || '',

  // 更新用户昵称
  setUserNickname: (nickname) => {
    localStorage.setItem('vote_user_nickname', nickname)
    set({ userNickname: nickname })
  },

  // 投票列表
  votes: [],
  loading: false,

  // 获取投票列表
  fetchVotes: async (status = 'all') => {
    set({ loading: true })
    try {
      let query = supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false })

      if (status === 'active') {
        query = query.eq('status', 'active')
      } else if (status === 'closed') {
        query = query.eq('status', 'closed')
      }

      const { data, error } = await query.limit(20)

      if (error) throw error
      set({ votes: data || [] })
    } catch (error) {
      console.error('获取投票列表失败:', error)
    } finally {
      set({ loading: false })
    }
  },

  // 创建投票
  createVote: async (voteData) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert([{
          title: voteData.title,
          type: voteData.type,
          options: voteData.options.map(opt => ({ name: opt, count: 0 })),
          deadline: voteData.deadline || null,
          description: voteData.description || '',
          status: 'active',
          creator_id: getUserId(),
          creator_nickname: getUserNickname(),
          voters: [],
          vote_records: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建投票失败:', error)
      throw error
    }
  },

  // 获取投票详情
  fetchVoteDetail: async (voteId) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('id', voteId)
        .single()

      if (error) throw error

      // 检查是否过期
      if (data.deadline && new Date(data.deadline) < new Date() && data.status === 'active') {
        await supabase
          .from('votes')
          .update({ status: 'closed', updated_at: new Date().toISOString() })
          .eq('id', voteId)
        data.status = 'closed'
      }

      return data
    } catch (error) {
      console.error('获取投票详情失败:', error)
      throw error
    }
  },

  // 提交投票
  submitVote: async (voteId, selectedOption) => {
    try {
      const vote = await get().fetchVoteDetail(voteId)

      if (vote.status !== 'active') {
        throw new Error('投票已结束')
      }

      if (vote.deadline && new Date(vote.deadline) < new Date()) {
        await supabase
          .from('votes')
          .update({ status: 'closed', updated_at: new Date().toISOString() })
          .eq('id', voteId)
        throw new Error('投票已截止')
      }

      const userId = getUserId()
      const hasVoted = vote.voters && vote.voters.includes(userId)

      let updatedOptions = [...vote.options]
      let updatedVoters = vote.voters || []
      let updatedRecords = vote.vote_records || []

      if (hasVoted) {
        // 修改投票
        const oldRecord = updatedRecords.find(r => r.user_id === userId)
        const oldOption = oldRecord ? oldRecord.selected_option : null

        if (oldOption === selectedOption) {
          return vote
        }

        // 减少旧选项票数
        updatedOptions = updatedOptions.map(opt => {
          if (opt.name === oldOption) {
            return { ...opt, count: Math.max(0, opt.count - 1) }
          }
          return opt
        })

        // 增加新选项票数
        updatedOptions = updatedOptions.map(opt => {
          if (opt.name === selectedOption) {
            return { ...opt, count: opt.count + 1 }
          }
          return opt
        })

        // 更新记录
        updatedRecords = updatedRecords.map(record => {
          if (record.user_id === userId) {
            return { ...record, selected_option: selectedOption, vote_time: new Date().toISOString() }
          }
          return record
        })
      } else {
        // 首次投票
        updatedOptions = updatedOptions.map(opt => {
          if (opt.name === selectedOption) {
            return { ...opt, count: opt.count + 1 }
          }
          return opt
        })

        updatedVoters.push(userId)
        updatedRecords.push({
          user_id: userId,
          user_nickname: getUserNickname(),
          selected_option: selectedOption,
          vote_time: new Date().toISOString()
        })
      }

      const { data, error } = await supabase
        .from('votes')
        .update({
          options: updatedOptions,
          voters: updatedVoters,
          vote_records: updatedRecords,
          updated_at: new Date().toISOString()
        })
        .eq('id', voteId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('提交投票失败:', error)
      throw error
    }
  }
}))

export default useStore