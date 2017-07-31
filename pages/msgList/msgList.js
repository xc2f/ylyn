// pages/msgList/msgList.js
let app = getApp()
import { deleteFile } from '../../untils/update.js'

import fromNow from '../../untils/moment.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatRecords: null,
    isFullStorage: false,
    moveXStamp: 0,
    wrapAnimation: {},
    removeAnimation: {},
    toLeft: true,
    checkMsgStatusInterval: null,
    testSrc: null,
    showShield: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.renderList()

    that.computeFileSize()
    
  },

  checkShield(){
    let that = this
    wx.request({
      url: app.requestHost + 'Chat/get_shield_list/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success: function (res) {
        // console.log(res)
        if (res.data.result.length !== 0) {
          that.setData({
            showShield: true
          })
        } else {
          that.setData({
            showShield: false
          })
        }
      }
    })
  },

  closesocket(){
    wx.closeSocket()
  },
  computeFileSize(){
    let that = this
    // 获取本地缓存和文件大小
    wx.getStorageInfo({
      success: function (res) {
        let limitSize = res.limitSize
        let storageSize = res.currentSize
        wx.getSavedFileList({
          success: function (res) {
            let fileSize = 0
            for (let i = 0; i < res.fileList.length; i++) {
              fileSize += res.fileList[i].size / 1000
            }
            let totalSize = storageSize + fileSize
            // console.log('totalSize: ' + totalSize)
            if (totalSize > limitSize - 1024 * 2) {
              that.setData({
                isFullStorage: true
              })
            } else {
              that.setData({
                isFullStorage: false
              })
            }
          }
        })
      },
    })
  },

  toShop(e){
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?store_id=' + e.currentTarget.dataset.shopid,
    })
  },

  renderList(){
    let that = this
    wx.getStorage({
      key: 'chatRecords',
      success: function (res) {
        // console.log(res)
        let records = res.data
        let recordList = []
        // 获取每条聊天记录的最后一条内容
        for (let i = 0; i < records.length; i++) {
          // 防止异步
          let msg = wx.getStorageSync(records[i].chatName)
          // console.log(msg)
          let newestMsg = msg[msg.length - 1]
          // console.log(msg)
          if (newestMsg.type === 'text') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'img') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[图片]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'face') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[表情]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'shield') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          } else if (newestMsg.type === 'card') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean
            })
          }
        }
        that.setData({
          chatRecords: recordList.length === 0 ? null : recordList
        })
      },
      fail: function (res) {
        // console.log('no records')
      }
    })
  },


  tapToChat(e){
    wx.navigateTo({
      url: '/pages/chat/chat?friendinfo='+JSON.stringify(e.currentTarget.dataset.friendinfo)
    })
  },

  removeChat(e) {
    let userId = e.currentTarget.dataset.userid
    wx.getStorage({
      key: 'chatWith'+userId,
      success: function(res) {
        for(let i=0; i<res.data.length; i++){
          if(res.data[i].type === 'img'){
            wx.removeSavedFile({
              filePath: res.data[i].content,
              complete: function (res) {
              }
            })
          }
        }
        // TODO删除对话缓存中的链接的图片
      },
    })

    // 删除具体缓存
    wx.removeStorage({
      key: 'chatWith'+userId,
      success: function(res) {
        // console.log('chatWith' + userId + '已删除!')
      },
    })
    // 从chatRecords中移除该key
    wx.getStorage({
      key: 'chatRecords',
      success: function(res) {
        let data = res.data
        for(let i=0; i<data.length; i++){
          if(data[i].chatName === 'chatWith'+userId){
            data.splice(i, 1)
            wx.setStorageSync('chatRecords', data)
            break
          }
        }
      },
    })

    let that = this
    setTimeout(function(){
      that.renderList()
    }, 500)

    that.computeFileSize()
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置  
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var that = this
    initdata(that)
    if (e.touches.length == 1) {
      //手指移动时水平方向位置  
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值  
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变  
        txtStyle = "left:0px";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离  
        txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度  
          txtStyle = "left:-" + delBtnWidth + "px";
        }
      }
      //获取手指触摸的是哪一项  
      var index = e.target.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态  
      this.setData({
        list: list
      });
    }
  },

  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置  
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离  
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮  
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
      //获取手指触摸的是哪一项  
      var index = e.target.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态  
      this.setData({
        list: list
      });
    }
  },  

  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  // blockMove(e){
  //   let mx = e.changedTouches[0].pageX
    
  //   let moveXStamp = this.data.moveXStamp
  //   if (moveXStamp === 0) {
  //     this.setData({
  //       moveXStamp: mx
  //     })
  //   }
  //   console.log(mx, moveXStamp)
  //   if (mx < moveXStamp && this.data.toLeft) {
  //     // 只调用一次
  //     this.setData({
  //       wrapAnimation: this.basicAnimation(300, 0).left(-100).step().export(),
  //       removeAnimation: this.basicAnimation(300, 0).right(0).step().export(),
  //       toLeft: false
  //     })
  //   } else {
  //     this.setData({
  //       wrapAnimation: this.basicAnimation(300, 0).left(0).step().export(),
  //       removeAnimation: this.basicAnimation(300, 0).right(-100).step().export(),
  //       toLeft: true
  //     })
  //   }
  //   // console.log('mx: '+mx, 'moveXStamp: '+moveXStamp)
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
    that.data.checkMsgStatusInterval = setInterval(function(){
      that.renderList()
    }, 2000)

    // 检查是否有屏蔽用户
    that.checkShield()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
    clearInterval(that.data.checkShieldInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this
    clearInterval(that.data.checkMsgStatusInterval)
    clearInterval(that.data.checkShieldInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },

  clearStorage(){
    wx.clearStorage()
  },


})