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
      let checkClientId = setInterval(function () {
        if (app.globalData.client_id !== null) {
          app.login(that.fetchShopList, app.globalData.client_id)
          clearInterval(checkClientId)
        }
      }, 50)
    }

    
    // that.fetchShopList()
    // 如果本机存有用户个人信息，说明登录过，显示下面的个人信息和消息列表图标
    // wx.getStorage({
    //   key: 'meInfo',
    //   success: function (res) {
    //     that.setData({
    //       showMeIcon: true
    //     })
    //   },
    //   fail: function (e) {
    //     that.setData({
    //       showMeIcon: false
    //     })
    //   }
    // })

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
    })
    // app.getLocation()
    let interval = setInterval(function () {
      if (app.globalData.coordinate !== null) {
        let coordinate = app.globalData.coordinate
        // app.globalData.coordinate = null
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
      // url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/nearlist',
      method: 'POST',
      data: {
        longitude: coordinate.longitude,
        latitude: coordinate.latitude
      },
      success: function (res) {
        console.log(res)
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
    }, 500)
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
      console.log(res.target)
    }
    return {
      title: '你附近有这些商家',
      path: '/pages/nearList',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})