var app = getApp()

Page({

  pageName: 'shopMain',
  getLocationErrorTimes: 0,
  currentPage: 1,
  currentGender: 0,
  fetchDataTime: new Date().getTime(),

  /**
   * 页面的初始数据
   */
  data: {
    // 设备信息
    deviceInfo: null,
    // store数据主体
    store: null,
    // 用户列表长度
    userListLength: 0,
    // 扫码的二维码信息
    qrcodeInfo: null,

    // 只看男女切换
    filterShow: false,
    filterShowAnimation: {},

    // 获取未读消息状态
    getMsgStatusInterval: null,
    hasNewMsg: false,

    // 呼叫维特延时
    callWaiterTimeout: 0,

    // 一直在跳的那个定位标记
    loadingTip: '店铺正马不停蹄地向你赶来',
    // 定位失败
    getLocationFail: false,
    // 数据获取失败
    fetchDataFail: false,

    // 登录按钮
    showLogin: true,
    // // 登录按钮上的登录状态
    showLoginStatus: false,
    // 登录按钮下边的提示文字
    loginStatus: '',

    // 登录状态
    login: false,

    // 登录以及数据拉取成功
    dataOk: false,

    showGuide: false,

    hasNewNotice: false,

    // 呼叫服务员
    showLayer: false,
    showPrompt: false,

    filterAnimation: null,
    filterAngleAnimation: null,
    filter: 'all'
  },
  filterShow: false,

  fetchTableListOk: false,


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    // TODO 用户返回到微信，再从微信回来的情况
    let that = this
    // 扫码
    that.setData({
      qrcodeInfo: {
        store_id: options.store_id || '14b00ff3-f9f7-7337-a713-599d8f8d9c62',
        table_id: options.table_id || 2
      }
    })

    // 获取屏幕高度撑满下部滚动视图
    that.setData({
      deviceInfo: app.globalData.deviceInfo
    })


    // let token = wx.getStorageSync('TOKEN')
    // if (token) {
    //   that.getCurrentLocation()
    // } else {
    //   // 未登录
    //   that.fetchShopInfoWithoutLogin()
    // }

    // 登录
    if (app.globalData.userId) {
      that.setData({
        login: true,
        showLogin: false,
      })
      that.getCurrentLocation('refresh')
    } else {
      let token = wx.getStorageSync('TOKEN')
      if (token) {
        app.TOKEN = token
        // 登陆过
        that.getCurrentLocation('autoLogin')
        that.setData({
          loadingTip: '获取位置中'
        })
      } else {
        // 未登录
        that.fetchShopInfoWithoutLogin()
      }
    }

    wx.getStorage({
      key: 'guideToDetail',
      success: function (res) {
      },
      fail: function () {
        that.setData({
          showGuide: true
        })
      }
    })

  },

  toDetail() {
    wx.setStorage({
      key: 'guideToDetail',
      data: '',
    })
    setTimeout(() => {
      this.setData({
        showGuide: false
      })
    }, 1000)
  },

  getUserInfo(res) {
    // wx.canIUse('button.open-type.getUserInfo')
    let that = this
    if (!wx.canIUse('button.open-type.getUserInfo')) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return
    }
    let detail = res.detail
    if (detail.rawData) {
      that.getCurrentLocation('manualLogin', detail)
      that.setData({
        login: false,
        showLogin: false,
        showLoginStatus: true,
        loginStatus: '获取位置中',
      })
    } else {
      that.setData({
        login: false,
        showLogin: true,
        showLoginStatus: false,
        loginStatus: '',
      })
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  fetchShopInfoWithoutLogin() {
    let that = this
    wx.request({
      url: app.requestHost + 'Store/logout_store_info/',
      method: 'POST',
      data: {
        store_id: that.data.qrcodeInfo.store_id,
      },
      success: function (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.code === 201) {
          that.setData({
            loginStatus: '',
            store: res.data.result
          })
        } else {
          // TODO
          that.setData({
            loginStatus: '数据获取失败',
            loadingTip: '数据获取失败'
          })
        }
      },
      fail: function (res) {
        // TODO
        that.setData({
          loginStatus: '数据获取失败',
          loadingTip: '数据获取失败'
        })
      }
    })
  },


  getCurrentLocation(type, data) {
    let that = this
    let coordinate = app.globalData.coordinate
    if (coordinate) {
      if (that.data.login) {
        that.toFetch()
      } else {
        that.toLogin(type, data)
      }
      that.setData({
        getLocationFail: false,
        showLoginStatus: true,
        loginStatus: '位置获取成功，登录中',
        loadingTip: '位置获取成功，登录中',
      })
    } else {
      app.getLocation(res => {
        if (res) {
          that.toLogin(type, data)
          that.setData({
            getLocationFail: false,
            showLoginStatus: true,
            loginStatus: '位置获取成功，登录中',
            loadingTip: '位置获取成功，登录中',
          })
        } else {
          that.setData({
            showLoginStatus: false,
            showLogin: true,
            loginStatus: '位置获取失败，请重试',
            loadingTip: '位置获取失败，请点击页面重试',
            getLocationFail: true
          })
        }
      })
    }
  },

  toLogin(type, data) {
    // 位置已经获取到
    let that = this
    if (type === 'autoLogin') {
      app.connectWebsocket('auto', null, login => {
        if (login) {
          that.toFetch()
          that.setData({
            login: true,
            fetchDataFail: false,
            loadingTip: '登录成功，获取数据中'
          })
        } else {
          that.setData({
            login: false,
            loadingTip: '登录失败，请重试',
            fetchDataFail: false
          })
        }
      })
    } else if (type === 'manualLogin') {
      app.manualLogin(data.encryptedData, data.iv, res => {
        if (res) {
          that.setData({
            login: true,
            showLogin: false,
            showLoginStatus: true,
            loginStatus: '登录成功，获取数据中'
          })
          that.toFetch()
        } else {
          that.setData({
            login: false,
            showLogin: true,
            showLoginStatus: false,
            loginStatus: '登录失败，请重试',
          })
        }
      })
    } else {
      that.toFetch()
    }
  },

  toFetch(gender, page) {
    this.fetchTableListOk = false
    let that = this
    gender = gender || 0
    page = page || 1
    let coordinate = app.globalData.coordinate
    wx.request({
      // url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      url: app.requestHost + 'Store/store_user/',
      method: 'POST',
      data: {
        // longitude: 108.8871237 || coordinate.longitude,
        // latitude: 34.1863376 || coordinate.latitude,
        // longitude: coordinate.longitude,
        // latitude: coordinate.latitude,
        latitude: 34.2048991715,
        longitude: 108.9146214724,
        token: app.TOKEN,
        store_id: that.data.qrcodeInfo.store_id,
        table_id: that.data.qrcodeInfo.table_id,
        gender_type: gender,
        page: page
      },
      success: function (res) {
        that.fetchTableListOk = true
        // 隐藏加载动画和下拉刷新动作
        wx.hideLoading()
        wx.stopPullDownRefresh()
        // TODO
        if (res.data.code === 201) {
          app.inStore = true
          let result = res.data.result

          // 设置导航条
          wx.setNavigationBarTitle({
            title: result.store_name
          })

          app.globalData.storeInfo = {
            storeId: that.data.qrcodeInfo.store_id,
            storeName: result.store_name,
            tableId: that.data.qrcodeInfo.table_id,
            logo: result.store_logo
          }
          that.setData({
            dataOk: true,
            fetchDataFail: false,
          })

          if (page === 1) {
            that.setData({
              store: result,
              userListLength: result.table_list.length
            })
          } else {
            // 翻页
            if (result.table_list.length === 0) {
              // 翻页没有数据时tablelist为空
              that.currentPage = page - 1
            } else {

              let oldTableList = that.data.store.table_list
              let newTableList = oldTableList.concat(newTableList)
              result.table_list = newTableList

              that.setData({
                store: result,
                userListLength: result.table_list.length
              })
            }
          }
        } else if (res.data.code === 102) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            complete: function (res) {
              app.inStore = false
              wx.redirectTo({
                url: '/pages/nearlist/nearlist',
              })
            }
          })
        } else if (res.data.code === 103) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            complete: function (res) {
              app.inStore = false
              wx.redirectTo({
                url: '/pages/nearlist/nearlist',
              })
            }
          })
        } else {
          app.inStore = false
          that.setData({
            dataOk: false,
            showLoginStatus: false,
            loginStatus: '数据获取失败，请下拉刷新重试',
            loadingTip: '数据获取失败, 请点击页面重试',
            fetchDataFail: true,
            store: null
          })
        }
      },
      fail: function () {
        that.fetchTableListOk = true
        app.inStore = false
        wx.hideLoading()
        wx.stopPullDownRefresh()
        that.setData({
          dataOk: false,
          showLoginStatus: false,
          loginStatus: '数据获取失败，请下拉刷新重试',
          loadingTip: '数据获取失败, 请点击页面重试',
          fetchDataFail: true
        })
      }
    })
  },

  occurFail() {
    if (this.data.getLocationFail) {
      this.setData({
        loadingTip: '重新获取位置中',
        getLocationFail: false
      })
      this.getCurrentLocation()
    } else {
      this.setData({
        loadingTip: '重新获取数据中',
        fetchDataFail: false
      })
      this.toFetch()
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

  showFilter() {
    let that = this
    if (that.filterShow) {
      // that.showAll()
      // that.setData({
      //   filterShow: false,
      // })
      // setTimeout(function () {
      //   that.setData({
      //     filterShowAnimation: that.basicAnimation(300, 0).width(45).step().export()
      //   })
      // }, 10)
      this.setData({
        filterAnimation: that.basicAnimation(300, 0).right(-100).step().export(),
        filterAngleAnimation: that.basicAnimation(300, 0).rotate(0).step().export()
      })
    } else {
      this.setData({
        filterAnimation: that.basicAnimation(300, 0).right(0).step().export(),
        filterAngleAnimation: that.basicAnimation(300, 0).rotate(180).step().export()
      })
      // that.setData({
      //   filterShow: true,
      // })
      // setTimeout(function () {
      //   that.setData({
      //     filterShowAnimation: that.basicAnimation(300, 0).width(170).step().export()
      //   })
      // }, 10)
    }
    this.filterShow = !this.filterShow

  },


  // 我的
  switchToMe() {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + app.globalData.userId,
    })
  },


  // 性别筛选总是返回第一页数据
  showGirl() {
    this.currentGender = 2
    this.toFetch(2)
    this.setData({
      filter: 'girl'
    })
  },

  showBoy() {
    this.currentGender = 1
    this.toFetch(1)
    this.setData({
      filter: 'boy'
    })
  },

  showAll() {
    this.currentGender = 0
    this.toFetch(0)
    this.setData({
      filter: 'all',
    })
  },


  onReady: function () {
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData.hasNewMoment, app.globalData.hasNewComment)
    // 获取未读消息
    let that = this
    that.setData({
      hasNewMsg: !app.globalData.msgClean,
      hasNewNotice: app.globalData.hasNewMoment || app.globalData.hasNewComment
    })

    that.data.getMsgStatusInterval = setInterval(function () {
      that.setData({
        hasNewMsg: !app.globalData.msgClean,
        hasNewNotice: app.globalData.hasNewMoment || app.globalData.hasNewComment
      })
    }, 2000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log('main hide')
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log('main unload')
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.currentPage = 1
    if (this.data.login) {
      this.getCurrentLocation('pullDown')
    } else {
      this.fetchShopInfoWithoutLogin()
    }
    this.setData({
      loadingTip: '店铺正马不停蹄地向你赶来',
      loginStatus: '获取位置中'
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  scrollToEnd: function () {
    console.log(this.fetchTableListOk, this.currentPage)
    if (this.fetchTableListOk) {
      this.currentPage += 1
      this.toFetch(this.currentGender, this.currentPage)
    }
  },

  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */


  userTap(e) {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + e.currentTarget.dataset.userid,
    })
  },

  toChatRecords() {
    wx.navigateTo({
      url: '/pages/msgList/msgList',
    })
  },

  callWaiter() {
    let that = this
    if (that.data.callWaiterTimeout > 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请' + (60 - that.data.callWaiterTimeout) + '秒后再试',
      })
    } else {
      this.setData({
        showLayer: true,
        showPrompt: true
      })
    }
  },

  callWaiterSubmit(e) {
    let that = this
    let type = e.detail.target.dataset.type
    if (type === 'cancle') {
      this.setData({
        showLayer: false,
        showPrompt: false,
      })
      return
    }
    wx.request({
      url: app.requestHost + 'User/call_waiter/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        store_id: app.globalData.storeInfo.storeId,
        table_id: app.globalData.storeInfo.tableId,
        content: e.detail.value.content
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.showToast({
            title: '呼叫成功',
          })
          that.setData({
            showLayer: false,
            showPrompt: false,
          })
          let callWaiterInterval = setInterval(function () {
            // 不行啊，modal content不会变
            // that.setData({
            //   callWaiterTimeout: that.data.callWaiterTimeout + 1
            // })
            that.data.callWaiterTimeout++
            if (that.data.callWaiterTimeout >= 60) {
              that.data.callWaiterTimeout = 0
              clearInterval(callWaiterInterval)
            }
          }, 1000)
        }
      }
    })
  },

  toMomentPage() {
    wx.navigateTo({
      url: '/pages/moments/index/index',
    })
  }

})
