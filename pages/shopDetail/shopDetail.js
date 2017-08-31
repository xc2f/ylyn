// pages/shopDetail/shopDetail.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: null,
    foodWidth: 170,
    inSale: false,
    storeId: null,
    showQuit: false,
    foodEmpty: false,
    dataOk: false,
    showShare: false,
    // checkShopValue: null
    shareAnimation: null,
    windowWidth: 375,
    
    dataOk: false,
    fetchDataFail: false,

    showFoodsAnimation: null,
    rotateArrowAnimation: null,

    showTopInfo: true,
  },

  showFoods: true,
  toogleFoodsHeight: 0,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      windowWidth: app.globalData.deviceInfo.windowWidth,
      storeId: options.store_id,
      foodWidth: (app.globalData.deviceInfo.windowWidth - 20) / 2 - 5
    })

    that.getCurrentLocation(options)
  },

  getCurrentLocation(options){
    let that = this;
    // 先获取数据， 如果未定位（分享入口进），定位后再获取数据
    that.toFetch()
    let coordinate = app.globalData.coordinate
    if (coordinate){

    } else {
      app.getLocation(res => {
        if(res) {
          that.toFetch()
        }
      })
    }
  },

  toFetch(){
    let that = this
    let coordinate = app.globalData.coordinate
    wx.showLoading({
      title: '数据获取中',
    })
    wx.request({
      url: app.requestHost + 'Store/store_info/',
      method: 'POST',
      data: {
        store_id: that.data.storeId,
        longitude: coordinate ? coordinate.longitude : '',
        latitude: coordinate ? coordinate.latitude : ''
      },
      success: function(res){
        wx.hideLoading()
        if(res.data.code === 201){
          let result = res.data.result
          console.log(result)
          // 设置导航条
          wx.setNavigationBarTitle({
            title: result.store_name
          })

          let globalData = app.globalData.storeInfo

          // TODO showQuit， how to quit
          if (globalData !== null && globalData.storeId == result.store_id) {
            that.setData({
              showQuit: true
            })
          }

          if (result.activity){
            if (result.activity.is_open != 0){
              // open   
              result.activity.activity_content = result.activity.activity_content.replace(/\n/g, '<br>')
              that.setData({
                inSale: true
              })
            } else {
              // not open
              that.setData({
                inSale: false
              })
            }
          } else {
            // not open
            that.setData({
              inSale: false
            })
          }

          // TODO
          // result.activity = result.activity ? result.activity : {}
          // result.activity.activity_content = (!result.activity || result.activity.length === 0) ? '' : result.activity.activity_content.replace(/\n/g, '<br>')

          result.food = result.food.length === 0 ? 0 : result.food

          that.setData({
            shop: result,
            dataOk: true,
            fetchDataFail: false
          })

          if (result.food){
            let foodLength = result.food.length
            // 70 == 图片上下2*5个padding + 文字50的height + item 10 的margin-bottom
            // 在图片box-shadow处有未知的3~5个高度，ios和开发工具尤甚
            if (app.globalData.deviceInfo.platform === 'android'){
              that.toogleFoodsHeight = Math.ceil(foodLength / 2) * (200 * that.data.foodWidth / 240 + 72)
            } else {
              that.toogleFoodsHeight = Math.ceil(foodLength / 2) * (200 * that.data.foodWidth / 240 + 75)
            }
          }

        } else if (res.data.code === 101){
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/nearlist/nearlist',
                })
              }
            }
          })
        } else {
          that.setData({
            dataOk: false,
            fetchDataFail: true
          })
        }
      },
      fail: function(){
        wx.hideLoading()
        that.setData({
          dataOk: false,
          fetchDataFail: true
        })
      }
    })
  },

  occurFail(){
    this.setData({
      fetchDataFail: false,
    })
    this.getCurrentLocation({storeId: this.data.storeId})
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

  toggleFoods(e){
    let that = this
    // if (foodLength % 2 === 1){
    //   foodLength += 1
    // }
    if(that.showFoods){
      that.showFoods = false
      // showFoodsAnimation
      that.setData({
        showFoodsAnimation: that.basicAnimation(700, 0).height(0).step().export(),
        rotateArrowAnimation: that.basicAnimation(300, 0).rotate(0).step().export()
      })
    } else {
      that.showFoods = true
      that.setData({
        showFoodsAnimation: that.basicAnimation(500, 0).height(that.toogleFoodsHeight).step().export(),
        rotateArrowAnimation: that.basicAnimation(300, 0).rotate(90).step().export()
      })
    }
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