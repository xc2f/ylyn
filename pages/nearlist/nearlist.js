// pages/nearlist/nearlist.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopList: [],
    shopListEmpty: true,
    hasNewMsg: false,
    getMsgStatusInterval: null,

    showLogin: false,
    showLoginStatus: false,
    loginText: '登录',
    login: false,

    dataOk: false,
    errorTip: '',
    getLocationFail: false,
    fetchDataFail: false,
    showTopInfo: false,
    topInfoTip: '',
    theStoreId: null,
    hasNewNotice: false,
  },

  currentPage: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // app.globalData.storeInfo = null
    let that = this
    that.getCurrentLocation()
    if (app.globalData.userId) {
      that.setData({
        login: true
      })
    } else {
      let token = wx.getStorageSync('TOKEN')
      if (token) {
        app.TOKEN = token
        wx.showLoading({
          title: '登录中',
        })
        app.connectWebsocket('auto', null, login => {
          wx.hideLoading()
          if (login) {
            that.setData({
              login: true
            })
          } else {
            // TODO 登录失败
            wx.showToast({
              title: '登录失败',
              image: '/images/loginError.png'
            })
            that.setData({
              showLogin: true,
              showLoginStatus: false,
              loginText: '登录',
              login: false
            })
          }
        })
      } else {
        that.setData({
          showLogin: true,
          showLoginStatus: false,
          loginText: '登录',
          login: false
        })
      }
    }
    // }
    if (app.globalData.showNearListTopTip) {
      wx.request({
        url: app.requestHost + 'Store/store_list_tip/',
        method: 'POST',
        data: {
          store_id: options.store_id,
        },
        success: function (res) {
          if (res.data.code === 201) {
            let result = res.data.result
            if (result.tip.trim().length !== 0) {
              that.setData({
                showTopInfo: true,
                topInfoTip: result.tip
              })
            } else {
              that.setData({
                showTopInfo: false,
              })
            }
          } else {
            that.setData({
              showTopInfo: false
            })
          }
        },
        fail: function () {
          that.setData({
            showTopInfo: false
          })
        }
      })
    }
  },


  getUserInfo(res) {
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
    // console.log(detail)
    if (detail.rawData) {
      that.setData({
        showLogin: true,
        showLoginStatus: true,
        loginText: '',
        login: false
      })
      app.manualLogin(detail.encryptedData, detail.iv, res => {
        if (res) {
          that.setData({
            login: true,
          })
          that.getCurrentLocation()
        } else {
          that.setData({
            showLogin: true,
            showLoginStatus: false,
            loginText: '登录',
            login: false
          })
        }
      })
    } else {
      // 用户拒绝用户信息授权等等
      that.setData({
        showLogin: true,
        showLoginStatus: false,
        loginText: '登录',
        login: false
      })
    }
  },

  getCurrentLocation() {
    let that = this;
    let coordinate = app.globalData.coordinate
    if(coordinate){
      wx.showLoading({
        title: '获取数据中',
      })
      that.toFetch()
    } else {
      // 一般走到这一步是由于未授权和初次打开小程序和地理位置获取失败
      wx.showLoading({
        title: '获取位置中',
      })
      app.getLocation(res => {
        wx.hideLoading()
        if (res) {
          wx.showLoading({
            title: '获取数据中',
          })
          that.toFetch()
          that.setData({
            // TODO
            getLocationFail: false
          })
        } else {
          that.setData({
            // TODO
            getLocationFail: true,
            errorTip: '位置获取失败, 请点击页面重试'
          })
        }
      })
    }
  },

  toFetch(page) {
    let that = this
    let coordinate = app.globalData.coordinate
    page = page || 1
    wx.request({
      url: app.requestHost + 'Store/store_list/',
      method: 'POST',
      data: {
        longitude: coordinate.longitude,
        latitude: coordinate.latitude,
        page: page
      },
      success: function (res) {
        // console.log(res)
        wx.stopPullDownRefresh()
        if(res.data.code === 101){
          wx.hideLoading()
          // 无数据
          if(page === 1) {
            that.setData({
              shopListEmpty: true,
              dataOk: true,
              fetchDataFail: false
            })
          } else {
            that.currentPage = page - 1
          }
        } else if(res.data.code === 201){
          let result = res.data.result
          let shopList = that.data.shopList
          if(app.sdk >= 150){
            that.setData({
              shopList: page === 1 ? result.store_list : shopList.concat(result.store_list),
              shopListEmpty: false,
              dataOk: true,
              fetchDataFail: false
            }, ()=>{
              wx.hideLoading()
            })
          } else {
            that.setData({
              shopList: page === 1 ? result.store_list : shopList.concat(result.store_list),
              shopListEmpty: false,
              dataOk: true,
              fetchDataFail: false
            })
            wx.hideLoading()
          }

        } else {
          wx.hideLoading()
          that.setData({
            dataOk: false,
            fetchDataFail: true,
            errorTip: '数据获取失败, 请点击页面重试'
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        that.setData({
          dataOk: false,
          fetchDataFail: true,
          errorTip: '数据获取失败, 请点击页面重试'
        })
      }
    })
  },

  occurFail(){
    if (this.data.getLocationFail) {
      this.setData({
        getLocationFail: false,
        errorTip: ''
      })
      this.getCurrentLocation()
    } else {
      this.setData({
        fetchDataFail: false,
        errorTip: ''
      })
      this.toFetch()
    }
  },
  

  toMe() {
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + app.globalData.userId,
    })
  },

  toMsgList() {
    wx.navigateTo({
      url: '/pages/msgList/msgList',
    })
  },

  closeTopInfo() {
    app.globalData.showNearListTopTip = false
    this.setData({
      showTopInfo: false
    })
  },

  navigateToStore(e){
    let store_id = e.currentTarget.dataset.storeid
    let storeInfo = app.globalData.storeInfo
    if (app.inStore && storeInfo && storeInfo.storeId === store_id){
      wx.navigateTo({
        url: '/pages/main/main?store_id=' + storeInfo.storeId + '&table_id=' + storeInfo.tableId,
      })
    } else {
      wx.navigateTo({
        url: '/pages/shopDetail/shopDetail?store_id=' + store_id,
      })
    }
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

    let storeInfo = app.globalData.storeInfo
    if (app.inStore && storeInfo) {
      that.setData({
        theStoreId: storeInfo.storeId
      })
    } else {
      that.setData({
        theStoreId: null
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.getMsgStatusInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getCurrentLocation()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.currentPage += 1
    this.toFetch(this.currentPage)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      title: '饮识——重新定义饮食',
      path: '/pages/nearlist/nearlist',
      imageUrl: '/images/logo.png',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})