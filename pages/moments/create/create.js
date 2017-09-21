// pages/moments/create/create.js
import { upload } from '../../../untils/update.js'
let app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    time: '',
    loading: false,
    submitStatus: '发布',
    overText: false,
    userInfo: null
  },
  content: '',
  refreshTimeInterval: null,


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'meInfo',
      success: (res) => {
        this.setData({
          userInfo: res.data
        })
      },
    })

    let now = new Date()
    let hours = now.getHours()
    let minutes = now.getMinutes()
    minutes = minutes < 10 ? ('0' + minutes) : minutes
    this.setData({
      time: hours + ':' + minutes
    })
    this.refreshCreateTime()
  },

  refreshCreateTime() {
    this.refreshTimeInterval = setInterval(() => {
      let now = new Date()
      let hours = now.getHours()
      let minutes = now.getMinutes()
      minutes = minutes < 10 ? ('0' + minutes) : minutes
      this.setData({
        time: hours + ':' + minutes
      })
    }, 10000)
  },

  contentInput(e){
    let value = e.detail.value
    this.content = value
    if (value.length > 20){
      this.setData({
        overText: true
      })
    } else {
      this.setData({
        overText: false
      })
    }
  },

  addPic() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          src: res.tempFilePaths[0]
        })
      },
      fail: function(){
        // wx.showModal({
        //   showCancel: false,
        //   content: '未知错误',
        // })
      }
    })
  },

  submit() {
    let that = this
    if(that.data.overText){
      wx.showModal({
        showCancel: false,
        content: '内容应在20字以内',
      })
      return
    }
    if(that.data.src === ''){
      wx.showModal({
        showCancel: false,
        content: '请添加一张图片',
      })
      return
    }
    that.setData({
      loading: true,
      submitStatus: '发布中'
    })
    let imgSrc = that.data.src
    if (imgSrc.indexOf('myqcloud')>=0){
      // console.log(imgSrc.indexOf('myqcloud'))
      that.postData(imgSrc)
    } else {
      let suffix = imgSrc.slice(imgSrc.lastIndexOf('.'))
      let fileName = app.globalData.userId + '-' + new Date().getTime() + suffix
      upload('userAlbum', imgSrc, fileName, resUrl => {
        if (resUrl.data.access_url) {
          that.postData(resUrl.data.access_url)
        } else {
          wx.showModal({
            showCancel: false,
            content: '图片上传失败',
          })
        }
      })
    }
  },

  postData(src){
    let that = this
    wx.request({
      url: app.requestHost + 'Notice/report_user_notice/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        store_id: app.globalData.storeInfo.storeId,
        content: that.content,
        image: src
      },
      success: function (res) {
        // console.log('app.TOKEN', app.TOKEN, 'app.globalData.storeInfo.storeId', app.globalData.storeInfo.storeId, 'that.content', that.content, 'resUrl.data.access_url', src)
        that.setData({
          loading: false,
          submitStatus: '发布'
        })
        if (res.data.code === 201) {
          app.globalData.momentNeedToRefetch = true
          app.globalData.momentScrollToTop = true
          wx.navigateBack()
        } else {
          wx.showModal({
            showCancel: false,
            content: '发布失败',
          })
        }
      },
      fail: function () {
        wx.showModal({
          showCancel: false,
          content: '发布失败',
        })
      }
    })
  },

  prevImg(){
    wx.previewImage({
      urls: [this.data.src],
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
    clearInterval(this.refreshTimeInterval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.refreshTimeInterval)
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
})