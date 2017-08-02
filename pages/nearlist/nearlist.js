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
    getMsgStatusInterval: null,

    showLogin: false,
    showTip: '附近无可用商家',
    showLoading: false,
    login: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let op = options.op
    let that = this

    // if (op === 'nologin') {
    //   that.fetchShopList()
    // } else {
    if(app.globalData.userId){
      that.setData({
        showMeIcon: true,
        showLogin: false,
        login: true
      })
      that.fetchShopList()
    }else{
      let token = wx.getStorageSync('TOKEN')
      if (token) {
        wx.showLoading({
          title: '登录中',
        })
        app.TOKEN = token
        if (app.globalData.client_id) {
          app.login(success => {
            if (success) {
              that.setData({
                showMeIcon: true,
                showLogin: false,
                login: true
              })
              that.fetchShopList()
            }
          })
        } else {
          app.connectWebsocket('auto', null, login => {
            // console.log(login)
            if (login) {
              wx.hideLoading()
              that.setData({
                showMeIcon: true,
                showLogin: false,
                login: true
              })
              that.fetchShopList()
            } else {
              wx.hideLoading()
              wx.showToast({
                title: '登录失败',
              })
            }
          })
        }
      } else {
        that.setData({
          showLogin: true
        })
        that.fetchShopList()
      }
    }
    // }
  },


  getUserInfo(res) {
    let that = this
    let detail = res.detail
    // console.log(detail)
    if (detail.rawData) {
      that.setData({
        showLogin: false,
        showLoading: true,
        showTip: '登陆中',
      })
      app.manualLogin(detail.encryptedData, detail.iv, res => {
        if (res) {
          that.setData({
            showMeIcon: true,
            showLogin: false,
            login: true,
            showLoading: false,
            showTip: '登录成功，数据获取中'
          })
          // that.fetchShopList()
        } else {
          that.setData({
            showMeIcon: false,
            showLogin: true,
            showLoading: false,
            showTip: '登录失败，请重试'
          })
        }
      })
    } else {
    }
  },

  fetchShopList() {
    wx.showLoading({
      title: '数据获取中',
    })
    let that = this;
    let coordinate = app.globalData.coordinate
    app.getLocation(res => {
      if (res === '获取成功') {
        let coordinate = app.globalData.coordinate
        // 是否在本店
        that.toFetch(coordinate)
      } else if (res === '取消授权') {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        that.setData({
          showTip: '获取不到您的位置，请刷新重试',
        })
      } else if (res === '获取中') {
        // that.setData({
        //   showTip: '店铺正马不停蹄地向你赶来'
        // })
      } else {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        that.setData({
          showTip: '位置获取失败，请重试'
        })
      }
    })
  },

  toFetch(coordinate) {
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
            shopListEmpty: false,
          })
        } else {
          that.setData({
            shopListEmpty: true,
            showTip: '附近无可用店铺'
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
    this.setData({
      showTip: '数据获取中'
    })
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