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

    animation0: {},
    animation1: {},
    size: 5
  },

  basicAnimation(){
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    return animation
  },

  tap0(e){
    console.log(e)
    this.setData({
      animation0: this.basicAnimation().scale(1.2).step().export()
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    for(let i=0; i<this.data.gallery.length; i++){
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