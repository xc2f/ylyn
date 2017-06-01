Page({

  /**
   * 页面的初始数据
   */
  data: {
    bH: null,
    animateRotate: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        that.setData({
          // 减去banner的高度
          bH: res.windowHeight-200
        })
      }
    })
  },

  rotateStep() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    animation.rotateX(-90).step()
    this.setData({
      animateRotate: animation.export()
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