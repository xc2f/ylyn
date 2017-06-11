// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gallery: [
      '/images/man.jpg',
      '/images/female.jpg',
      '/images/boy.png',
      '/images/girl.png',
      '/images/banner.png',
      '/images/coffee.png'
    ],
    size: 6,

    tx0: 0,
    tx1: 50,
    tx2: 100,
    tx3: 150,
    tx4: 200,
    tx5: 250,
    // ty: 50,
    // tz: 0
    currentPic: 1,
  },

  basicAnimation() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    return animation
  },

  prev() {
    if (this.data.currentPic > 0) {
      this.setData({
        tx0: this.data.tx0 + 50,
        tx1: this.data.tx1 + 50,
        tx2: this.data.tx2 + 50,
        tx3: this.data.tx3 + 50,
        tx4: this.data.tx4 + 50,
        tx5: this.data.tx5 + 50,
        currentPic: this.data.currentPic - 1
      })
    }
  },

  next() {
    if (this.data.currentPic < this.data.size-2) {
      this.setData({
        tx0: this.data.tx0 - 50,
        tx1: this.data.tx1 - 50,
        tx2: this.data.tx2 - 50,
        tx3: this.data.tx3 - 50,
        tx4: this.data.tx4 - 50,
        tx5: this.data.tx5 - 50,
        currentPic: this.data.currentPic + 1
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    for (let i = 0; i < this.data.gallery.length; i++) {
      this.setData({

      })
    }

    console.log(this.data.gallery)
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