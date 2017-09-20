// pages/moments/comment/comment.js
import fromNow from '../../../untils/moment.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moment: null,
    imgIsArray: false,
    overText: false,
    textareaPlaceHolder: '说点什么',
    comments: [],
    commentsLength: 0,
    commentsStatus: '正在努力获取评论',
    content: '',
    makeTextareaFocus: false,
    replyDisabled: false,
    toView: '',
    showPanel: false,
  },
  store_name: '',

  currentPage: 1,
  // 为防止scroll频繁触发触底事件
  fetchCommentAlready: false,

  // 被评论人信息
  commented: null,

  momentType: 'user',

  // 当前举报队列
  reported: [],

  initComment: true,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let shareScene = [1007, 1008]
    if (shareScene.indexOf(app.scene) !== -1) {
      // 分享
      this.setData({
        toView: ''
      })
    } else {
      this.setData({
        toView: 'comments'
      })
    }
    let storeInfo = app.globalData.storeInfo
    let data = JSON.parse(options.item)
    console.log(data)
    if (!storeInfo || (data.store_id !== storeInfo.storeId)) {
      this.setData({
        replyDisabled: true,
        textareaPlaceHolder: '只能在' + data.store_name + '回复'
      })
    }
    if (data.image instanceof Array) {
      this.setData({
        imgIsArray: true
      })
    } else {
      this.setData({
        imgIsArray: false
      })
    }
    // 从用户页面过来需要获取动态更多数据
    let source = options.from || null
    // 动态类型
    this.momentType = options.type

    // 可以从分享、用户页面入口进入
    this.setData({
      moment: data,
      storeName: data.store_name || ''
    })
    this.fetchComments(data.notice_id, 1, source)
  },

  fetchComments(notice_id, page, source) {
    // TODO type, page
    let type = this.momentType === 'user' ? 2 : 1
    page = page || 1
    this.fetchCommentAlready = false
    wx.request({
      url: app.requestHost + 'Notice/notice_info/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: notice_id,
        type: type,
        page: page
      },
      success: res => {
        console.log(res)
        if (res.data.result.is_delete === 1) {
          wx.showModal({
            content: '动态已被删除',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.navigateBack()
              }
            }
          })
          return
        }
        let data = res.data.result
        let commentList = data.evaluate_list
        if (res.data.code === 201) {
          if (page <= 1) {
            this.parseComment(commentList)
          } else {
            let list = this.data.comments.slice()
            // 为何concat不能用？
            // list.concat(...res.data.result.evaluate_list)
            commentList.map(item => {
              list.push(item)
            })
            this.parseComment(list)
          }
          if (data.evaluate_num == 0) {
            this.currentPage = page - 1
            this.setData({
              commentsStatus: '当前还没有人发表意见哦'
            })
          } else {
            this.setData({
              commentsLength: data.evaluate_num,
            })
          }
          if (source === 'user' || source === 'share') {
            // user的相册，share的时间、点赞等等
            delete data.evaluate_list
            this.parseMoment(data)
          }
        } else {
          this.currentPage = page - 1
          this.setData({
            commentsStatus: '评论飞到火星了'
          })
        }
        setTimeout(() => {
          this.fetchCommentAlready = true
        }, 200)
      },
      fail: () => {
        this.fetchCommentAlready = true
        this.currentPage = page - 1
        this.setData({
          commentsStatus: '评论飞到火星了'
        })
      }
    })
  },

  parseComment(data) {
    let templist = data.slice()
    let meId = app.globalData.userId
    templist.map(item => {
      item.parseTime = fromNow(item.add_time * 1000)
      if (meId === item.f_user_id) {
        item.del = true
      }
    })
    this.setData({
      comments: templist,
    })
  },

  parseMoment(data) {
    if (data.image instanceof Array) {
      this.setData({
        imgIsArray: true
      })
    } else {
      this.setData({
        imgIsArray: false
      })
    }
    let meId = app.globalData.userId
    data.parseTime = fromNow(data.add_time * 1000)
    if (meId === data.user_id) {
      data.del = true
    }
    if (this.momentType === 'store'){
      let screenWidth = app.globalData.deviceInfo.screenWidth - 20
      let imgSize = ''
      // 三张图片两个2的margin-right，6条1px的边框
      if (data.image.length === 2) {
        imgSize = (screenWidth - 2 - 4) / 2
      } else if (data.image.length === 3) {
        imgSize = (screenWidth - 4 - 6) / 3
      }
      data.imgSize = imgSize
    }
    this.setData({
      moment: data
    })
  },

  contentInput(e) {
    let value = e.detail.value
    this.setData({
      content: value
    })
    if (value.length > 50) {
      this.setData({
        overText: true
      })
    } else {
      this.setData({
        overText: false
      })
      if (value.trim().length === 0) {
        this.commented = null
      }
    }
  },

  textareaFocus() {
    if (!this.commented) {
      this.setData({
        textareaPlaceHolder: '50字以内'
      })
    }
  },

  textareaBlur() {
    this.commented = null
    this.setData({
      textareaPlaceHolder: '有何高见'
    })
  },

  toComment() {
    if (this.data.content.trim() === '') {
      return
    }
    if (this.data.overText) {
      wx.showModal({
        showCancel: false,
        content: '内容应在50字以内',
      })
      return
    }
    // 被引用人存在，并且提交的内容中前几个字为被引用人名字
    // commented为被引用人信息，如果是用户有f_user_id，否则只有store_id
    if (this.commented) {
      // console.log(this.commented)
      let commented = this.commented
      let t_user_id, type
      if (commented.f_user_id === commented.store_id) {
        t_user_id = commented.store_id
        type = 3
      } else {
        // t_user_id = commented.t_user_id || commented.f_user_id
        t_user_id = commented.f_user_id || ''
        type = 1
      }
      // 引用回复
      // 引用回复评论，回复用户为1，回复商家为3

      this.postComment(type, t_user_id, commented.e_id || commented.evaluate_id, commented.evaluate_id)
    } else {
      // 没有引用回复
      // 直接回复状态，回复用户为1，回复商家为3
      this.postComment(this.momentType === 'user' ? 1 : 3)
    }
  },

  postComment(type, t_user_id, e_id, last_e_id) {
    if (!this.initComment) {
      return
    }
    this.initComment = false
    let moment = this.data.moment
    t_user_id = t_user_id || ''
    e_id = e_id || ''
    last_e_id = last_e_id || ''
    wx.request({
      url: app.requestHost + 'Notice/evaluate_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: moment.notice_id,
        store_id: app.globalData.storeInfo.storeId,
        content: this.data.content,
        notice_type: this.momentType === 'user' ? 2 : 1,
        t_user_id: t_user_id,
        e_id: e_id,
        last_e_id: last_e_id,
        type: type
      },
      success: res => {
        console.log(this.momentType, t_user_id, e_id, last_e_id, type, this.commented)
        this.initComment = true
        console.log(res)
        if (res.data.code === 201) {
          this.setData({
            textareaPlaceHolder: '',
            content: '',
            commentsLength: this.data.commentsLength + 1,
          })
          setTimeout(() => {
            this.setData({
              makeTextareaFocus: false,
            })
          }, 200)
          this.commented = null
          this.fetchComments(moment.notice_id)
          app.globalData.momentNeedToRefetch = true
        } else {
          wx.showModal({
            showCancel: false,
            content: '发送失败',
          })
        }
      },
      fail: res => {
        this.initComment = true
        wx.showModal({
          showCancel: false,
          content: '发送失败',
        })
      }
    })
  },

  // 处理
  pickChange(e) {
    let idx = e.currentTarget.dataset.idx
    let type = e.currentTarget.dataset.type
    let id = parseInt(e.detail.value)
    let data = type === 'comment' ? this.data.comments[idx] : this.data.moment
    if (id === 0) {
      // 回复
      if (type === 'comment') {
        if (data.f_user_id !== app.globalData.userId) {
          this.commented = data
          this.setData({
            textareaPlaceHolder: '回复' + this.commented.f_nickname,
            makeTextareaFocus: true
          })
        } else {
          this.setData({
            makeTextareaFocus: true
          })
        }
      } else if (type === 'moment') {
        // 点动态回复
        this.setData({
          makeTextareaFocus: true
        })
      }
    } else if (id === 1) {
      // 删除或举报
      if (type === 'comment') {
        if (data.f_user_id && (data.f_user_id === app.globalData.userId)) {
          // del
          wx.showModal({
            title: '提示',
            content: '确认删除？',
            success: res => {
              if (res.confirm) {
                this.delComment(data, idx)
              }
            }
          })
        } else {
          // jubao
          wx.showModal({
            title: '提示',
            content: '确认举报？',
            success: res => {
              if (res.confirm) {
                this.report(data, type)
              }
            }
          })
        }
      } else if (type === 'moment') {
        if (data.user_id && (data.user_id === app.globalData.userId)) {
          // del
          wx.showModal({
            title: '提示',
            content: '确认删除？',
            success: res => {
              if (res.confirm) {
                this.delMoment(data)
              }
            }
          })
        } else {
          // jubao
          wx.showModal({
            title: '提示',
            content: '确认举报？',
            success: res => {
              if (res.confirm) {
                this.report(data, type)
              }
            }
          })
        }
      }
    }
  },

  // 删除动态
  delMoment(item) {
    wx.request({
      url: app.requestHost + 'Notice/del_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        store_id: app.globalData.storeInfo.storeId,
        notice_id: item.notice_id,
        add_time: item.add_time
      },
      success: res => {
        if (res.data.code === 201) {
          wx.navigateBack()
        } else if (res.data.code === 102) {
          wx.showModal({
            showCancel: false,
            content: res.data.message,
          })
        } else {
          wx.showModal({
            showCancel: false,
            content: '删除失败',
          })
        }
      },
      fail: () => {
        wx.showModal({
          showCancel: false,
          content: '删除失败',
        })
      }
    })
  },

  // 删除评论
  delComment(item, idx) {
    wx.request({
      url: app.requestHost + 'Notice/delete_evaluate/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        evaluate_id: item.evaluate_id
      },
      success: res => {
        console.log(res)
        if (res.data.code === 201) {
          let templist = this.data.comments.slice()
          templist.splice(idx, 1)
          this.setData({
            comments: templist,
            commentsLength: this.data.commentsLength - 1
          })
        } else if (res.data.code === 102) {
          wx.showModal({
            showCancel: false,
            content: res.data.message,
          })
        } else {
          wx.showModal({
            showCancel: false,
            content: '删除失败',
          })
        }
      },
      fail: () => {
        wx.showModal({
          showCancel: false,
          content: '删除失败',
        })
      }
    })
  },

  report(item, type) {
    // 举报
    let data
    if (type === 'comment') {
      if (this.reported.indexOf(item.evaluate_id) >= 0) {
        wx.showModal({
          content: '已收到您的举报',
          showCancel: false
        })
        return
      }
      this.reported.push(item.evaluate_id)
      data = {
        token: app.TOKEN,
        evaluate_id: item.evaluate_id || '',
        type: 2
      }
    } else {
      if (this.reported.indexOf(item.notice_id) >= 0) {
        wx.showModal({
          content: '已收到您的举报',
          showCancel: false
        })
        return
      }
      this.reported.push(item.notice_id)
      data = {
        token: app.TOKEN,
        notice_id: item.notice_id || '',
        is_store: this.momentType === 'user' ? 0 : 1,
        type: 1
      }
    }
    wx.request({
      url: app.requestHost + 'Notice/complaint_notice/',
      method: 'POST',
      data: data,
      success: res => {
        console.log(res)
        if (res.data.code === 201) {
          wx.showModal({
            content: '举报成功',
            showCancel: false
          })
        } else {
          wx.showModal({
            content: '失败',
            showCancel: false
          })
        }
      },
      fail: () => {
        wx.showModal({
          content: '失败',
          showCancel: false
        })
      }
    })
  },

  togglePanel(e){
    let show = this.data.showPanel
    this.setData({
      showPanel: show ? false : true
    })
  },

  closePanel(){
    this.setData({
      showPanel: false
    })
  },

  toReport(){
    let data = this.data.moment
    if (data.user_id && (data.user_id === app.globalData.userId)) {
      // del
      wx.showModal({
        title: '提示',
        content: '确认删除？',
        success: res => {
          if (res.confirm) {
            this.delMoment(data)
          }
        }
      })
    } else {
      // jubao
      wx.showModal({
        title: '提示',
        content: '确认举报？',
        success: res => {
          if (res.confirm) {
            this.report(data, 'moment')
          }
        }
      })
    }
    this.setData({
      showPanel: false
    })
  },

  prevImg(e) {
    let image = this.data.moment.image
    let type = e.currentTarget.dataset.type
    if (type === 'single') {
      wx.previewImage({
        urls: [image],
      })
    } else {
      let idx = e.currentTarget.dataset.idx
      wx.previewImage({
        urls: image,
        current: image[idx]
      })
    }

  },

  like(e) {
    let moment = this.data.moment
    if (moment.is_thumbs) {
      moment.is_thumbs = 0
      moment.thumbs_num--
    } else {
      moment.is_thumbs = 1
      moment.thumbs_num++
    }
    this.setData({
      moment: moment
    })
    wx.request({
      url: app.requestHost + 'Notice/thumbs_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: moment.notice_id,
      },
      success: res => {
        console.log(res)
        if (res.data.code === 201 || res.data.code === 202) {
          app.globalData.momentNeedToRefetch = true
        }
      },
      fail: () => {

      }
    })
  },

  toUserPage(e) {
    let data = e.currentTarget.dataset
    let userId
    console.log(this.momentType)
    // if(this.momentType === 'user'){
    if (data.type === 'moment') {
      if (this.momentType === 'user') {
        userId = this.data.moment.user_id
        wx.navigateTo({
          url: '/pages/user/user?user_id=' + userId,
        })
      } else {
        // let storeInfo = app.globalData.storeInfo
        // if (storeInfo && this.data.moment.store_id === storeInfo.storeId) {
        //   wx.navigateTo({
        //     url: '/pages/main/main?store_id=' + storeInfo.storeId + '&table_id=' + storeInfo.tableId,
        //   })
        // } else {
        wx.navigateTo({
          url: '/pages/shopDetail/shopDetail?store_id=' + this.data.moment.store_id,
        })
        // }
      }
    } else {
      let idx = data.idx
      let item = this.data.comments[idx]
      if (item.f_user_id === item.store_id) {
        // let storeInfo = app.globalData.storeInfo
        // if (storeInfo && this.data.comments[idx].store_id === storeInfo.storeId) {
        //   wx.navigateTo({
        //     url: '/pages/main/main?store_id=' + storeInfo.storeId + '&table_id=' + storeInfo.tableId,
        //   })
        // } else {
        wx.navigateTo({
          url: '/pages/shopDetail/shopDetail?store_id=' + item.store_id,
        })
        // }
      } else {
        userId = item.f_user_id
        wx.navigateTo({
          url: '/pages/user/user?user_id=' + userId,
        })
      }
    }

    // } else {
    //   let storeInfo = app.globalData.storeInfo
    //   if (storeInfo && this.data.moment.store_id === storeInfo.storeId){
    //     wx.navigateTo({
    //       url: '/pages/main/main?store_id=' + storeInfo.storeId + '&table_id=' + storeInfo.tableId,
    //     })
    //   } else {
    //     wx.navigateTo({
    //       url: '/pages/shopDetail/shopDetail?store_id=' + this.data.moment.store_id,
    //     })
    //   }
    // }
  },


  toShop() {
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?store_id=' + this.data.moment.store_id,
    })
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
  // onPullDownRefresh: function () {
  //   this.fetchComments(this.data.moment.notice_id)
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this.currentPage ++ 
    // this.fetchComments(this.data.moment.notice_id, this.currentPage)
  },
  fetchMoreComment() {
    if (this.fetchCommentAlready) {
      this.currentPage++
      this.fetchComments(this.data.moment.notice_id, this.currentPage)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let data, title, image
    if (this.momentType === 'user') {
      data = this.data.moment
      title = data.name + ': ' + (data.content ? data.content : '[图片]') + ' --' + data.store_name
      image = data.image
      return {
        title: title,
        path: '/pages/moments/comment/comment?from=share&type=user&item=' + JSON.stringify(data),
        imageUrl: image
      }
    } else {
      data = this.data.moment
      title = data.name + ': ' + (data.content ? data.content : '[图片]')
      image = data.image[0]
      return {
        title: title,
        path: '/pages/moments/comment/comment?from=share&type=store&item=' + JSON.stringify(data),
        imageUrl: image
      }
    }
  }
})
