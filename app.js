import { requestHost, socketUrl } from './untils/config.js'

App({

  globalData: {
    // 设备信息
    deviceInfo: null,
    // socket重连次数
    connectTimes: 0,
    // socket连接中断
    socketBroken: false,
    // 坐标缓存
    coordinate: null,
    // 登录用户id
    userId: null,
    // 扫码商家及桌号
    storeInfo: null,
    // 登录凭据
    client_id: null,
    // 是否有新消息或未读消息
    msgClean: true,
    // 是否登录
    login: false,
    // 是否要显示分享
    noShowShare: true,
    // 定时发送socket ping包
    sendSocketMsgInterval: null
  },

  TOKEN: null,
  requestHost: requestHost,

  onLaunch: function () {
    // 获取设备信息
    this.getDeviceInfo()
    // 获取本地消息状态
    this.getMsgStatus()
  },

  /**
   * 获取是否有未读消息状态
   **/
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
    }, 2000)
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
   * @params autoLoginCallback - 自动登录callback
   */
  connectWebsocket(connectType, manualLoginCallback, autoLoginCallback) {
    // wx.closeSocket()
    // console.log('in socket')
    let that = this
    // 连接websocket
    wx.connectSocket({
      url: socketUrl
    })

    wx.onSocketOpen(function (res) {
      // console.log('----- socket open -----')
      // console.log(res)
      // console.log('WebSocket连接已打开！')
      that.globalData.sendSocketMsgInterval = setInterval(function(){
        // console.log('----- ping -------')
        wx.sendSocketMessage({
          data: 'ping'
        })
      }, 30000)

      // 监听消息
      wx.onSocketMessage(function (res) {
        // console.log('-------- socket msg ------------')
        // console.log(res)
        let data = JSON.parse(res.data)
        // console.log(data)
        if (data.type === 'init') {
          that.globalData.client_id = data.client_id
          if (connectType === 'manual') {
            manualLoginCallback(data.client_id)
          } else {
            if (that.globalData.socketBroken) {
              that.globalData.socketBroken = false
              // 店外重连和店内重连
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
              that.login(autoLoginCallback)
            }
          }
        } else if( data.type === 'ping'){
          return 
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
      clearInterval(that.globalData.sendSocketMsgInterval)
      // wx.closeSocket()
      // console.log('WebSocket 已关闭！')
      that.connectWebsocket('auto', null, null)
    })
  },


  // rebuild ok
  login(callback) {
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
        if(res.data.code === 201 || res.data.code === 202){
          if (res.data.code === 202) {
            that.TOKEN = res.data.result.token
            wx.setStorageSync('TOKEN', res.data.result.token)
          }
          that.globalData.login = true
          // 存储userid
          that.globalData.userId = res.data.result.user_id
          // 回调
          callback(true)
          // 未读消息
          let unreadMsg = res.data.result.unread_msg
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
        } else {
          wx.showModal({
            title: '提示',
            content: '登录失败',
            showCancel: false
          })
          that.globalData.login = false
          callback(false)
        }
      },
      fail: function (e) {
        wx.showModal({
          title: '提示',
          content: '登录失败',
          showCancel: false
        })
        that.globalData.login = false
        callback(false)
      }
    })
  },

  manualLogin(encryptedData, iv, callback) {
    let that = this
    that.connectWebsocket('manual', client_id => {
      wx.login({
        success: function (res) {
          if (res.code) {
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
                if (res.data.code === 201) {
                  // 存储TOKEN
                  that.TOKEN = res.data.result.token
                  wx.setStorageSync('TOKEN', res.data.result.token)
                  // 存储userid
                  that.globalData.userId = res.data.result.user_id

                  // 执行回调
                  callback(true)

                  // 未读消息
                  let unreadMsg = res.data.result.unread_msg
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
                } else {
                  callback(false)
                }
              },
              fail: function (e) {
                // request请求失败
                callback(false)
              }
            })
          } else {
            // res.code 为 null
            callback(false)
          }
        },
        fail: function(){
          // wx.login接口调用失败
          callback(false)
        }
      })
    }, null)
  },

  // rebuild ok
  getLocation(callback) {
    let that = this
    if (wx.getSetting) {
      setTimeout(function () {
        wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userLocation'] === false) {
              // 用户拒绝位置授权时的提示
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
                              callback(true)
                            },
                            fail: function () {
                              // 用户重新授权，但获取位置失败
                              callback(false)
                            }
                          })
                        } else {
                          // 用户在设置界面未授权
                          callback(false)
                        }
                      }
                    })
                  } else if (res.cancel) {
                    // 用户再次拒绝授权
                    callback(false)
                  }
                }
              })
            } else {
              // 第一次或用户允许位置授权时的请求位置
              wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                  that.globalData.coordinate = {
                    latitude: res.latitude,
                    longitude: res.longitude
                  }
                  callback(true)
                },
                fail: function () {
                  // 获取位置失败
                  callback(false)
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
    // 获取chatid
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

    // let time = new Date().getTime()
    // 如果本地存有这个消息缓存
    if (messageList !== '') {
      // console.log(messageList)
      if (messageList[messageList.length - 1].time + (1000 * 60 * 5) < postData.time) {
        messageList.push({
          content: postData.time,
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
        content: postData.time,
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

    // console.log(NewMessage)

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


    // clearInterval(this.globalData.checkLocationInterval)
  }

})