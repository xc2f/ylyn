// pages/msgList/msgList.js
let app = getApp()
import { deleteFile } from '../../untils/update.js'

import fromNow from '../../untils/moment.js'

import wxviewType from '../../untils/wxview.js'

var touchData = {
  init: function () {
    this.firstTouchX = 0;
    this.firstTouchY = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastTouchTime = 0;
    this.swipeDirection = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.totalDelateX = 0;
    this.speedY = 0;
  },
  touchstart: function (e) {
    this.init();
    this.firstTouchX = this.lastTouchX = e.touches[0].clientX;
    this.firstTouchY = this.lastTouchY = e.touches[0].clientY;
    this.lastTouchTime = e.timeStamp;
  },
  touchmove: function (e) {
    this.deltaX = e.touches[0].clientX - this.lastTouchX;
    this.deltaY = e.touches[0].clientY - this.lastTouchY;
    this.totalDelateX += this.deltaX;
    this.lastTouchX = e.touches[0].clientX;
    this.lastTouchY = e.touches[0].clientY;
    this.lastTouchTime = e.timeStamp;
    if (this.swipeDirection === 0) {
      if (Math.abs(this.deltaX) > Math.abs(this.deltaY)) {
        this.swipeDirection = 1;
      }
      else {
        this.swipeDirection = 2;
      }
    }
  },
  touchend: function (e) {
    var deltaTime = e.timeStamp - this.lastTouchTime;
    this.speedY = this.deltaY / deltaTime;
  }
}

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
    showShield: false,

    // 删除动画
    swipeCheckX: 35, //激活检测滑动的阈值
    swipeCheckState: 0, //0未激活 1激活
    maxMoveLeft: 185, //消息列表项最大左滑距离
    correctMoveLeft: 175, //显示菜单时的左滑距离
    thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
    lastShowMsgId: '', //记录上次显示菜单的消息id
    moveX: 0,  //记录平移距离
    showState: 0, //0 未显示菜单 1显示菜单
    touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    that.renderList()

    that.computeFileSize()

    this.msgListView = wxviewType.createWXView();
    // this.msgListView.setAnimationParam('msgListAnimation');
    this.msgListView.page = this;
    
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
              msgClean: records[i].msgClean,
              id: 'id-'+i
            })
          } else if (newestMsg.type === 'img') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[图片]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              id: 'id-' + i
            })
          } else if (newestMsg.type === 'face') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: '[表情]',
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              id: 'id-' + i
            })
          } else if (newestMsg.type === 'shield') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              id: 'id-' + i
            })
          } else if (newestMsg.type === 'card') {
            recordList.push({
              friendInfo: records[i].friendInfo,
              storeInfo: records[i].storeInfo,
              newestMsg: newestMsg.content,
              // date: that.parseDate(newestMsg.time),
              date: fromNow(newestMsg.time),
              msgClean: records[i].msgClean,
              id: 'id-' + i
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


  ontouchstart: function (e) {
    this.msgListView.ontouchstart(e);
    touchData.touchstart(e);
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
      this.lastShowMsgId = "";
      return;
    }
    if (touchData.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
  },

  ontouchmove: function (e) {
    touchData.touchmove(e);
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    // //滑动container，只处理垂直方向
    // if (e.target.id === 'id-container') {
    //   this.msgListView.ontouchmove(e, touchData.deltaY);
    //   return;
    // }
    // //已触发垂直滑动
    // if (touchData.swipeDirection === 2) {
    //   this.msgListView.ontouchmove(e, touchData.deltaY);
    //   return;
    // }
    var moveX = touchData.totalDelateX;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.target.id, moveX, 0);
  },
  ontouchend: function (e) {
    console.log(e)
    touchData.touchend(e);
    this.swipeCheckState = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      return;
    }
    // //滑动container，只处理垂直方向
    // if (e.target.id === 'id-container') {
    //   this.msgListView.ontouchend(e, touchData.speedY);
    //   return;
    // }
    // //垂直滚动
    // if (touchData.swipeDirection === 2) {
    //   this.msgListView.ontouchend(e, touchData.speedY);
    //   return;
    // }
    if (this.moveX === 0) {
      this.showState = 0;
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.target.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.target.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
    }
    this.translateXMsgItem(e.target.id, this.moveX, 200);
  },
  getItemIndex: function (id) {
    var msgList = this.data.chatRecords;
    for (var i = 0; i < msgList.length; i++) {
      if (msgList[i].id === id) {
        return i;
      }
    }
    return -1;
  },
  translateXMsgItem: function (id, x, duration) {
    console.log('-------------------')
    console.log(id)
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'chatRecords[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },



})