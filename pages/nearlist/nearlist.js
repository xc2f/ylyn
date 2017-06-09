// pages/nearlist/nearlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    request_fail: false,
    shopList: [],
    shopListEmpty: true,
    showMeIcon: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.fetchShopList()

    // 如果本机存有用户个人信息，说明登录过，显示下面的个人信息和消息列表图标
    wx.getStorage({
      key: 'meInfo',
      success: function(res) {
        that.setData({
          showMeIcon: true
        })
      },
      fail: function(e) {
        that.setData({
          showMeIcon: false
        })
      }
    })
  },

  fetchShopList(){
    let that = this;
    wx.showLoading({
      title: '数据获取中，请稍后',
    })

    // 定位
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let coordinate = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        wx.request({
          url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/nearlist',
          method: 'POST',
          data: coordinate,
          success: function (res) {
            // console.log(res)
            if (res.statusCode === 200) {
              wx.hideLoading()
              if (res.data.length !== 0) {
                that.setData({
                  shopList: res.data,
                  shopListEmpty: false
                })
              } else {
                that.setData({
                  shopListEmpty: true
                })
              }
            }
          },
          fail: function () {
            that.setData({
              request_fail: true
            })
          }
        })
      },
    })
  },

  toMe() {
    wx.navigateTo({
      url: '/pages/user/user',
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