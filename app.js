App({

  globalData: {
    deviceInfo: null,
    checkLocationInterval: null,
    webSocketError: false,
    coordinate: null,
    userId: null,
    storeInfo: null,
    client_id: null,
    msgClean: true,
  },

  TOKEN: null,
  requestHost: 'http://192.168.0.110:8080/index.php/yl/',

  onLaunch: function () {
    // setInterval(function(){
    //   console.log(getCurrentPages()[getCurrentPages().length-1].pageName)
    // }, 2000)
    
    // let that = this

    this.connectWebsocket()

    // this.login()

    // 检查位置
    this.checkLocation()

    // 获取设备信息
    this.getDeviceInfo()

    // setTimeout(function(){
    //   console.log('----------')
    //   console.log(getCurrentPages()[getCurrentPages().length-1].pageName)
    // }, 10000)
    this.refreshStorage()

    // 获取本地消息状态
    this.getMsgStatus()

  },

  getMsgStatus(){
    let that = this
    wx.getStorage({
      key: 'msgClean',
      success: function (res) {
        that.globalData.msgClean = res.data
      },
      fail: function () {
        wx.setStorage({
          key: 'msgClean',
          data: true,
        })
      }
    })

    setInterval(function () {
      wx.getStorage({
        key: 'chatRecords',
        success: function (res) {
          let data = res.data
          for (let i = 0; i < data.length; i++) {
            if (data[i].msgClean === false) {
              that.globalData.msgClean = false
              wx.setStorageSync('msgClean', false)
              break
            }
            if (i === data.length - 1 && data[i].msgClean === true){
              that.globalData.msgClean = true
              wx.setStorageSync('msgClean', true)
            }
          }
        },
      })
    }, 5000)
  },

  login(callback, client_id) {
    // console.log(client_id)
    wx.showLoading({
      title: '登陆中',
      mask: true
    })
    console.log('login --------------')
    let that = this
    let token = wx.getStorageSync('TOKEN')
    if (token) {
      that.TOKEN = token
      wx.request({
        url: that.requestHost + 'User/token_login/',
        method: 'POST',
        data: {
          token: token,
          client_id: client_id
        },
        success: function (res) {

          // 执行回调
          callback() || null
          // 存储userid
          that.globalData.userId = res.data.result.user_id
          // 未读消息
          let unreadMsg = res.data.result.unread_msg
          if (unreadMsg.length) {
            for (let i = 2; i < unreadMsg.length; i++) {
              that.loadMsg(unreadMsg[i])
            }
          }
          // 覆盖用户信息
          wx.setStorage({
            key: 'meInfo',
            data: res.data.result.user_info,
          })
        },
        fail: function(){
          wx.hideLoading()
          wx.showModal({
            title: '登录失败',
            content: '请确认网络是否畅通',
            showCancel: false
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
          wx.hideLoading()
          wx.showModal({
            title: '登录失败',
            content: '请确认网络是否畅通',
            showCancel: false
          })
          console.log('------wx login fail--------')
        }
      });
    }
  },

  getMeInfo(code, callback, client_id) {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        // console.log(encrypted_data)
        // console.log(iv)
        // console.log(that.globalData)
        // 发起请求
        wx.request({
          url: that.requestHost + 'User/wxLogin/',
          method: 'POST',
          data: {
            code: code,
            encrypted_data: res.encryptedData,
            iv: res.iv,
            client_id: client_id
          },
          success: function (res) {
            if (res.data.code === 201) {
              // 存储userid
              that.globalData.userId = res.data.result.user_id
              // 存储TOKEN
              that.TOKEN = res.data.result.token
              wx.setStorageSync('TOKEN', res.data.result.token)
              // 未读消息
              let unreadMsg = res.data.result.unread_msg
              if (unreadMsg.length) {
                // TODO
                for (let i = 2; i < unreadMsg.length; i++) {
                  that.loadMsg(unreadMsg[i])
                }
              }

              // 覆盖用户信息
              wx.setStorage({
                key: 'meInfo',
                data: res.data.result.user_info,
              })
              // 执行回调
              callback() || null
            } else {
              wx.showToast({
                icon: 'loading',
                title: '登录失败',
              })
            }
          }
        })
      },
      fail: function (res) {
        console.log('-----get wx userInfo fail--------')
        // console.log(res)
      }
    })
  },

  getLocation(callback) {
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
                    // callback() || null
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
              // callback() || null
            },
          })
        }
      }
    })
  },

  getDeviceInfo: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.deviceInfo = res
      }
    })
  },

  // 连接websocket
  connectWebsocket() {
    let that = this
    // 连接websocket
    wx.connectSocket({
      url: 'ws://192.168.0.110:8282'
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')

      // 监听消息
      wx.onSocketMessage(function (res) {
        // console.log('--------------------')
        // console.log(res)
        let data = JSON.parse(res.data)
        if (data.type === 'init') {
          that.globalData.client_id = data.client_id
        } else {
          that.loadMsg(data)
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

    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
  },

  loadMsg(msg) {
    let that = this
    let messageList = wx.getStorageSync('chatWith' + msg.from_user_id)
    // friendInfo: that.data.friendInfo,
    // storeInfo: app.globalData.storeInfo
    let postData = JSON.parse(msg.content)
    let friendInfo = {
      avatar: msg.from_user_avatar,
      user_id: msg.from_user_id,
      nickname: msg.from_user_nickname,
      age: msg.from_user_age,
      gender: msg.from_user_gender
    }
    let storeInfo = {
      storeId: msg.store_id,
      storeName: msg.store_name
    }
    // 如果在当前消息来的聊天页，消息clean
    let msgclean = getCurrentPages()[getCurrentPages().length - 1].pageName === 'chatWith' + msg.from_user_id ? true : false
    // 如果clean，说明在该聊天页
    // if(msgclean){
    //   let m = 'chatWith' + msg.from_user_id
    //   that.globalData.m = true
    // }
    // setTimeout(function(){
    //   let m = 'chatWith' + msg.from_user_id
    //   that.globalData.m = false
    // }, 3000)
    // 如果本地存有这个消息缓存
    if (messageList !== '') {
      messageList.push(postData)
      wx.setStorageSync('chatWith' + msg.from_user_id, messageList)
      that.refreshChatRecords({
        newMessage: postData,
        friendInfo: friendInfo,
        storeInfo: storeInfo
      }, msgclean)
    } else {
      let messageList = []
      messageList.push(postData)
      wx.setStorageSync('chatWith' + msg.from_user_id, messageList)
      that.refreshChatRecords({
        newMessage: postData,
        friendInfo: friendInfo,
        storeInfo: storeInfo
      }, msgclean)
    }
  },


  refreshChatRecords(NewMessage, msgClean = false) {
    // 在chat页面消息clean
    // TODO 只能在当前用户的chat页消息clean
    // let msgClean = false
    // if (getCurrentPages()[getCurrentPages().length - 1].pageName === 'chat'){
    //   msgClean = true
    // } else {
    //   msgClean = false
    // }

    // console.log(NewMessage)

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
            records[0].msgClean = msgClean
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
  refreshStorage() {
    let deadline = new Date().getTime() - 1000 * 60 * 60 * 24 * 3
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        // console.log(records)
        // 查找之前是否保存过两人会话
        for (let i = 0; i < records.length; i++) {
          let delCounts = 0;
          let currentStorage = wx.getStorageSync(records[i].chatName)
          // console.log(currentStorage)
          for (let j = 0; j < currentStorage.length; j++) {
            if (currentStorage[j].date < deadline) {
              delCounts++
            }
            if (j === currentStorage.length - 1) {
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
        for (let i = 0; i < files.length; i++) {
          if (files[i].createTime < deadline) {
            wx.removeSavedFile({
              filePath: files[i].filePath,
            })
          }
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })

  },

  checkLocation(){
    let that = this
    
    that.getLocation()

    let gd = that.globalData
    this.globalData.checkLocationInterval = setInterval(()=>{
      wx.request({
        url: that.requestHost + '/Store/check_address/',
        method: 'POST',
        data: {
          latitude: gd.coordinate.latitude,
          longitude: gd.coordinate.longitude,
          token: that.TOKEN,
          store_id: gd.storeInfo.storeId,
          table_id: gd.storeInfo.tableId
        },
        success: function (res) {
          
          // 重新获取位置
          that.getLocation()
          if (getCurrentPages().length === 1 && getCurrentPages()[0].pageName === 'shopMain'){
            if (res.data.code === 103 || res.data.code === 102) {
              wx.showModal({
                title: '提示',
                content: res.data.code === 103 ? '您已离开本店' : '商家已关闭服务',
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
              wx.showModal({
                title: '提示',
                content: '与服务器通信错误',
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
        },
        fail: function (err) {
          console.log(err)
        }
      })
    }, 1000 * 60 * 2)
  },


  onShow: function () {

  },

  onUnlaunch: function () {
    wx.closeSocket()
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })


    clearInterval(this.globalData.checkLocationInterval)
  }

})