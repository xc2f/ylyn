// pages/user/user.js

import { upload } from '../../untils/update.js'
import fromNow from '../../untils/moment.js'
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentUserId: null,
    userId: null,
    userInfo: null,
    gallery: [],
    size: 0,
    imgHeight: 0,
    momentImgHeight: 100,
    moments: [],
    showMoment: true,
    notices: [],
    showNotice: false,

    tx0: 0,
    tx1: 50,
    tx2: 100,
    tx3: 150,
    tx4: 200,
    tx5: 250,
    tx6: 300,
    tx7: 350,
    tx8: 400,
    // ty: 50,
    // tz: 0
    currentPic: 1,
    dataOk: false,
    fetchDataFail: false,
    showTall: false,
    fetchMomentsFail: false,
    fetchNoticesFail: false,
    fetchMomentsEmpty: true,
    fetchNoticesEmpty: true,
    hasNewComment: false,
  },

  getNoticeInterval: null,

  currentMomentPage: 1,
  currentNoticePage: 1,

  // toMomentView只执行一次
  initNotice: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let deviceInfo = app.globalData.deviceInfo
    this.setData({
      currentUserId: options.user_id,
      userId: app.globalData.userId,
      imgHeight: deviceInfo.screenHeight / 2 * 0.85,
      momentImgHeight: deviceInfo.screenWidth / 2 * 0.85,
    })

    this.fetchUserInfo(options.user_id)
    this.fetchUserMoments(options.user_id)

  },

  fetchUserInfo(userId) {
    let that = this

    wx.showLoading({
      title: '数据获取中',
    })

    wx.request({
      url: app.requestHost + 'Store/get_tuser_info/',
      method: 'POST',
      data: {
        tuser_id: userId,
        token: app.TOKEN
      },
      success: function (res) {
        console.log(res)
        // console.log(app.TOKEN)
        if (res.data.code === 201) {
          // 设置导航条
          wx.setNavigationBarTitle({
            title: res.data.result.nickname
          })
          if (app.sdk >= 150) {
            that.setData({
              userInfo: res.data.result,
              gallery: res.data.result.album,
              size: res.data.result.album.length,
              dataOk: true,
              fetchDataFail: false,
            }, () => {
              wx.hideLoading()
            })
          } else {
            that.setData({
              userInfo: res.data.result,
              gallery: res.data.result.album,
              size: res.data.result.album.length,
              dataOk: true,
              fetchDataFail: false,
            })
            wx.hideLoading()
          }

          if (res.data.result.height && res.data.result.album.length !== 0) {
            that.setData({
              showTall: true
            })
          }
        } else if (res.data.code === 102) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          wx.hideLoading()
          that.setData({
            fetchDataFail: true
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        that.setData({
          fetchDataFail: true
        })
      }
    })
  },

  fetchUserMoments(userId, page) {
    this.fetchDataAlready = false
    page = page || 1
    wx.request({
      url: app.requestHost + 'Store/get_tuser_notice/',
      method: 'POST',
      data: {
        tuser_id: userId,
        token: app.TOKEN,
        page: page
      },
      success: (res) => {
        console.log(res)
        if (res.data.code === 201) {
          this.setData({
            fetchMomentsFail: false,
          })
          let result = res.data.result
          if (result.length === 0) {
            this.currentMomentPage = page - 1
          } else {
            let list = this.data.moments.slice()
            result.map(item => {
              list.push(item)
            })
            this.parseMoment(list)
            this.setData({
              fetchMomentsEmpty: false
            })
          }
        } else if (res.data.code === 202) {

        } else {
          this.currentMomentPage = page - 1
          this.setData({
            fetchMomentsFail: true,
            fetchMomentsEmpty: false
          })
        }
        setTimeout(() => {
          this.fetchDataAlready = true
          // 防止第一次moments为空
          this.getNoticeStatus()
        }, 200)
      },
      fail: () => {
        this.fetchDataAlready = true
        // error needn't to handle
        this.currentMomentPage = page - 1
        this.setData({
          fetchMomentsFail: true,
          fetchMomentsEmpty: false
        })
      }
    })

  },

  parseMoment(data) {
    // add animation
    let storeId = app.globalData.storeInfo ? app.globalData.storeInfo.storeId : null
    data.map((item, idx) => {
      // item.animation = {}
      // item.animationAngle = {}
      // item.toggleStatus = false
      item.access = storeId === item.store_id ? true : false
      item.parseTime = fromNow(item.add_time * 1000)
    })
    this.setData({
      moments: data
    })
  },

  fetchUserNotices(page) {
    this.fetchDataAlready = false
    page = page || 1
    wx.request({
      url: app.requestHost + 'Store/get_user_partake/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        page: page
      },
      success: res => {
        if (res.data.code === 201) {
          this.setData({
            fetchNoticesFail: false,
          })
          let result = res.data.result
          if (result.length === 0) {
            this.currentNoticePage = page - 1
          } else {
            if (page === 1) {
              this.parseTime(result)
            } else {
              let list = this.data.notices.slice()
              result.map(item => {
                list.push(item)
              })
              this.parseTime(list)
            }
            this.setData({
              fetchNoticesEmpty: false
            })
          }

        } else {
          this.currentNoticePage = page - 1
          this.setData({
            fetchNoticesFail: true,
            fetchNoticesEmpty: false
          })
        }
        setTimeout(() => {
          this.fetchDataAlready = true
        }, 200)
      },
      fail: () => {
        this.fetchDataAlready = true
        this.currentNoticePage = page - 1
        this.setData({
          fetchNoticesFail: true,
          fetchNoticesEmpty: false
        })
      }
    })
  },

  parseTime(data) {
    let storeId = app.globalData.storeInfo ? app.globalData.storeInfo.storeId : null
    data.map(item => {
      item.parseTime = fromNow(item.add_time * 1000)
      item.access = storeId === item.store_id ? true : false
    })
    this.setData({
      notices: data
    })

  },


  occurFail() {
    this.setData({
      fetchDataFail: false
    })
    this.onLoad({
      user_id: this.data.currentUserId
    })
  },

  switchToShop() {
    wx.navigateBack()
  },

  prev() {
    if (this.data.currentPic > 0) {
      this.setData({
        tx0: this.data.tx0 + 50,
        tx1: this.data.tx1 + 50,
        tx2: this.data.tx2 + 50,
        tx3: this.data.tx3 + 50,
        tx4: this.data.tx4 + 50,
        tx5: this.data.tx5 + 50,
        tx6: this.data.tx6 + 50,
        tx7: this.data.tx7 + 50,
        tx8: this.data.tx8 + 50,
        currentPic: this.data.currentPic - 1,
      })
    }
  },

  next() {
    if (this.data.currentPic < this.data.size - 1) {
      this.setData({
        tx0: this.data.tx0 - 50,
        tx1: this.data.tx1 - 50,
        tx2: this.data.tx2 - 50,
        tx3: this.data.tx3 - 50,
        tx4: this.data.tx4 - 50,
        tx5: this.data.tx5 - 50,
        tx6: this.data.tx6 - 50,
        tx7: this.data.tx7 - 50,
        tx8: this.data.tx8 - 50,
        currentPic: this.data.currentPic + 1
      })
    }
  },

  toChatOrConfig(e) {
    let type = e.currentTarget.dataset.type
    if (type === 'config') {
      wx.navigateTo({
        url: '/pages/config/config'
      })
    } else {
      wx.navigateTo({
        url: '/pages/chat/chat?friendinfo=' + JSON.stringify(e.currentTarget.dataset.friendinfo),
      })
    }
  },

  changeAvatar() {
    let that = this
    if (that.data.userId !== that.data.currentUserId) {
      return false
    }
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePath = res.tempFilePaths[0]
        let suffix = tempFilePath.slice(tempFilePath.lastIndexOf('.'))
        let fileName = app.globalData.userId + '-' + new Date().getTime() + suffix
        upload('userAvatar', tempFilePath, fileName, resUrl => {
          wx.request({
            url: app.requestHost + 'member/update_user_avatar/',
            method: 'POST',
            data: {
              token: app.TOKEN,
              avatar: resUrl.data.access_url
            },
            success: function (res) {
              if (res.data.code === 201) {
                that.setData({
                  'userInfo.avatar': resUrl.data.access_url
                })
                setTimeout(function () {
                  wx.setStorage({
                    key: 'meInfo',
                    data: that.data.userInfo,
                  })
                }, 1000)
              } else {
                wx.showModal({
                  title: '提示',
                  content: '修改失败',
                  showCancel: false,
                })
              }
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '修改失败',
                showCancel: false,
              })
            }
          })
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  getNoticeStatus() {
    let that = this
    let globalData = app.globalData
    console.log(globalData)
    if (globalData.hasNewMoment) {
      wx.getStorage({
        key: 'moments',
        success: function (res) {
          console.log(res)
          let data = Array.from(new Set(res.data))
          if (data.length === 0) {
            app.globalData.hasNewMoment = false
            wx.removeStorage({
              key: 'moments',
              success: function (res) {
              },
            })
          } else {
            let moments = that.data.moments.slice()
            data.map(notice_id => {
              moments.map(item => {
                if (item.notice_id === notice_id) {
                  item.unRead = true
                }
              })
            })
            console.log(11111111111)
            that.setData({
              moments: moments,
            })
            if (!that.initNotice) {
              that.setData({
                toMomentView: 'moment',
              })
            }
            that.initNotice = true
          }
        },
        fail: function(){
          app.globalData.hasNewMoment = false
        }
      })
    }
    if (globalData.hasNewComment) {
      that.setData({
        hasNewComment: true,
      })
      if (!that.initNotice) {
        that.setData({
          toMomentView: 'moment',
        })
        this.showNotice()
      }
      that.initNotice = true
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    console.log(that.data.currentUserId, that.data.userId)
    if (that.data.currentUserId && that.data.userId && that.data.currentUserId === that.data.userId) {
      that.getNoticeInterval = setInterval(() => {
        that.getNoticeStatus()
      }, 5000)
    }
    if (that.data.currentUserId === that.data.userId) {
      wx.request({
        url: app.requestHost + 'Store/get_tuser_info/',
        method: 'POST',
        data: {
          tuser_id: that.data.userId,
          token: app.TOKEN
        },
        success: function (res) {
          if (res.data.code === 201) {
            that.setData({
              userInfo: res.data.result,
              gallery: res.data.result.album,
              size: res.data.result.album.length,
              dataOk: true,
              fetchDataFail: false
            })
            if (res.data.result.height && res.data.result.album.length !== 0) {
              that.setData({
                showTall: true
              })
            } else {
              that.setData({
                showTall: false
              })
            }
          } else {
            wx.getStorage({
              key: 'meInfo',
              success: function (res) {
                that.setData({
                  userInfo: res.data,
                  dataOk: true,
                  fetchDataFail: false
                })
                if (res.data.height && that.data.gallery.length !== 0) {
                  that.setData({
                    showTall: true
                  })
                } else {
                  that.setData({
                    showTall: false
                  })
                }
              },
              fail: function () {
                that.setData({
                  dataOk: false,
                  fetchDataFail: true
                })
              }
            })
          }
        }
      })
    }
  },

  handleScroll(e) {
    if (!this.data.showToTop && e.detail.scrollTop > 135) {
      this.setData({
        showToTop: true
      })
    }
    if (this.data.showToTop && e.detail.scrollTop <= 135) {
      this.setData({
        showToTop: false
      })
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

  // toggleBar(e) {
  //   let idx = e.currentTarget.dataset.idx
  //   let templist = this.data.moments
  //   let item = templist[idx]
  //   if (item.toggleStatus) {
  //     item.toggleStatus = false
  //     item.animation = this.basicAnimation().height(30).step().export()
  //     item.animationAngle = this.basicAnimation().rotate(0).step().export()
  //   } else {
  //     item.toggleStatus = true
  //     item.animation = this.basicAnimation().height('100%').step().export()
  //     item.animationAngle = this.basicAnimation().rotate(90).step().export()
  //   }
  //   this.setData({
  //     moments: templist
  //   })
  // },

  prevImg(e) {
    let idx = e.currentTarget.dataset.idx
    let imgs = []
    this.data.moments.map(item => {
      imgs.push(item.image)
    })
    wx.previewImage({
      urls: imgs,
      current: imgs[idx]
    })
  },

  toShop(e) {
    let idx = e.currentTarget.dataset.idx
    let side = e.currentTarget.dataset.side
    let data
    if (side === 'moment') {
      data = this.data.moments
    } else {
      data = this.data.notices
    }
    let storeId = data[idx].store_id
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?store_id=' + storeId,
    })
  },

  toMoment(e) {
    // if (this.data.currentUserId !== this.data.userId){
    //   return
    // }
    console.log(e)
    let idx = e.currentTarget.dataset.idx
    let side = e.currentTarget.dataset.side
    if (side === 'moment') {
      let data = this.data.moments
      // console.log(data)
      data[idx].unRead = false
      this.setData({
        moments: data
      })

      wx.getStorage({
        key: 'moments',
        success: function (res) {
          console.log(res)
          // 去重
          let list = Array.from(new Set(res.data.slice()))
          list.map((notice_id, idx) => {
            if (notice_id === data[idx].notice_id) {
              // splice后idx会变
              list.splice(idx, 1)
            }
          })
          if (list.length === 0) {
            app.globalData.hasNewMoment = false
            wx.removeStorage({
              key: 'moments',
              success: function (res) {
              },
            })
          } else {
            wx.setStorage({
              key: 'moments',
              data: list,
            })
          }
        },
      })


      // if (data.access) {
      // 删除两个动画键
      // delete data[idx].animation
      // delete data[idx].animationAngle
      wx.navigateTo({
        url: '/pages/moments/comment/comment?from=user&type=user&item=' + JSON.stringify(data[idx]),
      })
      // } else {
      //   wx.showModal({
      //     showCancel: false,
      //     content: '我只能在' + data.store_name + '打开哦',
      //   })
      // }
    } else if (side === 'notice') {
      let data = this.data.notices[idx]
      console.log(data)
      let noticeInfo = data.notice_info
      noticeInfo.store_name = data.store_name
      // noticeInfo.logo
      // noticeInfo.parseTime = data.parseTime
      // TODO 商家动态
      // if (data.access) {
      let type = data.notice_type === 1 ? 'store' : 'user'
      wx.navigateTo({
        url: '/pages/moments/comment/comment?from=user&type=' + type + '&item=' + JSON.stringify(noticeInfo),
      })
      // } else {
      //   wx.showModal({
      //     showCancel: false,
      //     content: '我只能在' + data.store_name + '打开哦',
      //   })
      // }
    }
  },

  showMoment() {
    this.setData({
      showMoment: true,
      showNotice: false,
    })
  },
  showNotice() {
    this.fetchUserNotices()
    this.setData({
      showMoment: false,
      showNotice: true,
    })
    this.hideNewCommentStatus()
  },

  hideNewCommentStatus() {
    console.log('ininin')
    app.globalData.hasNewComment = false
    wx.removeStorage({
      key: 'comments',
      success: function (res) { },
    })
    this.setData({
      hasNewComment: false,
    })
  },

  toTop() {
    this.setData({
      scrollTop: 0
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.getNoticeInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.getNoticeInterval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  scrollToBottom() {
    console.log(this.fetchDataAlready)
    if (this.fetchDataAlready) {
      if (this.data.showMoment) {
        this.currentMomentPage++
        this.fetchUserMoments(this.data.currentUserId, this.currentMomentPage)
      } else {
        this.currentNoticePage++
        this.fetchUserNotices(this.currentNoticePage)
      }
    }
  },
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})
