// pages/moments/index/index.js
import fromNow from '../../../untils/moment.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // storeImgWidth: '',
    storeMoment: null,
    userMoments: null,

    empty: false,
    storeName: ''
  },

  currentPage: 1,

  // 是否举报过
  reported: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    let storeInfo = app.globalData.storeInfo
    if (storeInfo) {
      if (options.from === 'share') {
        if (storeInfo.storeId === options.store_id) {
          wx.showLoading({
            title: '动态获取中',
          })
          this.setData({
            storeName: storeInfo.storeName
          })
          this.fetchShopMoment(storeInfo.storeId)
          this.fetchMomentList()
        } else {
          // 未在同一家店
          wx.navigateTo({
            url: '/pages/shopDetail/shopDetail?store_id=' + options.store_id,
          })
        }
      } else {
        wx.showLoading({
          title: '动态获取中',
        })
        this.setData({
          storeName: storeInfo.storeName
        })
        this.fetchShopMoment(storeInfo.storeId)
        this.fetchMomentList()
      }

    } else {
      //未在任何一家店内
      wx.redirectTo({
        url: '/pages/shopDetail/shopDetail?store_id=' + options.store_id,
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
          this.parseShopMoment(res.data.result)
        } else {

        }
      },
      fail: () => {

      }
    })
  },

  parseShopMoment(data) {
    let screenWidth = app.globalData.deviceInfo.screenWidth - 20
    let imgSize = ''
    // 三张图片两个2的margin-right，6条1px的边框
    if (data.image.length === 2) {
      imgSize = (screenWidth - 2 - 4) / 2
    } else if (data.image.length === 3) {
      imgSize = (screenWidth - 4 - 6) / 3
    }
    data.parseTime = fromNow(data.add_time * 1000)
    data.logo = app.globalData.storeInfo.logo
    data.name = app.globalData.storeInfo.storeName
    data.store_name = app.globalData.storeInfo.storeName
    data.imgSize = imgSize
    this.setData({
      // storeImgWidth: imgSize,
      storeMoment: data,
      storeImgLength: data.image.length
    })
  },

  fetchMomentList(page) {
    this.fetchMomentAlready = false
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
        console.log(page, res)
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
          this.setData({
            empty: false
          })
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
            success: res => {
              if (res.confirm) {
                wx.navigateBack()
              }
            }
          })
        }
        setTimeout(() => {
          this.fetchMomentAlready = true
        }, 200)
      },
      fail: () => {
        this.fetchMomentAlready = true
        this.currentPage = page - 1
        wx.showModal({
          showCancel: false,
          content: '获取失败',
          success: res => {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
      }
    })
  },

  parseMoment(data) {
    let templist = data.slice()
    let meId = app.globalData.userId
    templist.map(item => {
      item.parseTime = fromNow(item.add_time * 1000)
      item.store_name = app.globalData.storeInfo.storeName
      if (meId === item.user_id) {
        item.del = true
      }
    })
    this.setData({
      userMoments: templist
    })

  },

  prevImg(e) {
    let type = e.currentTarget.dataset.type
    let idx = e.currentTarget.dataset.idx

    if (type === 'user') {
      let img = this.data.userMoments[idx].image
      wx.previewImage({
        urls: [img],
      })
    } else {
      let imgs = this.data.storeMoment.image
      wx.previewImage({
        urls: imgs,
        current: imgs[idx]
      })
    }

  },

  pickChange(e) {
    let id = parseInt(e.detail.value)
    let type = e.currentTarget.dataset.type
    if (type === 'user') {
      let idx = e.currentTarget.dataset.idx
      let item = this.data.userMoments[idx]
      if (id === 0) {
        wx.navigateTo({
          url: '/pages/moments/comment/comment?type=user&item=' + JSON.stringify(item),
        })
      } else if (id === 1) {
        if (item.user_id === app.globalData.userId) {
          wx.showModal({
            title: '提示',
            content: '确认删除？',
            success: res => {
              if (res.confirm) {
                this.delMoment(item, idx)
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
    } else {
      if (id === 0) {
        let item = this.data.storeMoment
        wx.navigateTo({
          url: '/pages/moments/comment/comment?type=store&item=' + JSON.stringify(item),
        })
      } else if (id === 1) {
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

  delMoment(item, idx) {
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
    if (this.reported) {
      wx.showModal({
        content: '已收到您的举报',
        showCancel: false
      })
      return
    }
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
          this.reported = true
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
    let type = e.currentTarget.dataset.type
    if (type === 'user') {
      wx.navigateTo({
        url: '/pages/moments/comment/comment?type=user&item=' + item,
      })
    } else {
      wx.navigateTo({
        url: '/pages/moments/comment/comment?type=store&item=' + item,
      })
    }
  },


  like(e) {
    let type = e.currentTarget.dataset.type
    let templist, item
    if (type === 'user') {
      let idx = e.currentTarget.dataset.idx
      templist = this.data.userMoments.slice()
      item = templist[idx]
    } else {
      item = this.data.storeMoment
    }

    if (item.is_thumbs) {
      item.is_thumbs = 0
      item.thumbs_num--
    } else {
      item.is_thumbs = 1
      item.thumbs_num++
    }
    if (type === 'user') {
      this.setData({
        userMoments: templist
      })
    } else {
      this.setData({
        storeMoment: item
      })
    }

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

  toShopPage(e) {
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?store_id=' + this.data.storeMoment.store_id
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
      this.fetchShopMoment(app.globalData.storeInfo.storeId)
    }
    if (app.globalData.momentScrollToTop) {
      app.globalData.momentScrollToTop = false
      wx.pageScrollTo({
        scrollTop: 0
      })
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
    this.currentPage = 1
    this.fetchMomentList()
    this.fetchShopMoment(app.globalData.storeInfo.storeId)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  scrollToBottom() {
    // console.log(this.fetchMomentAlready)
    // if (this.fetchMomentAlready) {
    //   this.currentPage++
    //   this.fetchMomentList(this.currentPage)
    // }
  },
  onReachBottom: function () {
    if (this.fetchMomentAlready) {
      this.currentPage++
      this.fetchMomentList(this.currentPage)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    // wx.hideShareMenu()
    if (options.from === 'button') {
      options = options.target.dataset
      let data, title, image
      if (options.type === 'user') {
        let idx = options.idx
        data = this.data.userMoments[idx]
        title = data.name + ': ' + (data.content ? data.content : '[图片]') + ' --' + app.globalData.storeInfo.storeName
        image = data.image
        return {
          title: title,
          path: '/pages/moments/comment/comment?type=user&item=' + JSON.stringify(data),
          imageUrl: image
        }
      } else {
        data = this.data.storeMoment
        title = data.name + ': ' + (data.content ? data.content : '[图片]')
        image = data.image[0]
        return {
          title: title,
          path: '/pages/moments/comment/comment?type=store&item=' + JSON.stringify(data),
          imageUrl: image
        }
      }
    } else {
      // wx.hideShareMenu()
      return {
        title: '我在' + app.globalData.storeInfo.storeName + '发现了好玩的东西',
        path: '/pages/moments/index/index?from=share&store_id=' + app.globalData.storeInfo.storeId
      }
      // return false
    }


  }
})