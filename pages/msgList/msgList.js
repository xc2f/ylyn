// pages/msgList/msgList.js
let app = getApp()
import { deleteFile } from '../../untils/update.js'

import fromNow from '../../untils/moment.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatRecords: null,
    isFullStorage: false,
    moveXStamp: 0,
    wrapAnimation: {},
    removeAnimation: {},
    toLeft: true,
    checkMsgStatusInterval: null,
    testSrc: null,
    showShield: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.renderList()

    that.computeFileSize()
    
    // setTimeout(function(){
      // console.log(that.data.chatRecords.friendInfo.age)
    // }, 1000)
  },

  checkShield(){
    let that = this
    wx.request({
      url: app.requestHost + 'Chat/get_shield_list/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success: function (res) {
        console.log(res)
        if (res.data.result.length !== 0) {
          that.setData({
            showShield: true
          })
        } else {
          that.setData({
            showShield: false
          })
        }
      }
    })
  },

  closesocket(){
    wx.closeSocket()
  },
  computeFileSize(){
    let that = this
    // 获取本地缓存和文件大小
    wx.getStorageInfo({
      success: function (res) {
        let limitSize = res.limitSize
        let storageSize = res.currentSize
        wx.getSavedFileList({
          success: function (res) {
            let fileSize = 0
            for (let i = 0; i < res.fileList.length; i++) {
              fileSize += res.fileList[i].size / 1000
            }
            let totalSize = storageSize + fileSize
            console.log('totalSize: ' + totalSize)
            if (totalSize > limitSize - 1024 * 2) {
              that.setData({
                isFullStorage: true
              })
            }
          }
        })
      },
    })
  },

  renderList(){
    let that = this
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        let recordList = []
        // 获取每条聊天记录的最后一条内容
        for (let i = 0; i < records.length; i++) {
          // 防止异步
          let msg = wx.getStorageSync(records[i].chatName)
          // console.log(msg)
          let newestMsg = msg[msg.length - 1]
          // console.log(msg)
          if (newestMsg.type === 'text') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'img') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[图片]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'face') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[表情]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'shield') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'card') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          }
        }
        that.setData({
          chatRecords: recordList.length === 0 ? null : recordList
        })
      },
      fail: function (res) {
        console.log('no records')
      }
    })
  },

  // parseDate(date){
  //   let msgTime = new Date(date)
  //   let today = new Date().getDate()
  //   if(today === msgTime.getDate() ) {
  //     return msgTime.getHours() + ':' + (msgTime.getMinutes() < 10 ? ('0' + msgTime.getMinutes()) : msgTime.getMinutes())
  //   } else if (today === msgTime.getDate() + 1) {
  //     return '昨天'
  //   } else {
  //     return (msgTime.getMonth()+1) + '月' + msgTime.getDate() + '日'
  //   }
  // },

  tapToChat(e){
    wx.navigateTo({
      url: '/pages/chat/chat?friendinfo='+JSON.stringify(e.currentTarget.dataset.friendinfo)
    })
  },

  removeChat(e) {
    let userId = e.currentTarget.dataset.userid
    wx.getStorage({
      key: 'chatWith'+userId,
      success: function(res) {
        for(let i=0; i<res.data.length; i++){
          if(res.data[i].type === 'img'){
            wx.removeSavedFile({
              filePath: res.data[i].content,
              complete: function (res) {
              }
            })
          }
        }
        // TODO删除对话缓存中的链接的图片
      },
    })

    // 删除具体缓存
    wx.removeStorage({
      key: 'chatWith'+userId,
      success: function(res) {
        console.log('chatWith' + userId + '已删除!')
      },
    })
    // 从chatRecords中移除该key
    wx.getStorage({
      key: 'chatRecords',
      success: function(res) {
        let data = res.data
        for(let i=0; i<data.length; i++){
          if(data[i].chatName === 'chatWith'+userId){
            data.splice(i, 1)
            wx.setStorageSync('chatRecords', data)
            break
          }
        }
      },
    })

    let that = this
    setTimeout(function(){
      that.renderList()
    }, 500)

    that.computeFileSize()
  },

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  blockMove(e){
    let mx = e.changedTouches[0].pageX
    let moveXStamp = this.data.moveXStamp
    if (moveXStamp === 0) {
      this.setData({
        moveXStamp: mx
      })
    }
    if (mx < moveXStamp && this.data.toLeft) {
      // 只调用一次
      this.setData({
        wrapAnimation: this.basicAnimation(300, 0).left(-100).step().export(),
        removeAnimation: this.basicAnimation(300, 0).right(0).step().export(),
        toLeft: false
      })
    } else {
      this.setData({
        wrapAnimation: this.basicAnimation(300, 0).left(0).step().export(),
        removeAnimation: this.basicAnimation(300, 0).right(-100).step().export(),
        toLeft: true
      })
    }
    // console.log('mx: '+mx, 'moveXStamp: '+moveXStamp)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    that.data.checkMsgStatusInterval = setInterval(function(){
      that.renderList()
    }, 3000)

    // 检查是否有屏蔽用户
    that.checkShield()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
    clearInterval(that.data.checkShieldInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
    clearInterval(that.data.checkShieldInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },

  clearStorage(){
    wx.clearStorage()
  },

  cstp(){
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        var reader = new FileReader();
        reader.readAsDataURL(new Blob(tempFilePaths))
        reader.onload = function(e){
          var arrayBuffer = reader.result;
          console.log(arrayBuffer)
          // var base64 = wx.arrayBufferToBase64(arrayBuffer)
          that.setData({
            testSrc: arrayBuffer
          })
        }
        // var reader = new FileReader();
        // reader.onload = function (e) {
        //   var arrayBuffer = reader.result;
        //   var base64 = wx.arrayBufferToBase64(arrayBuffer)
        //   console.log("base64===:" + base64);
        // }
      }
    })
  },

  delcos(){  

  deleteFile('userAvatar', 'http://sh.file.myqcloud.com/files/v2/1253743657/yuanlinela/userAvatar/avatar-ba964cda-d4cc-355a-14fe-59439868c188-1499325633335.pngs')

  }


})