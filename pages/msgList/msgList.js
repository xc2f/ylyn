// pages/msgList/msgList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatRecords: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        let recordList = []
        // 获取每条聊天记录的最后一条内容
        for(let i=0; i<records.length; i++){
          // 防止异步
          let msg = wx.getStorageSync(records[i].chatName)
          let newestMsg = msg[msg.length-1]
          if (newestMsg.type === 'mult') {
            recordList.push({
              friend_id: newestMsg.friend_id,
              newestMsg: newestMsg.content[0].content,
              date: that.parseDate(newestMsg.date),
              msgClean: records[i].msgClean
            })
          } else {

          }
        }
        that.setData({
          chatRecords: recordList
        })
        console.log(that.data.chatRecords)
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
      url: '/pages/chat/chat?friend='+e.currentTarget.dataset.userid,
    })
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