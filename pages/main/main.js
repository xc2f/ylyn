
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: null,
    store: {},
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
    hasNewMsg: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      qrcodeInfo: {
        store_id: options.store_id || 1,
        table_id: options.table_id || 1
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
    let checkClientId = setInterval(function () {
      if (app.globalData.client_id !== null) {
        app.login(that.fetchShopInfo, app.globalData.client_id)
        clearInterval(checkClientId)
      }
    }, 50)
    // 获取用户信息

    // end onload
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  fetchShopInfo(gender, currentPage){
    let that = this
    app.getLocation()
    let interval = setInterval(function () {
      if (app.globalData.coordinate !== null) {
        let coordinate = app.globalData.coordinate
        app.globalData.coordinate = null
        // 获取到坐标请求
        that.toFetch(coordinate, gender, currentPage)
        clearInterval(interval)
      }
    }, 500)

  },

  toFetch(coordinate, gender, currentPage){
    let that = this
    wx.showLoading({
      title: '数据获取中',
    })
    // let token = wx.getStorageSync('TOKEN')
    wx.request({
      // url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      url: app.requestHost + 'Store/store_user/',
      method: 'POST',
      data: {
        longitude: coordinate.longitude,
        latitude: coordinate.latitude,
        token: app.TOKEN,
        store_id: that.data.qrcodeInfo.store_id,
        table_id: that.data.qrcodeInfo.table_id,
        gender_type: gender || 0,
        page: currentPage || 1
      },
      success: function (res) {
        that.setData({
          store: res.data.result
        })
        app.globalData.storeInfo= {
          storeId: that.data.qrcodeInfo.store_id,
          storeName: res.data.result.store_name,
          tableId: that.data.qrcodeInfo.table_id
        }        
        // 隐藏加载动画和下拉刷新动作
        if (res.data.code === 201) {
          wx.hideLoading()
          wx.stopPullDownRefresh()
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


  pickAvatar() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        // 先删除保存的文件路径，保证同时间只保存一张头像
        let path = res.tempFilePaths[0]
        if (that.data.avatarPath !== null) {
          wx.removeSavedFile({
            filePath: that.data.avatarPath,
          })
        }
        wx.saveFile({
          tempFilePath: path,
          success: function (res) {
            console.log('Saved avatar success!')
            // 更新
            that.setData({
              'meInfo.avatar': res.savedFilePath,
              avatarPath: res.savedFilePath
            })
          }
        })
        wx.getSavedFileList({
          success: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  shopTap(e){
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?shop_id='+e.currentTarget.dataset.shop_id,
    })
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
    this.fetchShopInfo(this.data.shop.shop_id)
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

  },


  userTap(e) {
    wx.navigateTo({
      url: '/pages/user/user?user_id='+e.currentTarget.dataset.userid,
    })
  },

  toChatRecords(){
    wx.navigateTo({
      url: '/pages/msgList/msgList',
    })
  }

})