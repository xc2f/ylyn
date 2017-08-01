import { requestHost, socketUrl } from './untils/config.js'

App({

  globalData: {
    deviceInfo: null,
    checkLocationInterval: null,
    webSocketError: false,
    connectTimes: 0,
    socketBroken: false,
    coordinate: null,
    userId: null,
    storeInfo: null,
    client_id: null,
    msgClean: true,
    login: false
  },

  TOKEN: null,
  requestHost: requestHost,

  onLaunch: function () {

    // this.getLocation()

    // 获取设备信息
    this.getDeviceInfo()

    // 获取本地消息状态
    this.getMsgStatus()

  },

  getMsgStatus() {
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
            if (i === data.length - 1 && data[i].msgClean === true) {
              that.globalData.msgClean = true
              wx.setStorageSync('msgClean', true)
            }
          }
        },
      })
    }, 5000)
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
  /**
   * @params connectType - 连接方式手动还是自动
   * @params callback - 手动登录callback
   * @params autoLoginStatus - 自动登录callback
   */
  connectWebsocket(connectType, manualLoginStatus, autoLoginStatus) {
    // wx.closeSocket()
    console.log('in socket')
    let that = this
    // 连接websocket
    wx.connectSocket({
      url: socketUrl
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')

      // 监听消息
      wx.onSocketMessage(function (res) {
        // console.log('--------------------')
        console.log(res)
        let data = JSON.parse(res.data)
        console.log(data)
        if (data.type === 'init') {
          that.globalData.client_id = data.client_id
          if (connectType === 'manual') {
            manualLoginStatus(data.client_id)
          } else {
            if (that.globalData.socketBroken) {
              that.globalData.socketBroken = false
              if (that.globalData.storeInfo === null) {
                wx.request({
                  url: that.requestHost + 'Store/ws_reconnection/',
                  method: 'POST',
                  data: {
                    token: that.TOKEN,
                    client_id: that.globalData.client_id,
                    type: 2
                  },
                  success: function (res) {
                    // console.log(res)
                    if (res.data.code === 201) {
                      // console.log('重连成功！')
                    }
                  }
                })
              } else {
                wx.request({
                  url: that.requestHost + 'Store/ws_reconnection/',
                  method: 'POST',
                  data: {
                    token: that.TOKEN,
                    store_id: that.globalData.storeInfo.storeId,
                    table_id: that.globalData.storeInfo.tableId,
                    client_id: that.globalData.client_id,
                    type: 1
                  },
                  success: function (res) {
                    // console.log(res)
                    if (res.data.code === 201) {
                      // console.log('重连成功！')
                    }
                  }
                })
              }
            } else {
              console.log('to login')
              console.log(autoLoginStatus)
              that.login(autoLoginStatus)
            }
          }
        } else {
          that.loadMsg(data)
        }
      })
    })

    wx.onSocketError(function (res) {
      // console.log(res)
    })

    wx.onSocketClose( res => {
      that.globalData.client_id = null
      that.globalData.socketBroken = true
      // wx.closeSocket()
      // console.log('WebSocket 已关闭！')
      that.connectWebsocket('auto', null, null)
    })
  },

  login(callback) {
    // console.log(client_id)
    // wx.showLoading({
    //   title: '登陆中',
    //   mask: true
    // })
    // console.log('login --------------')
    let that = this
    console.log('login with token')
    wx.request({
      url: that.requestHost + 'User/token_login/',
      method: 'POST',
      data: {
        token: that.TOKEN,
        client_id: that.globalData.client_id
      },
      success: function (res) {
        console.log(res)
        that.globalData.login = true
        // callback(true)
        // TOKEN过期
        if (res.data.code === 202) {
          that.TOKEN = res.data.result.token
          wx.setStorageSync('TOKEN', res.data.result.token)
        }
        // 存储userid
        that.globalData.userId = res.data.result.user_id

        console.log('in')
        // console.log(callback)
        // 执行回调
        callback(true)
        // 未读消息
        let unreadMsg = res.data.result.unread_msg
        // console.log('未读消息', unreadMsg)
        if (unreadMsg.length) {
          for (let i = 0; i < unreadMsg.length; i++) {
            that.loadMsg(unreadMsg[i])
          }
        }
        // 覆盖用户信息
        wx.setStorage({
          key: 'meInfo',
          data: res.data.result.user_info,
        })
      },
      fail: function () {
        wx.hideLoading()
        wx.showModal({
          title: '登录超时',
          content: '请确认网络是否畅通',
          showCancel: false
        })
        that.globalData.login = false
        callback(false)
      }
    })
  },

  manualLogin(encryptedData, iv, callback) {
    let that = this
    // debugger
    that.connectWebsocket('manual', client_id => {
      wx.login({
        success: function (res) {
          if (res.code) {
            // wx.getUserInfo({
            // success: function (res) {
            // 发起请求
            wx.request({
              url: that.requestHost + 'User/wxLogin/',
              method: 'POST',
              data: {
                code: res.code,
                encrypted_data: encryptedData,
                iv: iv,
                client_id: client_id
              },
              success: function (res) {
                console.log(res)
                if (res.data.code === 201) {
                  // 存储TOKEN
                  that.TOKEN = res.data.result.token
                  wx.setStorageSync('TOKEN', res.data.result.token)

                  // 存储userid
                  that.globalData.userId = res.data.result.user_id

                  // 未读消息
                  let unreadMsg = res.data.result.unread_msg
                  if (unreadMsg.length) {
                    // TODO
                    for (let i = 0; i < unreadMsg.length; i++) {
                      that.loadMsg(unreadMsg[i])
                    }
                  }

                  // 覆盖用户信息
                  wx.setStorage({
                    key: 'meInfo',
                    data: res.data.result.user_info,
                  })
                  // 执行回调
                  callback(true)
                } else {
                  callback(false)
                  wx.showToast({
                    icon: 'loading',
                    title: '登录失败，请重试',
                  })
                }
              },
              fail: function () {
                callback(false)
                wx.showModal({
                  title: '登录超时',
                  content: '请确认网络是否畅通',
                  showCancel: false
                })
              }
            })
            // },
            // fail: function (res) {
            //   // 用户第一次取消个人信息授权
            //   wx.hideLoading()
            //   wx.showModal({
            //     title: '提示',
            //     content: '您已取消微信授权，可下拉刷新或通过右上角功能按钮重新授权',
            //     showCancel: false,
            //     success: function (res) {
            //       if (res.confirm) {
            //         wx.redirectTo({
            //           url: '/pages/nearlist/nearlist?op=nologin',
            //         })
            //       }
            //     }
            //   })
            //   // console.log(res)
            // }
            // })
          }
        }
      })
    }, null)
  },

  getLocation(callback) {
    // console.log('get location')
    let that = this
    // get setting bug
    if (wx.getSetting) {
      setTimeout(function () {
        wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userLocation'] === false) {
              // console.log(getCurrentPages())
              wx.showModal({
                title: '提示',
                content: '您未授权位置信息，确认授权？',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.userLocation'] === true) {
                          wx.getLocation({
                            type: 'gcj02',
                            success: function (res) {
                              that.globalData.coordinate = {
                                latitude: res.latitude,
                                longitude: res.longitude
                              }
                              console.log(1)
                              callback('获取成功')
                            },
                            fail: function () {
                              console.log(2)
                              callback('获取失败')
                              // console.log('用户重新授权，但获取位置失败')
                              wx.showToast({
                                icon: 'loading',
                                title: '获取地理位置失败',
                              })
                            }
                          })
                        } else {
                          console.log(3)
                          callback('取消授权')
                          wx.hideLoading()
                          // console.log('用户再次拒绝授权地理位置')
                        }
                      }
                    })
                  } else if (res.cancel) {
                    wx.hideLoading()
                    wx.stopPullDownRefresh()
                    // console.log('用户点击取消')
                    callback('取消授权')
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
                  callback('获取成功')
                  console.log(4)
                },
                fail: function () {
                  console.log(5)
                  callback('取消授权')
                  // console.log(getCurrentPages())
                  wx.hideLoading()
                  // console.log('获取位置失败')
                  // let xx = wx.showModal({
                  //   title: '提示',
                  //   content: '获取位置信息失败，请打开GPS后重试',
                  //   success: function (res) {
                  //     if (res.confirm) {
                  //       callback('获取中')
                  //       // console.log('用户点击确定')
                  //       that.getLocation()
                  //     } else {
                  //       console.log(6)
                  //       callback('获取失败')
                  //       wx.hideLoading()
                  //       wx.stopPullDownRefresh()
                  //     }
                  //   }
                  // })
                  // wx.showToast({
                  //   title: '获取地理位置失败',
                  // })
                }
              })
            }
          },
        })
      }, 500)
    }
  },



  loadMsg(msg) {
    console.log(msg)
    let that = this
    let messageList = wx.getStorageSync('chatWith' + msg.from_user_id)
    wx.getStorage({
      key: 'chatIdWith' + msg.from_user_id,
      success: function(res) {},
      fail: function(){
        wx.setStorage({
          key: 'chatIdWith' + msg.from_user_id,
          data: {
            chat_id: msg.chat_id,
          }
        })
      }
    })
    // friendInfo: that.data.friendInfo,
    // storeInfo: app.globalData.storeInfo
    let postData = JSON.parse(msg.content)
    // 改变消息的状态，并添加来源消息发送时间
    postData.status = "sendOk"
    postData.time = msg.msg_time * 1000
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

    let now = new Date().getTime()
    // 如果本地存有这个消息缓存
    if (messageList !== '') {
      // console.log(messageList)
      if (messageList[messageList.length - 1].time + (1000 * 60 * 5) < now) {
        messageList.push({
          content: now,
          type: 'time'
        })
      }
      messageList.push(postData)
      wx.setStorageSync('chatWith' + msg.from_user_id, messageList)
      that.refreshChatRecords({
        newMessage: postData,
        friendInfo: friendInfo,
        storeInfo: storeInfo
      }, msgclean)
    } else {
      let messageList = []
      messageList.push({
        content: now,
        type: 'time'
      })
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

    console.log(NewMessage)

    // console.log(NewMessage)

    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let records = res.data
        // 查找之前是否保存过两人会话
        for (let i = 0; i < records.length; i++) {
          // TODO 加一个消息是否clean
          if (records[i].chatName === 'chatWith' + NewMessage.friendInfo.user_id) {

            records[i].friendInfo = NewMessage.friendInfo
            records[i].storeInfo = NewMessage.storeInfo
            records[i].msgClean = msgClean

            // 将最新聊天置顶
            records.unshift(records.splice(i, 1)[0])
            // 更新缓存
            wx.setStorageSync('chatRecords', records)
            // break
            return
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
        // console.log(res)
      }
    })

  },



  onShow: function () {

  },

  onUnlaunch: function () {
    wx.closeSocket()
    wx.onSocketClose(function (res) {
      // console.log('WebSocket 已关闭！')
    })


    clearInterval(this.globalData.checkLocationInterval)
  }

})