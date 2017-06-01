// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['美国', '中国', '巴西', '日本'],
    objectArray: [
      {
        id: 0,
        name: '美国'
      },
      {
        id: 1,
        name: '中国'
      },
      {
        id: 2,
        name: '巴西'
      },
      {
        id: 3,
        name: '日本'
      }
    ],
    index: 0,
    date: '2016-09-01',
    time: '12:01'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userName: options.myName
    })
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.chooseAddress({
      success: function (res) {
        console.log(res.userName)
        console.log(res.postalCode)
        console.log(res.provinceName)
        console.log(res.cityName)
        console.log(res.countyName)
        console.log(res.detailInfo)
        console.log(res.nationalCode)
        console.log(res.telNumber)
      }
    })
    wx.getSetting({
      success(res) {
        console.log(res)
        if (res.authSetting['scope.record']) {
          console.log('in')
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log('inin')
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.startRecord()
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
    // wx.scanCode({
    //   success: res => {
    //     console.log(res)
    //   }
    // })
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
    return {
      title: 'nihao',
      path: '/page/list',
      success: function (res) {
        // 转发成功
        console.log(res)
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function(res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        // 转发失败
        console.log(res)
      }
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },
  toMain: function () {
    wx.redirectTo({
      url: '../main/main?myName=' + this.data.userName,
    })
  },
  toList: function () {
    // wx.navigateTo({
    //   url: '../list/list',
    // })
  },

  touchStart: function(e) {
    console.log('start!')
    console.log(e)
  },

  touchMove: function() {
    console.log('move!')
  },

  touchEnd: function() {
    console.log('end!')
  },

  onPullDownRefresh: function () {
    console.log('down')
  }
})