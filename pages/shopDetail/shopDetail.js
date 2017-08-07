// pages/shopDetail/shopDetail.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: null,
    showQuit: false,
    foodEmpty: false,
    dataOk: false,
    showShare: false,
    // checkShopValue: null
    shareAnimation: null,
    windowWidth: 300
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      windowWidth: app.globalData.deviceInfo.windowWidth
    })

    that.fetchShop(options)
  },

  fetchShop(options){
    let that = this;
    let coordinate = app.globalData.coordinate
    if (coordinate){
      wx.showLoading({
        title: '数据获取中，请稍后',
      })
      // 是否在本店
      that.toFetch(coordinate, options)
    }else {
      wx.showLoading({
        title: '数据获取中，请稍后',
      })
      app.getLocation(res => {
        if (res === '获取成功') {
          let coordinate = app.globalData.coordinate
          // 是否在本店
          that.toFetch(coordinate, options)
        } else if (res === '取消授权') {
          that.setData({
            showTip: '您未授权，请重新授权后重试'
          })
        } else if (res === '获取中') {
          // that.setData({
          //   showTip: '店铺正马不停蹄地向你赶来'
          // })
        } else {
          that.setData({
            showTip: '位置获取失败，请重试'
          })
        }
      })
    }
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
          // 设置导航条
          wx.setNavigationBarTitle({
            title: res.data.result.store_name
          })
          let result = res.data.result
          let gStoreInfo = app.globalData.storeInfo
          if (gStoreInfo !== null && gStoreInfo.storeId == result.store_id) {
            that.setData({
              showQuit: true
            })
          }
          result.activity = result.activity ? result.activity : {}
          result.activity.activity_content = (!result.activity || result.activity.length === 0) ? '' : result.activity.activity_content.replace(/\n/g, '<br>')
          result.food = result.food.length === 0 ? 0 : result.food
          that.setData({
            shop: result,
            dataOk: true
          })
          wx.hideLoading()
        } else if (res.data.code === 101){
          wx.showModal({
            title: '提示',
            content: '商家已关闭服务',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/nearlist/nearlist',
                })
              }
            }
          })
        }
      },
    })
  },

  mapNavigation(){
    let shop = this.data.shop
    // console.log(shop)
    // this.data.checkShopValue = setInterval(() => {
      wx.openLocation({
        latitude: parseFloat(shop.store_latitude),
        longitude: parseFloat(shop.store_longitude),
        scale: 20,
        name: shop.store_name,
        address: shop.address,
        success: function(res){
          // console.log(res)
        },
        fail: function(err) {
          // console.log(err)
        }
      })
    // }, 200)
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone,
    })
  },

  quit(){
    let storeInfo = app.globalData.storeInfo
    // console.log(storeInfo)
    wx.request({
      url: app.requestHost + 'Store/logout_store/',
      data: {
        token: app.TOKEN,
        store_id: storeInfo.storeId,
        table_id: storeInfo.tableId
      },
      success: function(res){
        // console.log(res)
        if(res.data.code === 201 || res.data.code === 102){
          app.globalData.storeInfo = null
          wx.reLaunch({
            url: '/pages/nearlist/nearlist',
          })
        }
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

  closeShare(e){
    if(e.target.id !== 'share'){
      this.setData({
        showShare: false
      })
    }
  },

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (app.globalData.noShowShare){
      app.globalData.noShowShare = false
        this.setData({
          showShare: true,
        })
        setTimeout(() => {
          this.setData({
            shareAnimation: this.basicAnimation(500, 0).scale(1).step().export()
          })
        }, 50)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.shop.store_name,
      path: '/pages/shopDetail/shopDetail?store_id='+this.data.shop.store_id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})