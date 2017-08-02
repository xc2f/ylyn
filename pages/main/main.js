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

    checkLocationInterval: null,
    showTip: '店铺正马不停蹄地向你赶来',
    showLogin: true,
    showLoading: false,
    loadingStatus: '',
    login: false
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

    let token = wx.getStorageSync('TOKEN')
    if (token) {
      app.TOKEN = token
      if(app.globalData.client_id){
        // console.log('has client_id')
        app.login( success => {
          // console.log(success)
          if(success){
            that.setData({
              login: true
            })
            that.fetchShopInfo()
          }
        })
      } else {
        app.connectWebsocket('auto', null, login => {
          // console.log(login)
          if (login) {
            that.setData({
              login: true
            })
            that.fetchShopInfo()
          } else {
            // that.setData({
            //   loadingStatus: '登录失败，请重试'
            // })
          }
        })
      }
    }else{
      // 新接口
      // console.log('here')
      that.fetchShopInfoWithoutLogin()
    }

  },

  getUserInfo(res){
    let that = this
    let detail = res.detail
    // console.log(detail)
    if (detail.rawData){
      that.setData({
        showLogin: false,
        showLoading: true,
        loadingStatus: '登录中',
      })
      app.manualLogin(detail.encryptedData, detail.iv, res =>{
        if(res){
          that.setData({
            login: true,
            loadingStatus: '登录成功，数据获取中'
          })
          that.fetchShopInfo()
        } else {
          that.setData({
            showLogin: true,
            showLoading: false,
            loadingStatus: '登录失败，请重试',
          })
        }
      })
    } else {
      that.setData({
        showLoading: false
      })
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  fetchShopInfoWithoutLogin(){
    let that = this
    wx.request({
      url: app.requestHost + 'Store/logout_store_info/',
      method: 'POST',
      data: {
        store_id: that.data.qrcodeInfo.store_id,
        // longitude: coordinate.longitude,
        // latitude: coordinate.latitude
      },
      success: function (res) {
        wx.stopPullDownRefresh()
        // console.log(res)
        if (res.data.code === 201) {
          that.setData({
            store: res.data.result
          })
        } else {

        }
      }
    })
  },


  fetchShopInfo(){
    // console.log('in3')
    let that = this
    let coordinate = app.globalData.coordinate
    if (coordinate){
      that.isInStore(coordinate)
    } else {
      app.getLocation(res => {
        // console.log(res)
        if (res === '获取成功') {
          // 是否在本店
          that.isInStore(app.globalData.coordinate)
        } else if (res === '取消授权') {
          that.setData({
            showLogin: true,
            showLoading: false,
            loadingStatus: '您未授权，请授权后重试',
            showTip: '您未授权，请授权后重试',
          })
        } else if (res === '获取中') {
          that.setData({
            showLogin: false,
            showLoading: true,
            loadingStatus: '店铺正马不停蹄地向你赶来',
            showTip: '店铺正马不停蹄地向你赶来',
          })
        } else {
          that.setData({
            showLogin: true,
            showLoading: false,
            loadingStatus: '位置获取失败，请重试',
            showTip: '位置获取失败，请重试',
          })
        }
      })
    }
  },

  isInStore(coordinate) {
    let that = this
    wx.request({
      url: app.requestHost + 'Store/store_info/',
      method: 'POST',
      data: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        token: app.TOKEN,
        store_id: that.data.qrcodeInfo.store_id,
        table_id: that.data.qrcodeInfo.table_id
      },
      success: function (res) {
        // console.log(res)
        wx.hideLoading()
        if (res.data.code === 201) {
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
      },
      fail: function(){
        that.setData({
          showLogin: true,
          showLoading: false,
          loadingStatus: '未知错误，请重试'
        })
      }
    })
  },

  toFetch(coordinate, gender, currentPage){
    let that = this
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
        // console.log(res)
        that.setData({
          showLogin: false,
          showLoading: false,
          loadingStatus: '获取成功，数据加载中'
        })
        // 隐藏加载动画和下拉刷新动作
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if(res.data.code === 201){
          // 设置导航条
          wx.setNavigationBarTitle({
            title: res.data.result.store_name
          })
          // console.log(res.data.result)
          that.setData({
            store: res.data.result,
            userListLength: res.data.result.table_list.length
          })
          app.globalData.storeInfo = {
            storeId: that.data.qrcodeInfo.store_id,
            storeName: res.data.result.store_name,
            tableId: that.data.qrcodeInfo.table_id
          }
        }else if(res.data.code === 101 || res.data.code === 102){
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
      },
      fail: function(){
        that.setData({
          showLogin: true,
          showLoading: false,
          loadingStatus: '数据获取失败，请重试'
        })
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
        // console.log(e.currentTarget.dataset.src)
        return imgList
      }()),
    })
  },


  switchToMe() {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + app.globalData.userId,
    })


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
    }, 2000)

    that.data.checkLocationInterval = setInterval(function () {
      that.checkLocation()
    }, 1000 * 60 * 2)

    setTimeout(function(){
      that.setData({
        showTip: '获取位置失败，请下拉刷新重新获取'
      })
    }, 20000)
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
    if(this.data.login){
      this.fetchShopInfo()
    } else {
      this.fetchShopInfoWithoutLogin()
    }
    
    this.setData({
      showTip: '店铺正马不停蹄地向你赶来',
    })
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

      if(gd.coordinate){
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
            // console.log(res)
            // 重新获取位置
            app.getLocation(res => {})
            // if (getCurrentPages().length === 1 && getCurrentPages()[0].pageName === 'shopMain') {
            if (res.data.code === 201) {
              // console.log(res.data.message)
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
            // console.log(err)
          }
        })
      }
  }

})