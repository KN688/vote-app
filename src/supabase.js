import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 生成随机用户ID（存储在 localStorage）
export function getUserId() {
  let userId = localStorage.getItem('vote_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('vote_user_id', userId)
  }
  return userId
}

// 获取用户昵称
export function getUserNickname() {
  let nickname = localStorage.getItem('vote_user_nickname')
  if (!nickname) {
    nickname = '用户' + Math.floor(Math.random() * 10000)
    localStorage.setItem('vote_user_nickname', nickname)
  }
  return nickname
}

// 设置用户昵称
export function setUserNickname(nickname) {
  localStorage.setItem('vote_user_nickname', nickname)
}