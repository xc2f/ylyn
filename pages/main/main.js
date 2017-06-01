Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemInfo: {},
    registerShow: false,

    nickNameAnimation: {},
    genderAnimation: {},
    ageAnimation: {},
    tallAnimation: {},
    introAnimation: {},
    avatarAnimation: {},
    textareaShow: false,
    genderRange: [
      { title: 'man', value: '男', gender: 1 },
      { title: 'female', value: '女', gender: 2 }
    ],

    wxUserInfo: {},
    avatarShow: false,
    avatarShowAnimation: {},
    avatarPath: null,

    exitRegisterText: '退出注册',

    tableData: [
      {
        tableIndex: 1,
        userList: [
          { img: '/images/EatHow.png', name: 'xm' },
          { img: '/images/EatHow.png', name: 'as' },
        ]
      },
      {
        tableIndex: 3,
        userList: [
          { img: '/images/EatHow.png', name: 'haha' },
          { img: '/images/EatHow.png', name: 'hasd' },
        ]
      },
      {
        tableIndex: 4,
        userList: [
          { img: '/images/EatHow.png', name: 'haha' },
          { img: '/images/EatHow.png', name: 'asd' },
        ]
      }
    ],
    shop: {},
    showMeSwitch: true,
    showShopSwitch: false,
    bannerSwitchAnimation: {},
    bannerSwitchTranslate: {}
  },


  switchToMe() {
    let that = this;
    // that.setData({
    //   bannerSwitchTranslate: that.bannerSwitchTranslateIn()
    // })
    // setTimeout(function(){

      that.setData({
        showMeSwitch: false,
        bannerSwitchAnimation: that.bannerSwitchToMe(),
        showShopSwitch: true
      })

    // }, 800)
    // setTimeout(function () {
    //   that.setData({
    //     bannerSwitchTranslate: that.bannerSwitchTranslateOut()
    //   })
    // }, 2000)
  },

  switchToShop() {
    let that = this;
    // that.setData({
    //   bannerSwitchTranslate: that.bannerSwitchTranslateIn()
    // })
    // setTimeout(function(){

      that.setData({
        showShopSwitch: false,
        bannerSwitchAnimation: that.bannerSwitchToShop(),
        showMeSwitch: true,
      })
      
    // }, 800)
    // setTimeout(function () {
    //   that.setData({
    //     bannerSwitchTranslate: that.bannerSwitchTranslateOut()
    //   })
    // }, 2000)
  },

  bannerSwitchTranslateIn() {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease",
      delay: 0
    })
    return animation.translateZ(-170).step().export();
  },
  bannerSwitchTranslateOut() {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease",
      delay: 0
    })
    return animation.translateZ(0).step().export();
  },

  bannerSwitchToMe() {
    //  let that = this;
    var animation = wx.createAnimation({
      duration: 700,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: this.data.systemInfo.windowWidth / 2 + 'px'
    })
    return animation.scale(0.7).step({ duration: 300 }).opacity(0).rotateY(180).opacity(1).step({ duration: 700 }).scale(1).step({ duration: 300 }).export();
  },

  bannerSwitchToShop() {
    //  let that = this;
    var animation = wx.createAnimation({
      duration: 700,
      timingFunction: "ease",
      delay: 0,
      transformOrigin: this.data.systemInfo.windowWidth / 2 + 'px'
    })
    return animation.opacity(0).rotateY(0).opacity(1).step().export();
  },

  register() {
    this.setData({
      registerShow: true
    })
  },
  exitRegister() {
    this.setData({
      registerShow: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    // 获取屏幕高度撑满下部滚动视图
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          systemInfo: res
        })
      }
    })

    wx.request({
      url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      method: 'POST',
      data: {
        shopid: options.shopid
      },
      success: function (res) {
        console.log('店铺id: ' + options.shopid + '响应已收到')
        that.setData({
          shop: res.data
        })
      }
    })
    // console.log('店铺id: ' + options.shopid)
    // wx.getSavedFileList({
    //   success: function (res) {
    //     for(let i=0; i<res.fileList.length; i++) {
    //       wx.removeSavedFile({
    //         filePath: res.fileList[i].filePath,
    //       })
    //     }
    //   }
    // })
    // wx.removeStorage({
    //   key: 'avatar',
    //   success: function(res) {
    //     console.log('Remove avatar storage successful.')
    //   },
    // })

    wx.getStorage({
      key: 'avatar',
      success: function (res) {
        that.setData({
          avatarPath: res.data
        })
      },
    })

    // 获取微信用户信息用作注册预填
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                wxUserInfo: res.userInfo
              })
            }
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

  exitAnimation() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0,
    })
    return animation.opacity(0.7).translateY(-500).rotate(Math.random() * 180).scale(Math.random()).step().export();
  },

  introHeightenAnimation() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0,
    })
    return animation.height(140).translateY(-70).step().export();
  },

  avatarFadeShow() {
    this.setData({
      avatarShow: true
    })
    var animation = wx.createAnimation({
      duration: 1500,
      timingFunction: "ease",
      delay: 0,
    })
    return animation.opacity(1).step().export();
  },

  tapNickName() {
    this.setData({
      nickNameAnimation: this.exitAnimation()
    })
  },

  tapGender() {
    this.setData({
      genderAnimation: this.exitAnimation()
    })
  },
  tapAge() {
    this.setData({
      ageAnimation: this.exitAnimation()
    })
  },
  tapTall() {
    this.setData({
      tallAnimation: this.exitAnimation(),
      introAnimation: this.introHeightenAnimation(),
      textareaShow: true
    })
  },
  tapIntro() {
    this.setData({
      introAnimation: this.exitAnimation(),
      avatarShowAnimation: this.avatarFadeShow(),
      exitRegisterText: '完成注册'
    })
  },
  tapAvatar() {
    this.setData({
      avatarAnimation: this.exitAnimation()
    })
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
            // 写入缓存记录
            wx.setStorage({
              key: 'avatar',
              data: res.savedFilePath
            })
            // 更新
            that.setData({
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

  }
})