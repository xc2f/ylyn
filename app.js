App({
  onLaunch: function () {
    
    // wx.getStorageInfo({
    //   success: function(res) {
    //     console.log(res)
    //     res.keys.map(function(key, idx){
    //       wx.getStorage({
    //         key: key,
    //         success: function (res) {
    //           let item = JSON.parse(res.data)
    //           if (item.date < 1495511141224) {
    //             wx.removeStorage({
    //               key: key,
    //               success: function (res) {
    //                 console.log('delete ' + key)
    //               }
    //             })
    //           }
    //         }
    //       })
    //     })
    //   },
    // }),
    // wx.checkSession({
    //   success: function (res) {
    //     console.log('success ---- start')
    //     console.log(res)
    //     console.log('success ---- end')
    //     //session 未过期，并且在本生命周期一直有效
    //   },
    //   fail: function (res) {
    //     console.log('fail------ start')
    //     console.log(res)
    //     console.log('fail------ end')        
    //     //登录态过期
    //     // wx.login() //重新登录
    //   }
    // })
    // wx.getSavedFileList({
    //   success: function (res) {
    //     console.log(res)
    //   }
    // })
    // this.tempStorage()
  },
  tempStorage: function() {
    for(let i=0; i<10; i++) {
      
      wx.setStorage({
        key: "key" + i,
        data: JSON.stringify({value: "value" + i, date: new Date().getTime()}),
        success: function (res) {
          // console.log(res)
        }
      })  
    }
  },

  globalData: {
    userInfo: null
  },

  onShow: function(){

    wx.connectSocket({
      url: 'wss://192.168.0.119'
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      setInterval(function(){
        var time = new Date().toString()
        wx.sendSocketMessage({
          data: time
        })
      }, 5000)
    })
  }
})