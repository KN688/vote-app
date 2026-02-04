import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://umdbxzejzxlmtxskdacw.supabase.co'
const supabaseAnonKey = 'sb_publishable_Xd-E0EA4tC0_Je4vazzd5Q_V6Nkyso2'

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