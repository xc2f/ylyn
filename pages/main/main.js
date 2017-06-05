Page({

  /**
   * 页面的初始数据
   */
  data: {
    systemInfo: {},
    registerShow: false,
    isRegister: false,

    nickNameAnimation: {},
    genderAnimation: {},
    ageAnimation: {},
    tallAnimation: {},
    introAnimation: {},
    avatarAnimation: {},
    textareaShow: false,
    genderRange: [
      { title: '男', value: 1 },
      { title: '女', value: 2 }
    ],

    wxUserInfo: {},
    userInfo: {
      avatar: null
    },
    tempChange: null,

    avatarShow: false,
    avatarShowAnimation: {},
    avatarPath: null,

    exitRegisterText: '退出注册',

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

  // bannertranslate效果，暂不用
  // bannerSwitchTranslateIn() {
  //   var animation = wx.createAnimation({
  //     duration: 800,
  //     timingFunction: "ease",
  //     delay: 0
  //   })
  //   return animation.translateZ(-170).step().export();
  // },
  // bannerSwitchTranslateOut() {
  //   var animation = wx.createAnimation({
  //     duration: 800,
  //     timingFunction: "ease",
  //     delay: 0
  //   })
  //   return animation.translateZ(0).step().export();
  // },

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
  exitRegister(e) {
    let target = e.currentTarget.dataset.exitRegisterText;
    if (target === '完成注册') {
      this.setData({
        isRegister: true,
      })

      // 如果没有上传头像，使用微信的
      if(this.data.userInfo.avatar === null) {
        this.setData({
          'userInfo.avatar': this.data.wxUserInfo.avatarUrl
        })
      }
      // 向服务端发送注册信息，并拉取分配的user_id合并
      wx.request({
        url: 'http://easy-mock.com/mock/5935079e91470c0ac1011705/ylyn_1496647582974/user',
        method: 'POST',
        data: this.data.userInfo,
        success: function(res) {
          wx.setStorage({
            key: 'userInfo',
            data: res.data,
          })
        }
      })
    }
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
        that.setData({
          systemInfo: res
        })
      }
    })

    wx.request({
      url: 'https://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/shop',
      // method: 'POST',
      // data: {
      //   shopid: options.shopid
      // },
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
      key: 'userInfo',
      success: function (res) {
        that.setData({
          avatarPath: res.data.avatar
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

    // end onload
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  // 注册界面的卡片动画
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

  changeHandle(e) {
    this.setData({
      tempChange: e.detail.value
    })
  },

  tapNickName(e) {
    this.setData({
      'userInfo.nickName': this.data.tempChange !== null ? this.data.tempChange : this.data.wxUserInfo.nickName,
      nickNameAnimation: this.exitAnimation()
    })

    // 保证tempChange被使用后清除
    this.setData({
      tempChange: null
    })

  },

  tapGender() {
    this.setData({
      'userInfo.gender': this.data.tempChange !== null ? parseInt(this.data.tempChange) : this.data.wxUserInfo.gender,
      genderAnimation: this.exitAnimation()
    })

    // 保证tempChange被使用后清除
    this.setData({
      tempChange: null
    })
  },


  tapAge() {
    this.setData({
      'userInfo.age': this.data.tempChange !== null ? this.data.tempChange : 20,
      ageAnimation: this.exitAnimation()
    })
    // 保证tempChange被使用后清除
    this.setData({
      tempChange: null
    })
  },

  tapTall() {
    this.setData({
      'userInfo.tall': this.data.tempChange !== null ? parseInt(this.data.tempChange) : null,
      tallAnimation: this.exitAnimation(),
      introAnimation: this.introHeightenAnimation(),
      textareaShow: true
    })

    // 保证tempChange被使用后清除
    this.setData({
      tempChange: null
    })
  },

  tapIntro() {
    this.setData({
      'userInfo.intro': this.data.tempChange !== null ? this.data.tempChange : '',
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
            // 更新
            that.setData({
              'userInfo.avatar': res.savedFilePath,
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

  },


  userTap(e) {
    // if (this.data.isRegister) {
      // console.log('用户信息: ' + JSON.stringify(e.currentTarget.dataset.userinfo))
      wx.navigateTo({
        url: '/pages/chat/chat?friend=' + JSON.stringify(e.currentTarget.dataset.userinfo),
      })
    // } else {
    //   this.setData({
    //     registerShow: true
    //   })
    // }
  }

})