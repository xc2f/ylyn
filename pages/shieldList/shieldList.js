let app = getApp()
// pages/shieldList/shieldList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: null,
    listLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
            list: res.data.result,
            listLength: res.data.result.length
          })
        }
      }
    })
  },

  cancleShield(e){
    let that = this
    let friendInfo = e.currentTarget.dataset.friendinfo
    let idx = e.currentTarget.dataset.idx
    wx.request({
      url: app.requestHost + 'Chat/cancel_shield/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        tuser_id: friendInfo.user_id,
        chat_id: friendInfo.chat_id
      },
      success: function(res){
        if(res.data.code === 201){
          let tempList = that.data.list
          tempList.splice(idx, 1)
          that.setData({
            list: tempList,
            listLength: tempList.length
          })

          // 更新缓存
          let now = new Date().getTime()
          let postData = {
            type: 'shield',
            content: '您已取消屏蔽',
            msgId: now + '-' + app.globalData.userId,
            user_id: app.globalData.userId,
            status: 'sendOk',
            time: now
          }
          wx.getStorage({
            key: 'chatWith' + friendInfo.user_id,
            success: function(res) {
              console.log(res)
              let messages = res.data
              messages.push(postData)
              wx.setStorage({
                key: 'chatWith' + friendInfo.user_id,
                data: messages
              })
            },
          })
          getApp().refreshChatRecords({
            newMessage: postData,
            friendInfo: friendInfo,
            // 不传storeInfo是否可行
            // storeInfo: app.globalData.storeInfo
          }, true)

          wx.setStorageSync('chatStatusWith' + friendInfo.user_id, {
            isShield: false
          })
        }
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
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
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
  // onShareAppMessage: function () {
  
  // }
})