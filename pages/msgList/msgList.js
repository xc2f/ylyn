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
              date: newestMsg.date
            })
          } else {

          }
        }
        that.setData({
          chatRecords: recordList
        })
      },
      fail: function (res) {
        console.log('no records')
      }
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