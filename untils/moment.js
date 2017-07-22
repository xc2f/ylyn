export default function fromNow(date){
  let time = (new Date(date).getHours()) + ':' + ((new Date(date).getMinutes() < 10) ? ('0' + new Date(date).getMinutes()) : new Date(date).getMinutes())
  let now = new Date().getTime()
  let interval = now - date
  let oneMinute = 1000 * 60
  let oneHour = oneMinute * 60
  let oneDay = oneHour * 24
  if(interval < oneMinute){
    return Math.floor(interval / 1000) + '秒前'
  } else if (interval < oneHour){
    return Math.floor(interval / oneMinute) + '分钟前'
  } else if (interval < oneDay) {
    return Math.floor(interval / oneHour) + '小时前'
  } else {
    if (interval < oneDay * 2){
      return '昨天 ' + time
    } else if(interval < oneDay * 3){
      return '前天' + time
    } else {
      return (new Date(date).getMonth() + 1) + '月' + new Date(date).getDate() + '日 ' + time
    }
  }
}

export const computeTime = function(date){
  let time = (new Date(date).getHours()) + ':' + ((new Date(date).getMinutes() < 10) ? ('0' + new Date(date).getMinutes()) : new Date(date).getMinutes())
  let now = new Date().getTime()
  let interval = now - date
  let oneMinute = 1000 * 60
  let oneHour = oneMinute * 60
  let oneDay = oneHour * 24
  if (interval < oneDay) {
    return time
  } else {
    if (interval < oneDay * 2) {
      return '昨天 ' + time
    } else if (interval < oneDay * 3) {
      return '前天' + time
    } else {
      return (new Date(date).getMonth() + 1) + '月' + new Date(date).getDate() + '日 ' + time
    }
  }
}