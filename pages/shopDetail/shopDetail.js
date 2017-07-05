// pages/shopDetail/shopDetail.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: null,
    showQuit: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.fetchShop(options)
    // wx.request({
    //   url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop_detail',
    //   method: 'POST',
    //   data: {
    //     shop_id: options.shop_id
    //   },
    //   success: function (res) {
    //     let data = res.data
    //     data.total = data.man_in + data.female_in
    //     that.setData({
    //       shop: data
    //     })        
    //   }
    // })
    if(app.globalData.storeInfo === null){
      that.setData({
        showQuit: false
      })
    }
  },

  fetchShop(options){
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
        that.toFetch(coordinate, options)
        clearInterval(interval)
      }
    }, 500)
  },

  toFetch(coordinate, options){
    let that = this
    wx.request({
      url: app.requestHost + 'Store/store_info/',
      method: 'POST',
      data: {
        store_id: options.store_id,
        longitude: coordinate.longitude,
        latitude: coordinate.latitude
      },
      success: function(res){
        if(res.data.code === 201){
          that.setData({
            shop: res.data.result
          })
          wx.hideLoading()
        }
      }
    })
  },

  mapNavigation(){
    let shop = this.data.shop
    console.log(shop)
    wx.openLocation({
      latitude: shop.store_latitude,
      longitude: shop.store_longitude,
      scale: 20,
      name: shop.store_name,
      address: shop.address
    })
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone,
    })
  },

  quit(){
    let storeInfo = app.globalData.storeInfo
    wx.request({
      url: app.requestHost + 'Store/logout_store/',
      data: {
        token: app.TOKEN,
        store_id: storeInfo.storeId,
        table_id: storeInfo.table_id
      },
      success: function(res){
        console.log(res)
        // if(res.data.code === 201){
          wx.redirectTo({
            url: '/pages/nearlist/nearlist',
          })
        // }
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
    return {
      title: this.data.shop.store_name,
      path: '/pages/shopDetail/shopDetail',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})