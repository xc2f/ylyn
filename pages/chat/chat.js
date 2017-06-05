// pages/chat/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toTop: 0,
    systemInfo: null,
    chatBodyHeight: 0,
    
    isFocus: false,
    inputValue: '',
    userInfo: null,
    friendInfo: null,
    messages: [
      {
        user_id: 7,
        content: 'hello',
        date: '1496647266112'
      },
      {
        user_id: 2,
        content: 'hi',
        date: '1496647271712'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          systemInfo: res,
          // 屏幕高度减去chatBar的高度，为消息窗口高度
          chatBodyHeight: res.windowHeight - 50
        })
      }
    })
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.setData({
      friendInfo: JSON.parse(options.friend)
    })

    // 获取聊天信息
    wx.getStorage({
      key: 'chatWith'+that.data.friendInfo.user_id,
      success: function(res) {

      },
      fail: function(e) {
        console.log(e)
      }
    })
  },

  inputFocus() {
    this.setData({
      isFocus: true
    })
  },

  inputBlur(){
    this.setData({
      isFocus: false
    })
  },

  inputHandle(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  submit() {
    let tempMessageList = this.data.messages;
    tempMessageList.push({
      user_id: this.data.userInfo.user_id,
      content: this.data.inputValue,
      date: new Date().getTime()
    })
    this.setData({
      messages: tempMessageList,
      inputValue: ''
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
  onShareAppMessage: function () {
  
  }
})