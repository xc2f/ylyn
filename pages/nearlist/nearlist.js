// pages/nearlist/nearlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    request_fail: false,
    shopList: [],
    shopListEmpty: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showLoading({
      title: '数据获取中，请稍后',
    })
    wx.request({
      url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/nearlist',
      success: function(res) {
        // console.log(res)
        if (res.statusCode === 200) {
          wx.hideLoading()
          if(res.data.length !== 0) {
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
      fail: function() {
        that.setData({
          request_fail: true
        })
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
  onShareAppMessage: function () {
  
  }
})