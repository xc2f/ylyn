// pages/shopDetail/shopDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.request({
      url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop_detail',
      method: 'POST',
      data: {
        shop_id: options.shop_id
      },
      success: function (res) {
        let data = res.data
        data.total = data.man_in + data.female_in
        that.setData({
          shop: data
        })        
      }
    })
  },

  mapNavigation(){
    let shop = this.data.shop
    wx.openLocation({
      latitude: shop.coordinate.latitude,
      longitude: shop.coordinate.longitude,
      scale: 20,
      name: shop.shop_name,
      address: shop.address
    })
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone,
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