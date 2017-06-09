App({

  globalData: {
    meInfo: null,
    deviceInfo: null
  },

  onLaunch: function () {
    let that = this

    // 获取设备信息
    that.getDeviceInfo()

    // that.getMeInfo()

    // 连接websocket
    wx.connectSocket({
      url: 'wss://192.168.0.119'
    })

    // wx.onSocketOpen(function (res) {
    //   console.log('WebSocket连接已打开！')
    //   setInterval(function () {
    //     var time = new Date().toString()
    //     wx.sendSocketMessage({
    //       data: time
    //     })
    //   }, 5000)
    // })

  },

  getMeInfo() {
    let that = this
    wx.login({
      success: function (res) {
        if (res.code) {
          let code = res.code
          wx.getUserInfo({
            success: function(res){
              // 发起请求
              wx.request({
                url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/me',
                method: 'POST',
                data: {
                  userInfo: res,
                  code: code
                },
                success: function(res){
                  that.globalData.meInfo = res.data
                  wx.setStorage({
                    key: 'meInfo',
                    data: res.data,
                  })
                }
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },

  getDeviceInfo: function(){
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.deviceInfo = res
      }
    })
  },

  onShow: function(){

  }
})