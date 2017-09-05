// pages/moments/comment/comment.js
import fromNow from '../../../untils/moment.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
    overText: false,
    textareaPlaceHolder: '说点什么',
    comments: [],
    commentsLength: 0,
    commentsStatus: '正在努力获取评论',
    content: '',
    makeTextareaFocus: false,
  },

  currentPage: 1,
  // 为防止scroll频繁触发触底事件
  fetchCommentOk: false,

  // 被评论人信息
  commented: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = JSON.parse(options.item)
    this.setData({
      item: data
    })
    this.fetchComments(data.notice_id)
  },

  fetchComments(notice_id, page, type) {
    // TODO type, page
    type = type || 2
    page = page || 1
    this.fetchCommentOk = false
    wx.request({
      url: app.requestHost + 'Notice/notice_info/',
      method: 'POST',
      data: {
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6',
        notice_id: notice_id,
        type: type,
        page: page
      },
      success: res => {
        if (res.data.code === 201) {
          let list = this.data.comments.slice()
          res.data.result.evaluate_list.map(item => {
            list.push(item)
          })
          // 为何concat不能用？
          // list.concat(...res.data.result.evaluate_list)
          if (list.length === 0) {
            this.currentPage = page - 1
            this.setData({
              commentsStatus: '当前还没有人发表意见哦'
            })
          } else {
            this.setData({
              commentsLength: list.length
            })
            this.parseComment(list)
          }
          this.fetchCommentOk = true
        } else {
          this.currentPage = page - 1
          this.setData({
            commentsStatus: '评论飞到火星了'
          })
        }
      },
      fail: () => {
        this.currentPage = page - 1
        this.setData({
          commentsStatus: '评论飞到火星了'
        })
      }
    })
  },

  parseComment(data) {
    console.log(data)
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
      if(value.trim().length === 0){
        this.commented = null
      }
    }
  },

  textareaFocus() {
    this.setData({
      textareaPlaceHolder: '50字以内'
    })
  },

  textareaBlur() {
    this.setData({
      textareaPlaceHolder: '说点什么'
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
    if (this.commented && this.data.content.indexOf(this.commented.f_nickname) === 0){
      // console.log(this.commented)
      let commented = this.commented
      // 引用回复
      this.postComment(commented.t_user_id || commented.f_user_id, commented.e_id || commented.evaluate_id, commented.evaluate_id)
    } else {
      // 没有引用回复
      this.postComment()
    }
  },

  postComment(t_user_id, e_id, last_e_id){
    let item = this.data.item
    t_user_id = t_user_id || ''
    e_id = e_id || ''
    last_e_id = last_e_id || ''
    wx.request({
      url: app.requestHost + 'Notice/evaluate_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6',
        notice_id: item.notice_id,
        store_id: '14b00ff3-f9f7-7337-a713-599d8f8d9c62' || app.globalData.storeInfo.storeId,
        content: this.data.content,
        notice_type: 2,
        t_user_id: t_user_id,
        e_id: e_id,
        last_e_id: last_e_id,
        type: 1
      },
      success: res => {
        console.log(res)
        if (res.data.code === 201) {
          this.setData({
            content: '',
            commentsLength: this.data.commentsLength + 1
          })
          this.fetchComments(this.data.item.notice_id)
        } else {
          wx.showModal({
            showCancel: false,
            content: '发送失败',
          })
        }
      },
      fail: res => {
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
    let item = type === 'comment' ? this.data.comments[idx] : this.data.item
    if (id === 0) {
      // 回复
      if(type === 'comment'){
        this.commented = item
        this.setData({
          content: item.f_nickname + ' ',
          makeTextareaFocus: true
        })
      } else if(type === 'moment'){
        // 点动态回复
        this.setData({
          makeTextareaFocus: true
        })
      }
    } else if (id === 1) {
      // 删除或举报
      if (type === 'comment') {
        if (item.f_user_id === app.globalData.userId) {
          // del
          this.delComment(item, idx)
        } else {
          // jubao
          this.report(item, type)
        }
      } else if (type === 'moment') {
        if (item.user_id === app.globalData.userId) {
          // del
          this.delMoment(item)
        } else {
          // jubao
          this.report(item, type)
        }
      }
    }
  },

  // 删除动态
  delMoment(item){
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
        if (res.data.code === 201) {
          let templist = this.data.comments.slice()
          templist.splice(idx, 1)
          this.setData({
            comments: templist
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
    wx.request({
      url: app.requestHost + 'Notice/complaint_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: item.notice_id || '',
        evaluate_id: item.evaluate_id || '',
        type: type === 'comment' ? 2 : 1
      },
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

  prevImg(){
    wx.previewImage({
      urls: [this.data.item.image],
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
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this.currentPage ++ 
    // this.fetchComments(this.item.notice_id, this.currentPage)
  },
  fetchMoreComment(){
    if (this.fetchCommentOk){
      this.currentPage++
      this.fetchComments(this.data.item.notice_id, this.currentPage)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})