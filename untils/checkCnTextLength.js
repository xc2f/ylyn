export default function checkCnText(str) {
  var reg = /[\u4e00-\u9fa5]/g
  if (reg.test(str)) {
    return true
  } else {
    return false
  }
}