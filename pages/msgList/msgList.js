// pages/msgList/msgList.js
let app = getApp()
import { deleteFile } from '../../untils/update.js'

import fromNow from '../../untils/moment.js'

// import wxviewType from '../../untils/wxview.js'

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
    showShield: false,

    startX: 0, //开始坐标
    startY: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.renderList()

    that.computeFileSize()

  },

  checkShield() {
    let that = this
    wx.request({
      url: app.requestHost + 'Chat/get_shield_list/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success: function (res) {
        // console.log(res)
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

  closesocket() {
    wx.closeSocket()
  },
  computeFileSize() {
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
            // console.log('totalSize: ' + totalSize)
            if (totalSize > limitSize - 1024 * 2) {
              that.setData({
                isFullStorage: true
              })
            } else {
              that.setData({
                isFullStorage: false
              })
            }
          }
        })
      },
    })
  },

  toShop(e) {
    if (e.currentTarget.dataset.shopid){
      wx.navigateTo({
        url: '/pages/shopDetail/shopDetail?store_id=' + e.currentTarget.dataset.shopid,
      })
    }
  },

  renderList() {
    let that = this
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        // console.log(res)
        let records = res.data
        let recordList = []
        // 获取每条聊天记录的最后一条内容
        for (let i = 0; i < records.length; i++) {
          // console.log(records[i])
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
              msgClean: records[i].msgClean,
              isTouchMove: that.data.chatRecords ? (records[i].friendInfo.user_id === that.data.chatRecords[i].friendInfo.user_id ? that.data.chatRecords[i].isTouchMove : false) : false //默认全隐藏删除
            })
          } else if (newestMsg.type === 'img') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[图片]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              isTouchMove: that.data.chatRecords ? (records[i].friendInfo.user_id === that.data.chatRecords[i].friendInfo.user_id ? that.data.chatRecords[i].isTouchMove : false) : false //默认全隐藏删除
            })
          } else if (newestMsg.type === 'face') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[表情]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              isTouchMove: that.data.chatRecords ? (records[i].friendInfo.user_id === that.data.chatRecords[i].friendInfo.user_id ? that.data.chatRecords[i].isTouchMove : false) : false //默认全隐藏删除
            })
          } else if (newestMsg.type === 'shield') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              isTouchMove: that.data.chatRecords ? (records[i].friendInfo.user_id === that.data.chatRecords[i].friendInfo.user_id ? that.data.chatRecords[i].isTouchMove : false) : false //默认全隐藏删除
            })
          } else if (newestMsg.type === 'card') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              isTouchMove: that.data.chatRecords ? (records[i].friendInfo.user_id === that.data.chatRecords[i].friendInfo.user_id ? that.data.chatRecords[i].isTouchMove : false) : false //默认全隐藏删除
            })
          }
        }
        that.setData({
          chatRecords: recordList.length === 0 ? null : recordList,
        })
      },
      fail: function (res) {
        // console.log('no records')
      }
    })
  },


  tapToChat(e) {
    wx.navigateTo({
      url: '/pages/chat/chat?friendinfo=' + JSON.stringify(e.currentTarget.dataset.friendinfo)
    })
  },

  removeChat(e) {
    let userId = e.currentTarget.dataset.userid

    // 删除具体缓存
    wx.removeStorage({
      key: 'chatWith' + userId,
      success: function (res) {
        // console.log('chatWith' + userId + '已删除!')
      },
    })
    // 从chatRecords中移除该key
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let data = res.data
        for (let i = 0; i < data.length; i++) {
          if (data[i].chatName === 'chatWith' + userId) {
            data.splice(i, 1)
            break
          }
        }
        wx.setStorageSync('chatRecords', data)
      },
    })

    let that = this
    setTimeout(function () {
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
    that.renderList()
    that.data.checkMsgStatusInterval = setInterval(function () {
      that.renderList()
    }, 2000)

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

  clearStorage() {
    wx.clearStorage()
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.chatRecords.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      chatRecords: this.data.chatRecords
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.chatRecords.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      chatRecords: that.data.chatRecords
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

})