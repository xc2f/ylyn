Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: null,
    shop: {},

    showMeSwitch: true,
    showShopSwitch: false,
    bannerSwitchAnimation: {},
    bannerSwitchTranslate: {},

    // 选择主页为店铺还是用户
    shopShow: true,
    userShow: false,

    tablesOpacityAnimation: {},
    userOpacityAnimation: {},

    gallery: [
      { src: '/images/EatHow.png' },
      { src: '/images/banner.png' },
      { src: '/images/coffee.png' },
      { src: '/images/boy.png' },
      { src: '/images/girl.png' },
      { src: '/images/banner.png' },
      { src: '/images/coffee.png' },
    ],

    filterShow: false,
    filterShowAnimation: {},
    filterGirlMoveLeftAnimation: {},
    filterBoyMoveRightAnimation: {},

    hasNewMsg: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    // 获取屏幕高度撑满下部滚动视图
    that.setData({
      deviceInfo: getApp().globalData.deviceInfo
    })
    // 请求店铺信息
    that.fetchShopInfo(options)

    wx.getStorage({
      key: 'meInfo',
      success: function(res) {
        getApp().globalData.meInfo = res.data
      },
      fail: function(res) {
        // 重新获取微信用户信息
        getApp().getMeInfo()
      }
    })

    wx.onSocketMessage(function (res) {
      console.log(res)
    })

    // end onload
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  fetchShopInfo(options){
    let that = this
    wx.showLoading({
      title: '数据获取中',
    })
    wx.request({
      url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      method: 'POST',
      data: {
        shop_id: options.shopid
      },
      success: function (res) {
        console.log('店铺id: ' + options.shopid + '响应已收到')
        that.setData({
          shop: res.data
        })
        // 隐藏加载动画和下拉刷新动作
        wx.hideLoading()
        wx.stopPullDownRefresh()
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
      url: '/pages/user/user',
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
    let that = this
    that.setData({
      hasNewMsg: wx.getStorageSync('hasNewMsg')
    })
    
    getApp().globalData.getMsgStatusInterval = setInterval(function(){
      that.setData({
        hasNewMsg: wx.getStorageSync('hasNewMsg')
      })
    }, 5000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('main hide')
    clearInterval(getApp().globalData.getMsgStatusInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('main unload')
    clearInterval(getApp().globalData.getMsgStatusInterval)
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
    if (this.data.shopShow) {
      // if (this.data.isRegister && this.data.shopShow) {
      // console.log('用户信息: ' + JSON.stringify(e.currentTarget.dataset.meInfo))
      wx.navigateTo({
        url: '/pages/chat/chat?shopname='+ this.data.shop.shop_name +'&friend=' + JSON.stringify(e.currentTarget.dataset.friendinfo),
      })
      // } else {
      //   this.setData({
      //     registerShow: true
      //   })
      // }

    }
  },

  toChatRecords(){
    wx.navigateTo({
      url: '/pages/msgList/msgList',
    })
  }

})