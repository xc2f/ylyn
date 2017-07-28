// pages/nearlist/nearlist.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    request_fail: false,
    shopList: [],
    shopListEmpty: true,
    showMeIcon: false,
    hasNewMsg: false,
    getMsgStatusInterval: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let op = options.op
    let that = this

    if(op === 'nologin'){
      that.fetchShopList()
    } else {
      // wx.showLoading({
      //   title: '登陆中',
      //   // mask: true
      // })
      let tick = 0
      let checkClientId = setInterval(function () {
        if (app.globalData.userId !== null) {
          that.fetchShopList()
          clearInterval(checkClientId)
        } 
      }, 50)
    }

    let checkLogin = setInterval(function(){
      if(app.globalData.userId !== null){
        that.setData({
          showMeIcon: true
        })
        clearInterval(checkLogin)
      }
    }, 500)
  },

  fetchShopList() {
    let that = this;
    wx.showLoading({
      title: '数据获取中，请稍后',
      // mask: true
    })
    app.getLocation()
    let tick = 0
    let interval = setInterval(function () {
      if (app.globalData.coordinate !== null) {
        let coordinate = app.globalData.coordinate
        // 获取到坐标请求
        that.toFetch(coordinate)
        clearInterval(interval)
      } 
      
    }, 500)
  },

  toFetch(coordinate){
    let that = this
    wx.request({
      url: app.requestHost + 'Store/store_list/',
      method: 'POST',
      data: {
        longitude: coordinate.longitude,
        latitude: coordinate.latitude
      },
      success: function (res) {
        // console.log(res)
        let result = res.data.result
        // console.log(result)
        // console.log(res)
        // if(res.data.code === 201){
        //   wx.hideLoading()
        // }
        wx.hideLoading()
        if (result !== false) {
          that.setData({
            shopList: result.store_list,
            shopListEmpty: false
          })
        } else {
          that.setData({
            shopListEmpty: true
          })
        }
        wx.stopPullDownRefresh()
      },
      fail: function () {
        that.setData({
          request_fail: true
        })
      }
    })
  },

  toMe() {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + app.globalData.userId,
    })
  },

  toMsgList() {
    wx.navigateTo({
      url: '/pages/msgList/msgList',
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
    let that = this
    that.data.getMsgStatusInterval = setInterval(function () {
      that.setData({
        hasNewMsg: !app.globalData.msgClean
      })
    }, 2000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.fetchShopList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      title: '你附近有这些商家',
      path: '/pages/nearlist/nearlist',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})