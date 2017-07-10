// pages/changePic/changePic.js
import { upload, deleteFile, getFileInfo } from '../../untils/update.js'
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: null,
    itemWidth: null,

    pics: null,
    picLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    let deviceInfo = getApp().globalData.deviceInfo
    this.setData({
      windowHeight: deviceInfo.windowHeight,
      // 减去两边的边距
      itemWidth: Math.floor((deviceInfo.windowWidth-20) / 3)
    })

    wx.setNavigationBarTitle({
      title: '个人展示',
    })

    wx.request({
      // url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/uploadPic',
      url: app.requestHost + 'member/get_user_album/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success:function(res){
        console.log(res)
        that.setData({
          pics: res.data.result,
          picLength: res.data.result.length
        })
      }
    })

  },

  prevImg(e) {
    let that = this;
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: (function () {
        let imgList = []
        for (let i = 0; i < that.data.pics.length; i++) {
          imgList.push(that.data.pics[i].album)
        }
        return imgList
      }()),
    })
  },

  removePic(e) {
    let that = this
    let idx = e.currentTarget.dataset.idx
    wx.request({
      url: app.requestHost + 'member/del_user_album/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        album_id: that.data.pics[idx].album_id
      },
      success: function(res){
        if(res.data.code === 201){
          let tempList = that.data.pics
          tempList.splice(idx, 1)
          that.setData({
            pics: tempList,
            picLength: tempList.length
          })
        }
      }
    })
  },

  addPic(){
    let that = this
    wx.chooseImage({
      count: 9 - that.data.picLength, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        let tempList = that.data.pics
        for(let i=0; i<tempFilePaths.length; i++){
          // TODO 上传照片
          let suffix = tempFilePaths[i].slice(tempFilePaths[i].lastIndexOf('.'))
          let fileName = 'album-' + app.globalData.userId + '-' + new Date().getTime() + suffix
          upload('userAlbum', tempFilePaths[i], fileName, resUrl => {
            // console.log(resUrl)
            wx.request({
              url: app.requestHost + 'member/update_user_album/',
              method: 'POST',
              data: {
                token: app.TOKEN,
                album: resUrl.data.access_url
              },
              success: function (res) {
                if (res.data.code === 201) {
                  // TODO
                  tempList.push({
                    album: tempFilePaths[i],
                    album_id: res.data.result.album_id
                  })
                  if (i === tempFilePaths.length - 1) {
                    console.log('in')
                    console.log(tempList)
                    setTimeout(function(){
                      that.setData({
                        pics: tempList,
                        picLength: tempList.length
                      })
                    }, 1000)
                  }
                }
              },
              fail: function (res) {
                console.log(res)
              }
            })
          })
        }
      }
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
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})