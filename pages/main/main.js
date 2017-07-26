var app = getApp()

Page({

  pageName: 'shopMain',

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: null,
    store: null,
    userListLength: 0,
    qrcodeInfo: null,

    showMeSwitch: true,
    showShopSwitch: false,
    bannerSwitchAnimation: {},
    bannerSwitchTranslate: {},

    // 选择主页为店铺还是用户
    shopShow: true,
    userShow: false,

    tablesOpacityAnimation: {},
    userOpacityAnimation: {},

    filterShow: false,
    filterShowAnimation: {},
    filterGirlMoveLeftAnimation: {},
    filterBoyMoveRightAnimation: {},

    getMsgStatusInterval: null,
    hasNewMsg: false,

    callWaiterTimeout: 0,

    checkLocationInterval: null
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      qrcodeInfo: {
        store_id: options.store_id || 1,
        table_id: options.table_id || 3
        // store_id: 1,
        // table_id: 1,
      }
    })

    // 获取屏幕高度撑满下部滚动视图
    that.setData({
      deviceInfo: app.globalData.deviceInfo
    })

    // let token = wx.getStorageSync('TOKEN')
    // if(token === ''){
    //   app.login(that.fetchShopInfo, app.globalData.client_id)
    // } else {
    //   // 请求店铺信息
    //   that.fetchShopInfo()
    // }
    let tick = 0
    let checkLoginStatus = setInterval(function () {
      if (app.globalData.userId !== null) {
        that.fetchShopInfo()
        clearInterval(checkLoginStatus)
      }
      // else if (tick >= 600) {
      //   clearInterval(checkClientId)
      //   wx.showModal({
      //     title: '提示',
      //     content: '登录失败，请重试',
      //     success: function (res) {
      //       if (res.confirm) {
      //         // console.log('用户点击确定')
      //         app.login()
      //         that.onLoad({
      //           store_id: that.data.qrcodeInfo.store_id,
      //           table_id: that.data.qrcodeInfo.table_id,
      //         })
      //       } else if (res.cancel) {
      //         wx.redirectTo({
      //           url: '/pages/nearlist/nearlist?op=nologin',
      //         })
      //       }
      //     }
      //   })
      // }
      // tick++
    }, 50)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isInStore(coordinate){
    let that = this
    wx.request({
      url: app.requestHost + 'Store/check_address/',
      method: 'POST',
      data: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        token: app.TOKEN,
        store_id: that.data.qrcodeInfo.store_id,
        table_id: that.data.qrcodeInfo.table_id
      },
      success: function(res){
        console.log(res)
        wx.hideLoading()
        if(res.data.code === 201){
          that.toFetch(coordinate)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.code === 103 ? '您不在本店' : '商家已关闭服务',
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
      }
    })
  },

  fetchShopInfo(gender, currentPage){
    console.log('to fetch shop info')
    let that = this
    app.getLocation()
    let tick = 0
    let interval = setInterval(function () {
      // console.log('in interval')
      if (app.globalData.coordinate !== null) {
        console.log('get location success')
        let coordinate = app.globalData.coordinate
        // 是否在本店
        that.isInStore(coordinate, gender, currentPage)
        // app.globalData.coordinate = null
        // 获取到坐标请求
        clearInterval(interval)
      }
      //  else if (tick >= 60) {
      //   clearInterval(interval)
      //   wx.showModal({
      //     title: '提示',
      //     content: '获取位置失败，请重试',
      //     success: function (res) {
      //       if (res.confirm) {
      //         // console.log('用户点击确定')
      //         app.getLocation()
      //         that.onLoad({
      //           store_id: that.data.qrcodeInfo.store_id,
      //           table_id: that.data.qrcodeInfo.table_id,
      //         })
      //       } else if (res.cancel) {
      //         wx.redirectTo({
      //           url: '/pages/nearlist/nearlist?op=nologin',
      //         })
      //       }
      //     }
      //   })
      // }
      // tick++
    }, 500)

  },

  toFetch(coordinate, gender, currentPage){
    let that = this
    // wx.showLoading({
    //   title: '数据获取中',
    // })
    // let token = wx.getStorageSync('TOKEN')
    wx.request({
      // url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      url: app.requestHost + 'Store/store_user/',
      method: 'POST',
      data: {
        // longitude: 108.8871237 || coordinate.longitude,
        // latitude: 34.1863376 || coordinate.latitude,
        longitude: coordinate.longitude,
        latitude: coordinate.latitude,
        token: app.TOKEN,
        store_id: that.data.qrcodeInfo.store_id,
        table_id: that.data.qrcodeInfo.table_id,
        gender_type: gender || 0,
        page: currentPage || 1
      },
      success: function (res) {
        // 设置导航条
        wx.setNavigationBarTitle({
          title: res.data.result.store_name
        })
        console.log(res.data.result)
        that.setData({
          store: res.data.result,
          userListLength: res.data.result.table_list.length
        })
        app.globalData.storeInfo= {
          storeId: that.data.qrcodeInfo.store_id,
          storeName: res.data.result.store_name,
          tableId: that.data.qrcodeInfo.table_id
        }        
        // 隐藏加载动画和下拉刷新动作
        // if (res.data.code === 201) {
          wx.hideLoading()
          wx.stopPullDownRefresh()
        // }
        if(res.data.code === 101 || res.data.code === 102){
          wx.showModal({
            title: '提示',
            content: '不在店铺范围内',
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
      }
    })
  },

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  showFilter(){
    let that = this
    if (that.data.filterShow){
      that.showAll()
      that.setData({
        filterShow: false,
      })
      setTimeout(function () {
        that.setData({
          filterShowAnimation: that.basicAnimation(300, 0).width(45).step().export(),
          // filterGirlMoveLeftAnimation: that.basicAnimation(3000, 1000).right(27).step().export(),
          // filterBoyMoveRightAnimation: that.basicAnimation(3000, 1000).left(27).step().export()
        })
      }, 10)
    }else {
      that.setData({
        filterShow: true,
      })
      setTimeout(function () {
        that.setData({
          filterShowAnimation: that.basicAnimation(300, 0).width(170).step().export(),
          // filterGirlMoveLeftAnimation: that.basicAnimation(3000, 1000).right(27).step().export(),
          // filterBoyMoveRightAnimation: that.basicAnimation(3000, 1000).left(27).step().export()
        })
      }, 10)
    }

  },

  galleryImgPrev(e) {
    let that = this;
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: (function () {
        let imgList = []
        for (let i = 0; i < that.data.gallery.length; i++) {
          imgList.push(that.data.gallery[i].src)
        }
        console.log(e.currentTarget.dataset.src)
        return imgList
      }()),
    })
  },


  switchToMe() {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + app.globalData.userId,
    })

    // let that = this;

    // that.setData({
    //   showMeSwitch: false,
    //   bannerSwitchAnimation: that.bannerSwitchToMe(),
    //   showShopSwitch: true,
    //   shopShow: false,
    //   userShow: true,
    //   tablesOpacityAnimation: that.basicAnimation(500, 0).opacity(0).step().export(),
    //   userOpacityAnimation: that.basicAnimation(500, 0).opacity(1).step().export(),
    // })


  },

  switchToShop() {
    let that = this;

    that.setData({
      showShopSwitch: false,
      bannerSwitchAnimation: that.bannerSwitchToShop(),
      showMeSwitch: true,
      shopShow: true,
      userShow: false,
      tablesOpacityAnimation: that.basicAnimation(500, 0).opacity(1).step().export(),
      userOpacityAnimation: that.basicAnimation(500, 0).opacity(0).step().export(),
    })

  },


  bannerSwitchToMe() {
    //  let that = this;
    var animation = wx.createAnimation({
      duration: 700,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: this.data.deviceInfo.windowWidth / 2 + 'px'
    })
    return animation.scale(0.7).step({ duration: 300 }).rotateY(180).step({ duration: 700 }).scale(1).step({ duration: 300 }).export();
    // return animation.rotateY(180).step().export();
  },

  bannerSwitchToShop() {
    //  let that = this;
    var animation = wx.createAnimation({
      duration: 700,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: this.data.deviceInfo.windowWidth / 2 + 'px'
    })
    return animation.rotateY(0).step().export();
  },


  shopTap(e){
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?shop_id='+e.currentTarget.dataset.shop_id,
    })
  },

  showGirl(){
    // console.log('girl')
    this.toFetch(app.globalData.coordinate, 2)
  },

  showBoy(){
    this.toFetch(app.globalData.coordinate, 1)
  },

  showAll(){
    this.toFetch(app.globalData.coordinate, 0)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(app.globalData.msgClean)
    let that = this
    that.setData({
      hasNewMsg: !app.globalData.msgClean
    })
    
    that.data.getMsgStatusInterval = setInterval(function(){
      that.setData({
        hasNewMsg: !app.globalData.msgClean
      })
    }, 5000)

    that.data.checkLocationInterval = setInterval(function () {
      that.checkLocation()
    }, 1000 * 60 * 2)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log('main hide')
    clearInterval(this.data.getMsgStatusInterval)
    clearInterval(this.data.checkLocationInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log('main unload')
    clearInterval(this.data.getMsgStatusInterval)
    clearInterval(this.data.checkLocationInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.fetchShopInfo()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */


  userTap(e) {
    wx.navigateTo({
      url: '/pages/user/user?user_id='+e.currentTarget.dataset.userid,
    })
  },

  toChatRecords(){
    wx.navigateTo({
      url: '/pages/msgList/msgList',
    })
  },

  callWaiter(){
    let that = this
    if (that.data.callWaiterTimeout > 0){
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请' + (60 - that.data.callWaiterTimeout) + '秒后再试',
      })
    } else {
      wx.request({
        url: app.requestHost + 'User/call_waiter/',
        method: 'POST',
        data: {
          token: app.TOKEN,
          store_id: app.globalData.storeInfo.storeId,
          table_id: app.globalData.storeInfo.tableId
        },
        success: function (res) {
          if(res.data.code === 201){
            wx.showToast({
              title: '呼叫成功',
            })
            let callWaiterInterval = setInterval(function(){
              // 不行啊，modal content不会变
              // that.setData({
              //   callWaiterTimeout: that.data.callWaiterTimeout + 1
              // })
              that.data.callWaiterTimeout++
              if (that.data.callWaiterTimeout >= 60){
                that.data.callWaiterTimeout = 0
                clearInterval(callWaiterInterval)
              }
            }, 1000)
          }
        }
      })
    }
  },

  checkLocation() {
    
      let that = this
      let gd = app.globalData

      wx.request({
        url: app.requestHost + '/Store/check_address/',
        method: 'POST',
        data: {
          latitude: gd.coordinate.latitude,
          longitude: gd.coordinate.longitude,
          token: app.TOKEN,
          store_id: gd.storeInfo.storeId,
          table_id: gd.storeInfo.tableId
        },
        success: function (res) {
          console.log(res)
          // 重新获取位置
          app.getLocation()
          // if (getCurrentPages().length === 1 && getCurrentPages()[0].pageName === 'shopMain') {
            if (res.data.code === 201) {
              console.log(res.data.message)
            } else if (res.data.code === 103 || res.data.code === 102) {
              wx.showModal({
                title: '提示',
                content: res.data.code === 103 ? '您已离开本店' : '商家已关闭服务',
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
              wx.showModal({
                title: '提示',
                content: '与服务器通信错误',
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
          // }
        },
        fail: function (err) {
          console.log(err)
        }
      })
  }

})