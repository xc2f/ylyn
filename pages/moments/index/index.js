// pages/moments/index/index.js
import fromNow from '../../../untils/moment.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeMoment: null,
    userMoments: null,

    empty: false,
    storeName: ''
  },

  currentPage: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let storeInfo = app.globalData.storeInfo
    if (storeInfo) {
      wx.showLoading({
        title: '动态获取中',
      })
      this.setData({
        storeName: storeInfo.storeName
      })
      this.fetchShopMoment(storeInfo.storeId)
      this.fetchMomentList()
    } else {
      //未在任何一家店内
      wx.reLaunch({
        url: '/pages/nearlist/nearlist',
      })
    }
  },

  fetchShopMoment(storeId) {
    wx.request({
      url: app.requestHost + 'Notice/get_store_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        store_id: storeId
      },
      success: (res) => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        console.log(res)
        if (res.data.code === 201) {

        } else {
          
        }
      },
      fail: () => {

      }
    })
  },

  fetchMomentList(page) {
    page = page || 1
    wx.request({
      url: app.requestHost + 'Notice/get_user_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        store_id: app.globalData.storeInfo.storeId,
        page: page
      },
      success: (res) => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.code === 201) {
          if (page <= 1) {
            this.parseMoment(res.data.result)
          } else {
            let list = this.data.userMoments
            res.data.result.map(item => {
              list.push(item)
            })
            this.parseMoment(list)
          }
        } else if (res.data.code === 202) {
          this.currentPage = page - 1
          // 没有更多
          if (page === 1) {
            this.setData({
              empty: true
            })
          }
        } else {
          this.currentPage = page - 1
          wx.showModal({
            showCancel: false,
            content: '获取失败',
          })
        }
      },
      fail: () => {
        this.currentPage = page - 1
        wx.showModal({
          showCancel: false,
          content: '获取失败',
        })
      }
    })
  },

  parseMoment(data) {
    let templist = data.slice()
    let meId = app.globalData.userId
    templist.map(item => {
      item.parseTime = fromNow(item.add_time * 1000)
      if (meId === item.user_id) {
        item.del = true
      }
    })
    this.setData({
      userMoments: templist
    })

  },

  prevImg(e) {
    let idx = e.currentTarget.dataset.idx
    let img = this.data.userMoments[idx].image
    wx.previewImage({
      urls: [img],
    })
  },

  pickChange(e) {
    let idx = e.currentTarget.dataset.idx
    let id = parseInt(e.detail.value)
    let item = this.data.userMoments[idx]
    if (id === 0) {
      wx.navigateTo({
        url: '/pages/moments/comment/comment?item=' + JSON.stringify(item),
      })
    } else if (id === 1) {
      if (item.user_id === app.globalData.userId) {
        wx.showModal({
          title: '提示',
          content: '确认删除？',
          success: res => {
            if (res.confirm) {
              this.delMoment(item)
            }
          }
        })
      } else {
        // tousu
        wx.showModal({
          title: '提示',
          content: '确认举报？',
          success: res => {
            if (res.confirm) {
              this.report(item)
            }
          }
        })
      }
    }
  },

  delMoment() {
    // del
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
        console.log(res)
        if (res.data.code === 201) {
          let templist = this.data.userMoments.slice()
          templist.splice(idx, 1)
          this.setData({
            userMoments: templist
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

  report(item) {
    // 举报
    wx.request({
      url: app.requestHost + 'Notice/complaint_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: item.notice_id,
        type: 1
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

  toCommentPage(e) {
    let item = JSON.stringify(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: '/pages/moments/comment/comment?item=' + item,
    })
  },


  like(e) {
    let idx = e.currentTarget.dataset.idx
    let templist = this.data.userMoments.slice()
    let item = templist[idx]
    if (item.is_thumbs) {
      item.is_thumbs = 0
      item.thumbs_num--
    } else {
      item.is_thumbs = 1
      item.thumbs_num++
    }
    this.setData({
      userMoments: templist
    })
    wx.request({
      url: app.requestHost + 'Notice/thumbs_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        notice_id: item.notice_id,
      },
      success: res => {

      },
      fail: () => {

      }
    })
  },

  toUserPage(e) {
    let idx = e.currentTarget.dataset.idx
    let userId = this.data.userMoments[idx].user_id
    wx.navigateTo({
      url: '/pages/user/user?user_id=' + userId,
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
    if (app.globalData.momentNeedToRefetch) {
      app.globalData.momentNeedToRefetch = false
      this.fetchMomentList()
    }
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
    this.fetchMomentList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.currentPage++
    this.fetchMomentList(this.currentPage)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      let idx = options.target.dataset.idx
      let data = this.data.userMoments[idx]
      let title = data.name + ' ' + data.content + ' --' + app.globalData.storeInfo.storeName
      let image = data.image
      return {
        title: title,
        path: '/pages/moments/comment/comment?item=' + JSON.stringify(data),
        imageUrl: image
      }
    } else {
      return {
        title: '我在' + app.globalData.storeInfo.storeName + '发现了好玩的东西',
        path: '/pages/moments/index/index?from=share&store_id=' + app.globalData.storeInfo.storeId
      }
    }


  }
})