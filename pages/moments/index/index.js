// pages/moments/index/index.js
import fromNow from '../../../untils/moment.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickArray: ['回复', '举报'],
    pickIndex: 0,

    storeMoment: null,
    userMoments: null,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchMomentList()
  },

  fetchMomentList(){
    // TODO: page
    wx.request({
      url: app.requestHost + 'Notice/get_user_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN || 'eyJ0eXBlIjoiand0IiwiYWxnIjoic2hhMSxtZDUifQ==.eyJ1c2VyX2lkIjoiNzM2ZTA4MzUtMmFiYi0wYzRmLThlOTMtNTk5MmMxODA0NGZiIiwic3RhcnRfdGltZSI6MTUwNDQ5NTU4NiwiZW5kX3RpbWUiOjE1MDcwMDExODZ9.7f310b4442559d3c7385537ffd2f4d40730d4bc6',
        store_id: '14b00ff3-f9f7-7337-a713-599d8f8d9c62' || app.globalData.storeInfo.storeId,
        page: 1
      },
      success: (res) => {
        wx.stopPullDownRefresh()
        console.log(res.data)
        if (res.data.code === 201) {
          this.parseMoment(res.data.result)
        } else if (res.data.code === 202) {
          // 没有更多
        } else {
          wx.showModal({
            showCancel: false,
            content: '获取失败',
          })
        }
      },
      fail: () => {
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
      if(meId === item.user_id){
        item.del = true
      }
    })
    this.setData({
      userMoments: templist
    })

  },
  
  prevImg(e){
    let idx = e.currentTarget.dataset.idx
    let img = this.data.userMoments[idx].image
    wx.previewImage({
      urls: [img],
    })
  },

  pickChange(e){
    let idx = e.currentTarget.dataset.idx
    let id = parseInt(e.detail.value)
    console.log(id)
    let item = this.data.userMoments[idx]
    if(id === 0){
      wx.navigateTo({
        url: '/pages/moments/comment/comment?item=' + JSON.stringify(item),
      })
    } else if(id === 1){
      if (item.user_id === app.globalData.userId){
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
            if(res.data.code === 201) {
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
      } else {
        // tousu
      }
    }
  },

  toCommentPage(e){
    let item= JSON.stringify(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: '/pages/moments/comment/comment?item=' + item,
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
    if(app.globalData.momentNeedToRefetch){
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
    this.onLoad()
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
    let idx = e.currentTarget.dataset.idx
    let data = this.data.userMoments[idx]
    let title = data.name + ' ' + data.content + ' -' + app.globalData.storeInfo.storeName 
    let image = data.image
    return {
      title: title,
      // path: ''
      imageUrl: image
    }
  
  }
})