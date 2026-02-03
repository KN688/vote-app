// 格式化日期
export function formatDate(dateString) {
  if (!dateString) return '无限制'
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 计算倒计时
export function calculateCountdown(deadline) {
  const now = new Date().getTime()
  const diff = new Date(deadline).getTime() - now

  if (diff <= 0) return '已截止'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}

// 分享功能
export function shareVote(url, title) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch(console.error)
  } else {
    copyToClipboard(url)
    alert('链接已复制到剪贴板')
  }
}