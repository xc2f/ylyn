App({

  globalData: {
    deviceInfo: null,
    getMsgStatusInterval: null,
    webSocketError: false,
    coordinate: null,
    userId: null,
    storeInfo: null,
    client_id: null
  },

  TOKEN: null,
  requestHost: 'http://192.168.0.110:8080/index.php/yl/',

  onLaunch: function () {
    let that = this

    this.connectWebsocket()
    
    // this.login()


    // 获取设备信息
    this.getDeviceInfo()

    // setTimeout(function(){
    //   console.log('----------')
    //   console.log(getCurrentPages()[getCurrentPages().length-1].pageName)
    // }, 10000)
    this.refreshStorage()
  },

  login(callback, client_id) {
    console.log('login --------------')
    let that = this
    let token = wx.getStorageSync('TOKEN')
    if(token){
      that.TOKEN = token
      wx.request({
        url: that.requestHost +'User/token_login/',
        method: 'POST',
        data: {
          token: token
        },
        success: function(res){
          // 执行回调
          callback() || null
          // 存储userid
          that.globalData.userId = res.data.result.user_id
          // 未读消息
          // 覆盖用户信息
          wx.setStorage({
            key: 'meInfo',
            data: res.data.result.user_info,
          })
        }
      })
    } else {
      wx.login({
        success: function (res) {
          if (res.code) {
            let code = res.code
            wx.getSetting({
              success: function (res) {
                if (res.authSetting['scope.userInfo'] == false) {
                  wx.openSetting({
                    success: function (res) {
                      if (res.authSetting['scope.userInfo'] == true) {
                        that.getMeInfo(code, callback, client_id)
                      }
                    }
                  })
                } else {
                  that.getMeInfo(code, callback, client_id)
                }
              }
            })
          } else {
            console.log('无code！' + res.errMsg)
          }
        },
        fail: function (res) {
          console.log('------wx login fail--------')
          console.log(res)
        }
      });
    }
  },

  getMeInfo(code, callback, client_id){
    let that = this
    wx.getUserInfo({
      success: function (res) {
        // 发起请求
        wx.request({
          url: that.requestHost +'User/wxLogin/',
          method: 'POST',
          data: {
            code: code,
            encrypted_data: res.encryptedData,
            iv: res.iv,
            client_id: client_id
          },
          success: function (res) {
            // 存储userid
            that.globalData.userId = res.data.result.user_id
            // 存储TOKEN
            that.TOKEN = res.data.result.token
            wx.setStorageSync('TOKEN', res.data.result.token)
            // 未读消息

            // 覆盖用户信息
            wx.setStorage({
              key: 'meInfo',
              data: res.data.result.user_info,
            })
            // 执行回调
            callback() || null
          }
        })
      },
      fail: function (res) {
        console.log('-----get wx userInfo fail--------')
        console.log(res)
      }
    })
  },

  getLocation() {
    let that = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userLocation'] == false) {
          wx.openSetting({
            success: function (res) {
              if (res.authSetting['scope.userLocation'] == true) {
                wx.getLocation({
                  type: 'gcj02',
                  success: function (res) {
                    that.globalData.coordinate = {
                      latitude: res.latitude,
                      longitude: res.longitude
                    }
                  },
                })
              }
            }
          })
        } else {
          wx.getLocation({
            type: 'gcj02',
            success: function (res) {
              that.globalData.coordinate = {
                latitude: res.latitude,
                longitude: res.longitude
              }
            },
          })
        }
      }
    })
  },

  getDeviceInfo: function(){
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.deviceInfo = res
      }
    })
  },

  // 连接websocket
  connectWebsocket(){
    let that = this
    // 连接websocket
    wx.connectSocket({
      url: 'ws://192.168.0.110:8282'
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')

      // 监听消息
      wx.onSocketMessage(function (res) {
        console.log('--------------------')
        console.log(res)
        if(res.data.type === 'init'){
          that.globalData.client_id = res.data.client_id
        }
        // that.login(res.data.client_id)
        // let NewMessage = res.data
        // wx.getStorage({
        //   key: 'chatWith' + NewMessage.friend_id,
        //   success: function(res) {
        //     let messages = res.data
        //     messages.push(NewMessage)
        //     wx.setStorage({
        //       key: 'chatWith' + NewMessage.friend_id,
        //       data: messages,
        //     })
        //     that.refreshChatRecords(NewMessage)
        //   },
        //   fail: function(){
        //     wx.setStorage({
        //       key: 'chatWith' + NewMessage.friend_id,
        //       data: [NewMessage],
        //     })
        //     that.refreshChatRecords(NewMessage)
        //   }
        // })

        // wx.setStorage({
        //   key: 'hasNewMsg',
        //   data: true,
        // })
      })
    })

    wx.onSocketError(function (res) {
      // console.log(this.globalData)
      // this.globalData.webSocketError = true
      // wx.showModal({
      //   title: '连接失败',
      //   content: '连接超时，请检查您的网络连接或稍后重试！',
      //   showCancel: false
      // })
    })
  },


  refreshChatRecords(NewMessage, msgClean=false){
    // 在chat页面消息clean
    // TODO 只能在当前用户的chat页消息clean
    // let msgClean = false
    // if (getCurrentPages()[getCurrentPages().length - 1].pageName === 'chat'){
    //   msgClean = true
    // } else {
    //   msgClean = false
    // }

    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        // 查找之前是否保存过两人会话
        for (let i = 0; i < records.length; i++) {
          // TODO 加一个消息是否clean
          if (records[i].chatName === 'chatWith' + NewMessage.friendInfo.user_id) {
            // 将最新聊天置顶
            records.unshift(records.splice(i)[0])
            // 更新缓存
            wx.setStorageSync('chatRecords', records)
            // break
            return false
          }
        }
        // 如果有这个key但是没有当前聊天会话记录则新建
        records.unshift({
          chatName: 'chatWith' + NewMessage.friendInfo.user_id,
          friendInfo: NewMessage.friendInfo,
          storeInfo: NewMessage.storeInfo,
          msgClean: msgClean
        })
        wx.setStorage({
          key: 'chatRecords',
          data: records,
        })
      },
      fail: function () {
        // 第一次创建
        wx.setStorage({
          key: 'chatRecords',
          data: [{
            chatName: 'chatWith' + NewMessage.friendInfo.user_id,
            friendInfo: NewMessage.friendInfo,
            storeInfo: NewMessage.storeInfo,
            msgClean: msgClean
          }]
        })
      }
    })
  },

  // 清除3天外的文件和缓存
  refreshStorage(){
    let deadline = new Date().getTime() - 1000 * 60 * 60 * 24 * 3
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        // 查找之前是否保存过两人会话
        for (let i = 0; i < records.length; i++) {
          let delCounts = 0;
          let currentStorage = wx.getStorageSync(records[i].chatName)
          for (let j = 0; j < currentStorage.length; j++){
            if (currentStorage[j].date < deadline){
              delCounts++
            }
            if (j === currentStorage.length-1){
              // TODO 清除到最后一条消息，只能清除消息内容，用户信息保留
              delCounts--
            }
          }
          
          currentStorage.splice(0, delCounts)
          wx.setStorageSync(records[i].chatName, currentStorage)
        }
      }
    })
    wx.getSavedFileList({
      success: function (res) {
        let files = res.fileList
        for(let i=0; i<files.length; i++){
          if (files[i].createTime < deadline) {
            wx.removeSavedFile({
              filePath: files[i].filePath,
            })
          }
        }
      },
      fail:function(res) {
        console.log(res)
      }
    })

  },

  onShow: function(){

  },

  onUnlaunch: function(){
    wx.closeSocket()
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
  }
})