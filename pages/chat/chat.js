// pages/chat/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toTop: 0,
    deviceInfo: null,
    chatBodyHeight: 0,

    isFocus: false,
    inputValue: '',
    meInfo: null,
    friendInfo: null,
    shopName: null,
    messages: [],

    setChatRecordOk: false,

    // 表情
    faceShow: false,
    chatBarChangeHeightAnimation: {},
    divisionSlideToRightAnimation: {},
    faceOpacityAnimation: {},

    faceMap: {
      '[:)]': 'ee_1.png',
      '[:D]': 'ee_2.png',
      '[;)]': 'ee_3.png',
      '[:-o]': 'ee_4.png',
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
          { key: '[:)]', value: 'ee_1.png' },
          { key: '[:D]', value: 'ee_2.png' },
          { key: '[;)]', value: 'ee_3.png' },
          { key: '[:-o]', value: 'ee_4.png' },
          { key: '[:p]', value: 'ee_5.png' },
          { key: '[(H)]', value: 'ee_6.png' },
          { key: '[:@]', value: 'ee_7.png' }
        ],
        map2: [
          { key: '[:s]', value: 'ee_8.png' },
          { key: '[:$]', value: 'ee_9.png' },
          { key: '[:(]', value: 'ee_10.png' },
          { key: '[:\'(]', value: 'ee_11.png' },
          { key: '[:|]', value: 'ee_12.png' },
          { key: '[(a)]', value: 'ee_13.png' },
          { key: '[8o|]', value: 'ee_14.png' }
        ],
        map3: [
          { key: '[8-|]', value: 'ee_15.png' },
          { key: '[+o(]', value: 'ee_16.png' },
          { key: '[<o)]', value: 'ee_17.png'},
          { key: '[|-)]', value: 'ee_18.png' },
          { key: '[*-)]', value: 'ee_19.png' },
          { key: '[:-#]', value: 'ee_20.png' },
          { key: '[del]', value: 'del.png' }
        ]
      },
      {
        map4: [
          { key: '[:-*]', value: 'ee_21.png' },
          { key: '[^o)]', value: 'ee_22.png' },
          { key: '[8-)]', value: 'ee_23.png' },
          { key: '[(|)]', value: 'ee_24.png' },
          { key: '[(u)]', value: 'ee_25.png' },
          { key: '[(S)]', value: 'ee_26.png' },
          { key: '[(*)]', value: 'ee_27.png' }
        ],
        map5: [
          { key: '[(#)]', value: 'ee_28.png' },
          { key: '[(R)]', value: 'ee_29.png' },
          { key: '[({)]', value: 'ee_30.png' },
          { key: '[(})]', value: 'ee_31.png' },
          { key: '[(k)]', value: 'ee_32.png' },
          { key: '[(F)]', value: 'ee_33.png' },
          { key: '[(D)]', value: 'ee_34.png' }
        ],
        map6: [
          { key: '[:\'(]', value: 'ee_11.png' },
          { key: '[:|]', value: 'ee_12.png' },
          { key: '[(a)]', value: 'ee_13.png' },
          { key: '[8o|]', value: 'ee_14.png' },
          { key: '[(D)]', value: 'ee_35.png' },
          { key: '[:s]', value: 'ee_8.png' },
          { key: '[del]', value: 'del.png' }
        ]
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
      chatBodyHeight: globalData.deviceInfo.windowHeight - 50
    })


    that.setData({
      toTop: 10000,
      meInfo: globalData.meInfo,
      friendInfo: JSON.parse(options.friend),
      shopName: options.shopname
    })

    // 获取聊天信息
    wx.getStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      success: function (res) {
        console.log(res)
        that.setData({
          messages: res.data
        })
      },
      fail: function (e) {
        console.log(e)
      }
    })

    // 设置导航条
    wx.setNavigationBarTitle({
      title: that.data.friendInfo.nickName
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


  // 发送文本消息，包括表情
  submit() {
    let that = this
    let inputValue = that.data.inputValue
    
    if (inputValue.trim() === '') {
      return false
    }

    let multiList = that.parseMsg(inputValue)

    let tempMessageList = that.data.messages;

    let postData = {
      user_id: that.data.meInfo.user_id,
      friend_id: that.data.friendInfo.user_id,
      type: 'mult',
      content: multiList,
      date: new Date().getTime(),
      status: getApp().globalData.webSocketError ? 'error' : ''
    }

    tempMessageList.push(postData)

    that.setData({
      messages: tempMessageList,
      inputValue: '',
      isFocus: false,
    })
    // 消息发送后滚动到底部，在上一setData后
    that.setData({
      toTop: that.data.toTop + 500
    })
    
    wx.setStorage({
      key: 'chatWith' + that.data.friendInfo.user_id,
      data: that.data.messages,
    })

    // 将本次会话记录写入消息列表
    getApp().refreshChatRecords(postData)
    

  },

  // 消息中文字与表情的处理
  parseMsg(inputValue){
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
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function (res) {
            // 存储图片到消息
            let tempMessageList = that.data.messages;
            tempMessageList.push({
              user_id: that.data.meInfo.user_id,
              content: res.savedFilePath,
              type: 'img',
              date: new Date().getTime()
            })
            that.setData({
              messages: tempMessageList,
            })
            that.setData({
              toTop: that.data.toTop + 500
            })
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
    if(this.data.faceShow){
      this.setData({
        chatBodyHeight: this.data.deviceInfo.windowHeight - 184
      })
      this.setData({
        toTop: this.data.toTop + 200
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


  sendFace(e){
    // console.log(e.currentTarget.dataset.face)
    let face = e.currentTarget.dataset.face
    let inputValue = this.data.inputValue
    if(face !== '[del]') {
      this.setData({
        inputValue: inputValue + e.currentTarget.dataset.face,
        isFocus: true
      })
    } else {
      // 如果字符串最后一位不是以]结尾，暂不考虑是不是表情
      let restFace
      if (inputValue[inputValue.length-1] !== ']'){
        restFace = inputValue.substring(0, inputValue.length-1)
      } else {
        restFace = inputValue.substring(0, inputValue.lastIndexOf('['))
      }
      this.setData({
        inputValue: restFace,
        isFocus: true
      })
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

  }
})