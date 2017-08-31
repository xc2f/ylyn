var app = getApp()

Page({

  pageName: 'shopMain',
  getLocationErrorTimes: 0,
  currentPage: 1,
  currentGender: 0,

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

    // 地理位置检测
    checkLocationInterval: null,

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
    dataOk: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    if (app.globalData.userId) {
      that.setData({
        login: true,
        showLogin: false,
      })
      that.getCurrentLocation()
    } else {
      let token = wx.getStorageSync('TOKEN')
      if (token) {
        // 登陆过
        app.TOKEN = token
        app.connectWebsocket('auto', null, login => {
          if (login) {
            that.setData({
              login: true,
              showLogin: false,
            })
            that.getCurrentLocation()
          } else {
            that.setData({
              loadingTip: '登录失败'
            })
          }
        })
      } else {
        // 未登录
        that.fetchShopInfoWithoutLogin()
      }
    }

  },

  getUserInfo(res) {
    let that = this
    let detail = res.detail
    if (detail.rawData) {
      that.setData({
        login: false,
        showLogin: false,
        showLoginStatus: true,
        loginStatus: '登录中',
      })
      app.manualLogin(detail.encryptedData, detail.iv, res => {
        if (res) {
          that.setData({
            login: true,
            showLogin: false,
            showLoginStatus: true,
            loginStatus: '登录成功，获取位置中'
          })
          that.getCurrentLocation()
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
      that.setData({
        login: false,
        showLogin: true,
        showLoginStatus: false,
        loginStatus: '用户信息获取失败',
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
            store: res.data.result
          })
        } else {
          // TODO
          that.setData({
            loadingTip: '数据获取失败'
          })
        }
      },
      fail: function (res) {
        // TODO
        that.setData({
          loadingTip: '数据获取失败'
        })
      }
    })
  },


  getCurrentLocation() {
    let that = this
    let coordinate = app.globalData.coordinate
    if (coordinate) {
      // TODO
      that.toFetch()
    } else {
      app.getLocation(res => {
        if (res) {
          that.setData({
            showLoginStatus: true,
            loginStatus: '位置获取成功，获取数据中',
            getLocationFail: false
          })
          that.toFetch()
        } else {
          that.setData({
            showLoginStatus: false,
            loginStatus: '位置获取失败，请下拉刷新重试',
            loadingTip: '位置获取失败，请点击页面重试',
            getLocationFail: true
          })
        }
      })
    }
  },

  toFetch(gender, page) {
    let that = this
    gender = gender || 0
    page = page || 1
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
        // 隐藏加载动画和下拉刷新动作
        wx.hideLoading()
        wx.stopPullDownRefresh()
        // TODO
        if (res.data.code === 201) {
          let result = res.data.result
          // 设置导航条
          wx.setNavigationBarTitle({
            title: result.store_name
          })
          app.globalData.storeInfo = {
            storeId: that.data.qrcodeInfo.store_id,
            storeName: result.store_name,
            tableId: that.data.qrcodeInfo.table_id
          }
          that.setData({
            dataOk: true,
            fetchDataFail: false,
          })

          if (page === 1){
            that.setData({
              store: result,
              userListLength: result.table_list.length
            })
          } else {
            // 翻页
            if (result.table_list.length === 0){
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
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/nearlist/nearlist',
                })
              }
            }
          })
        } else if (res.data.code === 103){
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
            showLoginStatus: false,
            loginStatus: '数据获取失败，请下拉刷新重试',
            loadingTip: '数据获取失败, 请点击页面重试',
            fetchDataFail: true
          })
        }
      },
      fail: function () {
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
        loadingTip: '店铺正马不停蹄地向你赶来',
        getLocationFail: false
      })
      this.getCurrentLocation()
    } else {
      this.setData({
        loadingTip: '店铺正马不停蹄地向你赶来',
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
    if (that.data.filterShow) {
      that.showAll()
      that.setData({
        filterShow: false,
      })
      setTimeout(function () {
        that.setData({
          filterShowAnimation: that.basicAnimation(300, 0).width(45).step().export()
        })
      }, 10)
    } else {
      that.setData({
        filterShow: true,
      })
      setTimeout(function () {
        that.setData({
          filterShowAnimation: that.basicAnimation(300, 0).width(170).step().export()
        })
      }, 10)
    }

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
  },

  showBoy() {
    this.currentGender = 1
    this.toFetch(1)
  },

  showAll() {
    this.currentGender = 0
    this.toFetch(0)
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取未读消息
    let that = this
    that.setData({
      hasNewMsg: !app.globalData.msgClean
    })

    that.data.getMsgStatusInterval = setInterval(function () {
      that.setData({
        hasNewMsg: !app.globalData.msgClean
      })
    }, 2000)

    // 检测位置
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
    if (this.data.login) {
      this.getCurrentLocation()
    } else {
      this.fetchShopInfoWithoutLogin()
    }
    this.setData({
      loadingTip: '店铺正马不停蹄地向你赶来',
      loginStatus: '数据获取中'
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.currentPage += 1
    this.toFetch(this.currentGender, this.currentPage)
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
      wx.showModal({
        title: '提示',
        content: '呼叫Waiter?',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.requestHost + 'User/call_waiter/',
              method: 'POST',
              data: {
                token: app.TOKEN,
                store_id: app.globalData.storeInfo.storeId,
                table_id: app.globalData.storeInfo.tableId
              },
              success: function (res) {
                if (res.data.code === 201) {
                  wx.showToast({
                    title: '呼叫成功',
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
          } else if (res.cancel) {
            return
            // console.log('用户点击取消')
          }
        }
      })
    }
  },

  checkLocation() {
    let that = this
    app.getLocation(res => {
      if (res) {
        let globalData = app.globalData
        wx.request({
          url: app.requestHost + '/Store/check_address/',
          method: 'POST',
          data: {
            latitude: globalData.coordinate.latitude,
            longitude: globalData.coordinate.longitude,
            token: app.TOKEN,
            store_id: globalData.storeInfo.storeId,
            table_id: globalData.storeInfo.tableId
          },
          success: function (res) {
            if (res.data.code === 201) {
              console.log('位置正常')
            } else if (res.data.code === 102) {
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
            } else if (res.data.code === 103) {
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
              // 不处理
            }
          },
          fail: function (err) {
            // 不处理
          }
        })
      } else {
        that.getLocationErrorTimes++
        if (that.getLocationErrorTimes >= 3) {
          wx.showModal({
            title: '提示',
            content: '无法获取到您的位置',
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
  }

})
