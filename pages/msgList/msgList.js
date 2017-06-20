// pages/msgList/msgList.js

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
    toLeft: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.renderList()

    that.computeFileSize()
    
    // setTimeout(function(){
    //   console.log(that.data.chatRecords.length === 0)
    // }, 1000)
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
          let newestMsg = msg[msg.length - 1]
          console.log(newestMsg)
          if (newestMsg.type === 'text') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              date: that.parseDate(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'img') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[图片]',
              date: that.parseDate(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'face') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[表情]',
              date: that.parseDate(newestMsg.time),
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

  parseDate(date){
    let msgTime = new Date(date)
    let today = new Date().getDate()
    if(today === msgTime.getDate() ) {
      return msgTime.getHours() + ':' + (msgTime.getMinutes() < 10 ? ('0' + msgTime.getMinutes()) : msgTime.getMinutes())
    } else if (today === msgTime.getDate() + 1) {
      return '昨天'
    } else {
      return (msgTime.getMonth()+1) + '月' + msgTime.getDate() + '日'
    }
  },

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
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('msg hide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('msg unload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    return false;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})