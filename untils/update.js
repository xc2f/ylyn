/**
 * 把以下字段替换成自己的cos相关信息，详情可看API文档 https://www.qcloud.com/document/product/436/6066
 * REGION: cos上传的地区
 * APPID: 账号的appid
 * BUCKET_NAME: cos bucket的名字
 * DIR_NAME: 上传的文件目录
 * cosSignatureUrl：填写自己的鉴权服务器地址，查看前面的[准备工作]
 */

var app = getApp()

var REGION = 'sh'
var APPID = '1253743657'
var BUCKET_NAME = 'yuanlinela'

var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME


function getSignature(type, dirName, callback) {
  // 鉴权获取签名
  wx.request({
    url: app.requestHost + 'User/get_upload_sign/',
    method: 'POST',
    data: {
      token: app.TOKEN,
      file_name: dirName,
      type: type
    },
    success: function (res) {
      callback(res)
    }
  })
}
/**
 * 上传文件
 * filePath: 上传的文件路径
 * dirName: 上传到cos的目录
 * fileName： 上传到cos后的文件名
 * type: 单次和多次签名
 * op: 操作类型
 */
export const upload = function (dirName, filePath, fileName, callback) {
  getSignature(2, dirName, res => {
    let signal = res.data.result.upload_token
    console.log(signal)
    // 头部带上签名，上传文件至COS
    wx.uploadFile({
      url: cosUrl + '/' + dirName + '/' + fileName,
      // url: 'http://192.168.0.119:3000',
      filePath: filePath,
      header: { 'Authorization': signal},
      name: 'avatar',
      formData: { op: 'upload' },
      success: function (res) {
        console.log(JSON.parse(res.data))
      },
      fail: function(err){
        console.log(err)
      }
    })
  })
}

// 删除文件
export const deleteFile = function (dirName, fileName, callback){
  getSignature(1, dirName, res => {
    let signal = res.data.result.upload_token
    wx.request({
      url: cosUrl + '/' + dirName + '/' + fileName,
      method: 'POST',
      header: { 'Authorization': signal },
      data: {
        'op': 'delete'
      },
      success: function(res){
        console.log(res)
      }
    })
  })
}

// 获取文件属性
export const getFileInfo = function (dirName, fileName, callback) {
  getSignature(2, dirName, res => {
    let signal = res.data.result.upload_token
    wx.request({
      url: cosUrl + '/' + dirName + '/' + fileName + '?op=stat',
      method: 'GET',
      header: { 'Authorization': signal },
      // data: {
      //   'op': 'delete'
      // },
      success: function (res) {
        console.log(res)
      }
    })
  })
}