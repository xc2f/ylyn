// pages/chat/chat.js
import { upload } from '../../untils/update.js'

// const moment = require('../../untils/moment.js');
// moment.lang('zh-cn');

import { computeTime } from '../../untils/moment.js'

import objDeepCopy from '../../untils/objDeepCopy.js'

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

    faces: [
      {
        map1: [
          { key: '[:)]', value: 'e1' },
          { key: '[:D]', value: 'e2' },
          { key: '[;)]', value: 'e3' },
          { key: '[:-o]', value: 'e4' },
        ],
        map2: [
          { key: '[:s]', value: 'e5' },
          { key: '[:$]', value: 'e6' },
          { key: '[:(]', value: 'e7' },
          { key: '[:\'(]', value: 'e8' },
        ],
      },
      {
        map3: [
          { key: '[:-*]', value: 'e9' },
          { key: '[^o)]', value: 'e10' },
          { key: '[8-)]', value: 'e11' },
          { key: '[(|)]', value: 'e12' },
        ],
        map4: [
          { key: '[(#)]', value: 'e13' },
          { key: '[(R)]', value: 'e14' },
          { key: '[({)]', value: 'e15' },
          { key: '[(})]', value: 'e16' },
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
      chatBodyHeight: globalData.deviceInfo.windowHeight - 52,
    })

    that.setData({
      friendInfo: JSON.parse(options.friendinfo),
      storeId: app.globalData.storeInfo ? app.globalData.storeInfo.storeId : null
    })


    // 获取聊天信息
    wx.getStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      success: function (res) {
        let messages = objDeepCopy(res.data)
        messages.map(item => {
          if (item.type === 'time') {
            item.content = computeTime(item.content)
          }
        })

        // that.beautifyMsg(res.data, 2000)
        that.setData({
          messages: messages
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
    // console.time()
    let checkToView = setInterval(function () {
      if (that.data.messages.length !== 0 && new Date().getTime() - checkToViewTimeStamp > 1000) {
        that.setData({
          toView: 'm' + that.data.messages[that.data.messages.length - 1].msgId
        })
        // console.timeEnd()
        clearInterval(checkToView)
      }
      if (new Date().getTime() - checkToViewTimeStamp > 5000 && that.data.messages.length === 0) {
        clearInterval(checkToView)
      }
    }, 50)

    // 检查是否屏蔽
    wx.getStorage({
      key: 'chatStatusWith' + that.data.friendInfo.user_id,
      success: function (res) {
        if (res.data.isShield === true) {
          that.setData({
            isShield: true
          })
        }
      },
      fail: function () { }
    })

    // 本地是否有chatId,有则显示屏蔽，没有则不显示
    wx.getStorage({
      key: 'chatIdWith' + that.data.friendInfo.user_id,
      success: function (res) {
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
    if (that.data.isShield) {
      that.requestShield('cancleShield')
    } else {
      that.requestShield('toShield')
    }
  },


  refreshShield(setTrue, content, time) {
    let that = this
    that.setData({
      isShield: setTrue ? true : false,
    })
    wx.setStorageSync('chatStatusWith' + that.data.friendInfo.user_id, {
      isShield: setTrue ? true : false
    })
    let now = new Date().getTime()
    return {
      type: 'shield',
      content: content,
      msgId: now + '-' + app.globalData.userId,
      user_id: app.globalData.userId,
      status: 'sendOk',
      time: time || now
    }
  },

  requestShield(type) {
    let that = this
    wx.request({
      url: app.requestHost + (type === 'toShield' ? '/Chat/shield_user/' : '/Chat/cancel_shield/'),
      method: 'POST',
      data: {
        token: app.TOKEN,
        tuser_id: that.data.friendInfo.user_id,
        chat_id: that.data.chatId
      },
      success: function (res) {
        // console.log(res)

        if (res.data.code === 201 || res.data.code === 102) {


          let tempMessageList = wx.getStorageSync('chatWith' + that.data.friendInfo.user_id);
          let now = new Date().getTime()

          if (tempMessageList[tempMessageList.length - 1].time + (1000 * 60 * 5) < now) {
            tempMessageList.push({
              content: now,
              type: 'time'
            })
          }


          let postData = that.refreshShield(type === 'toShield' ? true : false, type === 'toShield' ? '您已将对方消息屏蔽' : '您已取消屏蔽', res.data.result.time * 1000)

          tempMessageList.push(postData)

          let showList = objDeepCopy(tempMessageList)

          showList.map(item => {
            if (item.type === 'time') {
              item.content = computeTime(item.content)
            }
          })

          that.setData({
            messages: showList,
          })

          // 消息发送后滚动到底部，在上一setData后
          that.setData({
            toView: 'm' + tempMessageList[tempMessageList.length - 1].msgId
          })

          wx.setStorage({
            key: 'chatWith' + that.data.friendInfo.user_id,
            data: tempMessageList,
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
      chatBodyHeight: this.data.deviceInfo.windowHeight - 52
    })
  },

  inputBlur() {
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

    that.setData({
      inputValue: '',
    })
    // let multiList = that.parseMsg(inputValue)

  },


  // 消息处理函数
  handleMsg(type, value) {
    let that = this
    let tempMessageList = wx.getStorageSync('chatWith' + that.data.friendInfo.user_id);
    // debugger
    let now = new Date().getTime()

    if (tempMessageList.length === 0) {
      tempMessageList.push({
        content: now,
        type: 'time'
      })
    } else if (tempMessageList[tempMessageList.length - 1].time + (1000 * 60 * 5) < now) {
      tempMessageList.push({
        content: now,
        type: 'time'
      })
    }

    // 创建一个msgid用作后面的消息状态更新
    let msgId = now + '-' + app.globalData.userId
    let postData = {
      type: type,
      content: value,
      msgId: msgId,
      user_id: app.globalData.userId,
      status: 'sending',
      time: now
    }

    tempMessageList.push(postData)

    // console.log(tempMessageList)

    // 深拷贝
    let showList = objDeepCopy(tempMessageList)

    // console.log(tempMessageList)

    showList.map(item => {
      if (item.type === 'time') {
        // console.log(item)
        item.content = computeTime(item.content)
      }
    })
    // debugger

    // console.log(showList)

    that.setData({
      messages: showList,
      value: '',
      isFocus: false,
    })

    // 消息发送后滚动到底部，在上一setData后
    that.setData({
      toView: 'm' + tempMessageList[tempMessageList.length - 1].msgId
    })

    wx.setStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      data: tempMessageList,
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
              if (res.data.code === 103) {
                // 对方已将您的消息屏蔽
                messages.push(that.refreshShield(false, '消息可能送往火星了', null))
              }
              if (res.data.code === 102) {
                // 您已将对方的消息屏蔽
                messages.push(that.refreshShield(true, '消息可能送往火星了', null))
              }
            }
            break
          }
        }

        // 深拷贝
        let showList = objDeepCopy(messages)

        showList.map(item => {
          if (item.type === 'time') {
            item.content = computeTime(item.content)
          }
        })

        that.setData({
          messages: showList
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
        // 深拷贝
        let showList = objDeepCopy(messages)

        showList.map(item => {
          if (item.type === 'time') {
            item.content = computeTime(item.content)
          }
        })

        that.setData({
          messages: showList
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

  sendPic() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePath = res.tempFilePaths[0]
        let suffix = tempFilePath.slice(tempFilePath.lastIndexOf('.'))
        let fileName = app.globalData.userId + '-' + new Date().getTime() + suffix
        upload('chatSendedImg', tempFilePath, fileName, resUrl => {
          // resUrl.data.access_url

          that.handleMsg('img', resUrl.data.access_url)

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
  // 弹起表情框
  toggleFace() {
    this.setData({
      faceShow: !this.data.faceShow,
    })
    // 避免表情弹起后遮挡聊天内容
    if (this.data.faceShow) {
      this.setData({
        chatBodyHeight: this.data.deviceInfo.windowHeight - 202 //184
      })
      this.setData({
        toView: 'm' + this.data.messages[this.data.messages.length - 1].msgId
      })
    } else {
      this.setData({
        chatBodyHeight: this.data.deviceInfo.windowHeight - 52
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

  // 发送表情
  sendEmoji(e) {
    let value = e.currentTarget.dataset.face
    this.handleMsg('face', value)
  },


  // 发送微信号
  sendCard() {
    let that = this
    // console.log(this.data.meInfo.wechat_num)
    let value = this.data.meInfo.wechat_num
    if (value.trim() === '') {
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
      wx.showModal({
        title: '提示',
        content: '发送微信号？',
        success: function (res) {
          if (res.confirm) {
            that.handleMsg('card', '我的微信号：' + value)
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }
  },


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

    that.pageName = 'chatWith' + that.data.friendInfo.user_id

    console.log('on show')

    console.log(that.data.messages.length)



    setTimeout(function () {
      // 存最后一条消息的msgId, 有新消息来后跟msgId比对，不同则定位到页面底部
      if (that.data.messages.length !== 0) {

        // console.log('in')

        // console.log('in timeout')

        // 第一次发消息没有msgId
        let lastMsgId = that.data.messages[that.data.messages.length - 1].msgId
        // 监听消息
        that.data.checkMsgStatusInterval = setInterval(function () {

          // console.log('in interval')

          wx.getStorage({
            key: 'chatWith' + that.data.friendInfo.user_id,
            success: function (res) {
              let messages = objDeepCopy(res.data)
              messages.map(item => {
                if (item.type === 'time') {
                  item.content = computeTime(item.content)
                }
              })

              that.setData({
                messages: messages
              })

              let newMsgId = messages[messages.length - 1].msgId
              if (lastMsgId !== newMsgId) {
                // 消息发送后滚动到底部，在上一setData后
                that.setData({
                  toView: 'm' + newMsgId
                })
                lastMsgId = newMsgId
              }
            },
          })
        }, 2000)
      }
    }, 1000)
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
  // onShareAppMessage: function () {

  // }
})