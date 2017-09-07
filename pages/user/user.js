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
  },

  currentMomentPage: 1,
  currentNoticePage: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let deviceInfo = app.globalData.deviceInfo
    this.setData({
      currentUserId: options.user_id,
      userId: app.globalData.userId,
      imgHeight: deviceInfo.screenHeight / 2 * 0.85,
      momentImgHeight: deviceInfo.screenWidth / 2 * 0.85
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
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6'
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
    page = page || 1
    wx.request({
      url: app.requestHost + 'Store/get_tuser_notice/',
      method: 'POST',
      data: {
        tuser_id: userId,
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6',
        page: page
      },
      success: (res) => {
        console.log(res)
        if (res.data.code === 201) {
          this.setData({
            fetchMomentsFail: false
          })
          let result = res.data.result
          if(result.length === 0){
            this.currentMomentPage = page - 1
          } else {
            let list = this.data.moments.slice()
            result.map(item => {
              list.push(item)
            })
            this.parseMoment(list)
          }
        } else {
          this.currentMomentPage = page - 1
          this.setData({
            fetchMomentsFail: true
          })
        }
      },
      fail: () => {
        // error needn't to handle
        this.currentMomentPage = page - 1
        this.setData({
          fetchMomentsFail: true
        })
      }
    })

  },

  parseMoment(data) {
    // add animation
    let storeId = app.globalData.storeInfo ? app.globalData.storeInfo.storeId : null
    data.map((item, idx) => {
      item.animation = {}
      item.animationAngle = {}
      item.toggleStatus = false
      item.access = storeId === item.store_id ? true : false
      item.parseTime = fromNow(item.add_time * 1000)
    })
    this.setData({
      moments: data
    })
  },

  fetchUserNotices(page) {
    page = page || 1
    wx.request({
      url: app.requestHost + 'Store/get_user_partake/',
      method: 'POST',
      data: {
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6',
        page: page
      },
      success: res => {
        if (res.data.code === 201) {
          this.setData({
            fetchNoticesFail: false
          })
          let result = res.data.result
          if (result.length === 0) {
            this.currentNoticePage = page - 1
          } else {
            if(page === 1){
              this.parseTime(result)
            } else {
              let list = this.data.notices.slice()
              result.map(item => {
                list.push(item)
              })
              this.parseTime(list)
            }
          }

        } else {
          this.currentNoticePage = page - 1
          this.setData({
            fetchNoticesFail: true
          })
        }
      },
      fail: () => {
        this.currentNoticePage = page - 1
        this.setData({
          fetchNoticesFail: true
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
    // console.log(e.currentTarget.dataset.friendinfo)
    wx.navigateTo({
      url: this.data.userId === this.data.userInfo.user_id ? '/pages/config/config' : '/pages/chat/chat?friendinfo=' + JSON.stringify(e.currentTarget.dataset.friendinfo),
    })
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
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


  basicAnimation(duration, delay) {
    let animation = wx.createAnimation({
      duration: duration || 500,
      timingFunction: "ease",
      delay: delay || 0
    });
    return animation;
  },

  toggleBar(e) {
    let idx = e.currentTarget.dataset.idx
    let templist = this.data.moments
    let item = templist[idx]
    if (item.toggleStatus) {
      item.toggleStatus = false
      item.animation = this.basicAnimation().height(30).step().export()
      item.animationAngle = this.basicAnimation().rotate(0).step().export()
    } else {
      item.toggleStatus = true
      item.animation = this.basicAnimation().height('100%').step().export()
      item.animationAngle = this.basicAnimation().rotate(90).step().export()
    }
    this.setData({
      moments: templist
    })
  },

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

  toMoment(e) {
    if (this.data.currentUserId !== this.data.userId){
      return
    }
    let idx = e.currentTarget.dataset.idx
    let side = e.currentTarget.dataset.side
    if (side === 'moment') {
      let data = this.data.moments[idx]
      // if (data.access) {
        // 删除两个动画键
        delete data.animation
        delete data.animationAngle
        wx.navigateTo({
          url: '/pages/moments/comment/comment?from=user&type=user&item=' + JSON.stringify(data),
        })
      // } else {
      //   wx.showModal({
      //     showCancel: false,
      //     content: '我只能在' + data.store_name + '打开哦',
      //   })
      // }
    } else if (side === 'notice') {
      let data = this.data.notices[idx]
      // TODO 商家动态
      // if (data.access) {
        wx.navigateTo({
          url: '/pages/moments/comment/comment?from=user&item=' + JSON.stringify(data.notice_info),
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
    if(this.data.showMoment){
      this.currentMomentPage++
      this.fetchUserMoments(this.data.currentUserId, this.currentMomentPage)
    } else {
      this.currentNoticePage++
      this.fetchUserNotices(this.currentNoticePage)
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})
