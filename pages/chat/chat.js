// pages/chat/chat.js
var app = getApp()

Page({

  pageName: 'chat',

  /**
   * 页面的初始数据
   */
  data: {
    toView: null,
    deviceInfo: null,
    chatBodyHeight: 0,

    isFocus: false,
    inputValue: '',
    meInfo: null,
    friendInfo: null,
    storeId: null,
    messages: [],

    checkMsgStatusInterval: null,
    isShield: false,
    showShield: false,
    chatId: null,

    // 表情
    faceShow: false,
    chatBarChangeHeightAnimation: {},
    divisionSlideToRightAnimation: {},
    faceOpacityAnimation: {},

    faceMap: {
      '[:)]': 'e1.png',
      '[:D]': 'e2.png',
      '[;)]': 'e3.png',
      '[:-o]': 'e4.png',
      '[:p]': 'ee_5.png',
      '[(H)]': 'ee_6.png',
      '[:@]': 'ee_7.png',
      '[:s]': 'ee_8.png',
      '[:$]': 'ee_9.png',
      '[:(]': 'ee_10.png',
      '[:\'(]': 'ee_11.png',
      '[:|]': 'ee_12.png',
      '[(a)]': 'ee_13.png',
      '[8o|]': 'ee_14.png',
      '[8-|]': 'ee_15.png',
      '[+o(]': 'ee_16.png',
      '[<o)]': 'ee_17.png',
      '[|-)]': 'ee_18.png',
      '[*-)]': 'ee_19.png',
      '[:-#]': 'ee_20.png',
      '[:-*]': 'ee_21.png',
      '[^o)]': 'ee_22.png',
      '[8-)]': 'ee_23.png',
      // '[del]': 'btn_del.png',
      '[(|)]': 'ee_24.png',
      '[(u)]': 'ee_25.png',
      '[(S)]': 'ee_26.png',
      '[(*)]': 'ee_27.png',
      '[(#)]': 'ee_28.png',
      '[(R)]': 'ee_29.png',
      '[({)]': 'ee_30.png',
      '[(})]': 'ee_31.png',
      '[(k)]': 'ee_32.png',
      '[(F)]': 'ee_33.png',
      '[(W)]': 'ee_34.png',
      '[(D)]': 'ee_35.png',
      '[del]': 'btn_del.png'
    },
    faces: [
      {
        map1: [
          { key: '[:)]', value: 'e1' },
          { key: '[:D]', value: 'e2' },
          { key: '[;)]', value: 'e3' },
          { key: '[:-o]', value: 'e4' },
        ],
        map2: [
          { key: '[:s]', value: 'ee_8.png' },
          { key: '[:$]', value: 'ee_9.png' },
          { key: '[:(]', value: 'ee_10.png' },
          { key: '[:\'(]', value: 'ee_11.png' },
        ],
      },
      {
        map3: [
          { key: '[:-*]', value: 'ee_21.png' },
          { key: '[^o)]', value: 'ee_22.png' },
          { key: '[8-)]', value: 'ee_23.png' },
          { key: '[(|)]', value: 'ee_24.png' },
        ],
        map4: [
          { key: '[(#)]', value: 'ee_28.png' },
          { key: '[(R)]', value: 'ee_29.png' },
          { key: '[({)]', value: 'ee_30.png' },
          { key: '[(})]', value: 'ee_31.png' },
        ],
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;

    let globalData = getApp().globalData

    that.setData({
      deviceInfo: globalData.deviceInfo,
      // 屏幕高度减去chatBar的高度，为消息窗口高度
      chatBodyHeight: globalData.deviceInfo.windowHeight - 50,
    })

    that.setData({
      friendInfo: JSON.parse(options.friendinfo),
      storeId: app.globalData.storeInfo ? app.globalData.storeInfo.storeId : null
    })

    // 获取本人信息
    // wx.getStorage({
    //   key: 'meInfo',
    //   success: function (res) {
    //     that.setData({
    //       meInfo: res.data
    //     })
    //   },
    // })

    // 获取聊天信息
    wx.getStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      success: function (res) {
        that.setData({
          messages: res.data,
        })
      },
      fail: function (e) {
      }
    })

    // 设置导航条
    wx.setNavigationBarTitle({
      title: that.data.friendInfo.nickname
    })


    // 滚动到页面底部
    let checkToViewTimeStamp = new Date().getTime()
    let checkToView = setInterval(function () {
      if (that.data.messages.length !== 0) {
        that.setData({
          toView: 'm' + that.data.messages[that.data.messages.length - 1].msgId
        })
      }
      if (new Date().getTime() - checkToViewTimeStamp > 3000) {
        clearInterval(checkToView)
      }
    }, 50)

    // 检查是否屏蔽
    wx.getStorage({
      key: 'chatStatusWith' + that.data.friendInfo.user_id,
      success: function(res) {
        if (res.data.isShield === true) {
          that.setData({
            isShield: true
          })
        }
      },
      fail: function(){}
    })

    // 本地是否有chatId,有则显示屏蔽，没有则不显示
    wx.getStorage({
      key: 'chatIdWith' + that.data.friendInfo.user_id,
      success: function(res) {
        console.log(res)
        that.setData({
          showShield: true,
          chatId: res.data.chat_id
        })
      },
    })


    // 重置消息状态
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        let data = res.data
        for (let i = 0; i < data.length; i++) {
          if (data[i].chatName === 'chatWith' + that.data.friendInfo.user_id) {
            data[i].msgClean = true
            break
          }
        }
        wx.setStorageSync('chatRecords', data)
      },
    })

  },


  closeShield() {
    this.setData({
      showShield: false
    })
  },

  toShield() {
    let that = this
    if (that.data.isShield){
      that.requestShield('cancleShield')
    } else {
      that.requestShield('toShield')
    }
  },

  // cancleShield(){
  //   let that = this
  //   wx.request({
  //     url: app.requestHost + '/Chat/cancel_shield/',
  //     method: 'POST',
  //     data: {
  //       token: app.TOKEN,

  //     }
  //   })
  // },

  requestShield(type){
    let that = this
    wx.request({
      url: app.requestHost + (type === 'toShield' ? '/Chat/shield_user/' : '/Chat/cancel_shield/'),
      method: 'POST',
      data: {
        token: app.TOKEN,
        tuser_id: that.data.friendInfo.user_id,
        chat_id: that.data.chatId
      },
      success: function(res){
        console.log(res)

        if(res.data.code === 201 || res.data.code === 102){
          that.setData({
            isShield: type === 'toShield' ? true : false,
          })
          wx.setStorageSync('chatStatusWith' + that.data.friendInfo.user_id, {
            isShield: type === 'toShield' ? true : false
          })

          let tempMessageList = that.data.messages;

          let now = new Date().getTime()
          let postData = {
            type: 'shield',
            content: type === 'toShield' ? '您已将对方消息屏蔽' : '您已取消屏蔽',
            msgId: now + '-' + app.globalData.userId,
            user_id: app.globalData.userId,
            status: 'sendOk',
            time: res.data.result.time * 1000 || now
          }

          tempMessageList.push(postData)

          that.setData({
            messages: tempMessageList,
          })

          // 消息发送后滚动到底部，在上一setData后
          that.setData({
            toView: 'm' + that.data.messages[that.data.messages.length - 1].msgId
          })

          wx.setStorage({
            key: 'chatWith' + that.data.friendInfo.user_id,
            data: that.data.messages,
          })

          // 将本次会话记录写入消息列表
          getApp().refreshChatRecords({
            newMessage: postData,
            friendInfo: that.data.friendInfo,
            storeInfo: app.globalData.storeInfo
          }, true)

        }
      }
    })
  },

  inputFocus() {
    if (this.data.inputValue !== '') {
      this.setData({
        isFocus: true,
      })
    } else {
      this.setData({
        isFocus: false,
      })
    }
    this.setData({
      faceShow: false,
      chatBodyHeight: this.data.deviceInfo.windowHeight - 50
    })
  },

  inputBlur() {
    this.setData({
      isFocus: false
    })
  },

  inputHandle(e) {
    this.setData({
      inputValue: e.detail.value
    })
    if (this.data.inputValue !== '') {
      this.setData({
        isFocus: true,
      })
    } else {
      this.setData({
        isFocus: false,
      })
    }
  },


  // 发送文本消息
  submit(type) {
    let that = this
    let value = that.data.inputValue
    if (value.trim() === '') {
      return false
    }
    that.handleMsg('text', value)

    // let multiList = that.parseMsg(inputValue)

  },


  handleMsg(type, value){
    let that = this
    let tempMessageList = that.data.messages;

    // 创建一个msgid用作后面的消息状态更新
    let msgId = new Date().getTime() + '-' + app.globalData.userId
    let postData = {
      type: type,
      content: value,
      msgId: msgId,
      user_id: app.globalData.userId,
      status: 'sending'
    }

    tempMessageList.push(postData)

    that.setData({
      messages: tempMessageList,
      value: '',
      isFocus: false,
    })

    // 消息发送后滚动到底部，在上一setData后
    that.setData({
      toView: 'm' + that.data.messages[that.data.messages.length - 1].msgId
    })


    wx.setStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      data: that.data.messages,
    })

    // console.log(that.data.friendInfo.user_id, postData, that.data.storeId)
    wx.request({
      url: app.requestHost + 'Chat/send_message/',
      method: 'POST',
      data: {
        tuser_id: that.data.friendInfo.user_id,
        token: app.TOKEN,
        content: JSON.stringify(postData),
        store_id: that.data.storeId
      },
      success: function (res) {
        console.log(res)
        let messages = wx.getStorageSync('chatWith' + that.data.friendInfo.user_id)
        for (let i = messages.length; i--; i > 0) {
          if (messages[i].msgId === msgId) {
            // 屏蔽是102
            if (res.data.code === 201) {
              messages[i].status = 'sendOk'
              messages[i].time = res.data.result.time * 1000
            } else {
              messages[i].status = 'fail'
              // 失败消息的时间？
            }
            break
          }
        }
        that.setData({
          messages: messages
        })
        wx.setStorage({
          key: 'chatWith' + that.data.friendInfo.user_id,
          data: messages,
        })

        let chat_id = res.data.result.chat_id
        wx.getStorage({
          key: 'chatIdWith' + that.data.friendInfo.user_id,
          success: function (res) { },
          fail: function () {
            wx.setStorage({
              key: 'chatIdWith' + that.data.friendInfo.user_id,
              data: {
                chat_id: chat_id,
              }
            })
          }
        })
      },
      fail: function () {
        let messages = wx.getStorageSync('chatWith' + that.data.friendInfo.user_id)
        for (let i = messages.length; i--; i > 0) {
          if (messages[i].msgId === msgId) {
            messages[i].status = 'fail'
            break
          }
        }
        that.setData({
          messages: messages
        })
        wx.setStorage({
          key: 'chatWith' + that.data.friendInfo.user_id,
          data: messages,
        })
      },
    })

    // 将本次会话记录写入消息列表
    getApp().refreshChatRecords({
      newMessage: postData,
      friendInfo: that.data.friendInfo,
      storeInfo: app.globalData.storeInfo
    }, true)
  },



  // 消息中文字与表情的处理
  parseMsg(inputValue) {
    let multiList = []

    while (inputValue.length !== 0) {

      // 如果找到表情开头的[
      if (inputValue.indexOf('[') !== -1) {
        let left = inputValue.indexOf('[')
        let right = inputValue.indexOf(']')
        // 提取第一个边界为[]的字符串
        let faceChar = inputValue.substring(left, right + 1)
        // 如果在faceMap中有映射，说明是表情
        if (this.data.faceMap[faceChar] !== undefined) {
          // 拿到表情对应的图片地址
          let faceCharSrc = this.data.faceMap[faceChar]
          // 文字和表情存到数组
          if (left !== 0) {
            multiList.push({
              type: 'text',
              content: inputValue.substring(0, left)
            })
          }
          multiList.push({
            type: 'face',
            src: faceCharSrc
          })
          inputValue = inputValue.substring(right + 1, inputValue.length)
          // 继续查找下一个
        } else {
          // 在faceMap中没有对应
          // 存文字到数组
          // 查找下一个
          multiList.push({
            type: 'text',
            content: inputValue.substring(0, right + 1)
          })
          inputValue = inputValue.substring(right + 1, inputValue.length)
        }
      } else {
        // 如果没有找到[
        // 没有发送表情或者表情截取完毕的剩余部分
        multiList.push({
          type: 'text',
          content: inputValue
        })
        inputValue = ''
      }
    }

    return multiList
  },

  sendPic() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePaths = res.tempFilePaths
        let msgId = new Date().getTime() + '-' + app.globalData.userId
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function (res) {
            let savedFilePath = res.savedFilePath
            // 存储图片到消息
            let tempMessageList = that.data.messages;
            let postData = {
              type: 'img',
              content: savedFilePath,
              msgId: msgId,
              status: 'sending'
            }
            tempMessageList.push(postData)
            that.setData({
              messages: tempMessageList,
            })
            that.setData({
              toView: 'm' + that.data.messages[that.data.messages.length - 1].msgId
            })
            wx.setStorage({
              key: 'chatWith' + that.data.friendInfo.user_id,
              data: that.data.messages,
            })
            // 将本次会话记录写入消息列表
            app.refreshChatRecords({
              newMessage: postData,
              friendInfo: that.data.friendInfo,
              storeInfo: app.globalData.storeInfo
            }, true)
          }
        })
      },
    })

    // 获取本地缓存和文件大小
    wx.getStorageInfo({
      success: function (res) {
        let limitSize = res.limitSize
        let storageSize = res.currentSize
        wx.getSavedFileList({
          success: function (res) {
            let fileSize = 0
            for (let i = 0; i < res.fileList.length; i++) {
              fileSize += res.fileList[i].size
            }
            let totalSize = storageSize + fileSize
            if (totalSize < limitSize - 1024 * 2) {

            }
          }
        })
      },
    })
  },
  // 预览图片
  prevImg(e) {
    // console.log(e)
    wx.previewImage({
      current: '', // 当前显示图片的http链接，可以实现当前聊天下所有图片预览时，第一张显示点击的图片
      urls: [e.currentTarget.dataset.src]
    })
  },
  // 发送表情
  toggleFace() {
    this.setData({
      faceShow: !this.data.faceShow,
    })
    // 避免表情弹起后遮挡聊天内容
    if (this.data.faceShow) {
      this.setData({
        chatBodyHeight: this.data.deviceInfo.windowHeight - 184
      })
      this.setData({
        toView: 'm' + this.data.messages[this.data.messages.length - 1].msgId
      })
    } else {
      this.setData({
        chatBodyHeight: this.data.deviceInfo.windowHeight - 50
      })
    }
  },

  faceShowAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration,
      timingFunction: "ease",
      delay: delay
    });
    return animation;
  },


  sendFace(e) {
    // console.log(e.currentTarget.dataset.face)
    let face = e.currentTarget.dataset.face
    let inputValue = this.data.inputValue
    if (face !== '[del]') {
      this.setData({
        inputValue: inputValue + e.currentTarget.dataset.face,
        isFocus: true
      })
    } else {
      // 如果字符串最后一位不是以]结尾，暂不考虑是不是表情
      let restFace
      if (inputValue[inputValue.length - 1] !== ']') {
        restFace = inputValue.substring(0, inputValue.length - 1)
      } else {
        restFace = inputValue.substring(0, inputValue.lastIndexOf('['))
      }
      this.setData({
        inputValue: restFace,
        isFocus: true
      })
    }
  },

  sendEmoji(e) {
    let value = e.currentTarget.dataset.face
    this.handleMsg('face', value)
  },

  sendCard(){

    let value = this.data.meInfo.wechat_num
    if(value === ''){
      wx.showModal({
        title: '您未填写微信号',
        content: '前去设置？',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/config/config',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      this.handleMsg('card', '我的微信号：' + value)
    }
  },
  // chatBarChangeHeight() {
  //   let animation = wx.createAnimation({
  //     duration: 500,
  //     timingFunction: "ease",
  //     delay: 0
  //   }).height(150).step();

  //   return animation.export();
  // },

  // divisionSlideToRight() {
  //   let animation = wx.createAnimation({
  //     duration: 100,
  //     timingFunction: "ease",
  //     delay: 500
  //   }).width('100%').step();

  //   return animation.export();
  // },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {    
    let that = this

    // 获取本人信息，放这里是因为若是从设置页返回则更新数据
    wx.getStorage({
      key: 'meInfo',
      success: function (res) {
        that.setData({
          meInfo: res.data
        })
      },
    })

    that.pageName = 'chatWith' + that.data.friendInfo.user_id,

    // 监听消息
      that.data.checkMsgStatusInterval = setInterval(function () {
        wx.getStorage({
          key: 'chatWith' + that.data.friendInfo.user_id,
          success: function (res) {
            that.setData({
              messages: res.data
            })
          },
        })
      }, 2000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
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