// pages/config/config.js
var app = getApp()

function checkCnText(str) {
  var reg = /[\u4e00-\u9fa5]/g
  if (reg.test(str)) {
    return true
  } else {
    return false
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    genderRange: [
      { title: 'man', value: '男', gender: 1 },
      { title: 'female', value: '女', gender: 2 }
    ],
    userInfo: null,
    tallUnit: 'cm',

    nameBtnShow: false,
    wxIdBtnShow: false,
    ageBtnShow: false,
    tallBtnShow: false,
    introBtnShow: false,

    dataOk: false,
    fetchDataFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.showLoading({
      title: '数据获取中',
    })
    wx.request({
      // url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/config',
      url: app.requestHost + 'member/get_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success: function (res) {
        wx.hideLoading()
        if(res.data.code === 201){
          that.setData({
            userInfo: res.data.result,
            dataOk: true,
            fetchDataFail: false
          })
        } else {
          that.setData({
            dataOk: false,
            fetchDataFail: true
          })
        }
      },
      fail: function(){
        wx.hideLoading()
        that.setData({
          dataOk: false,
          fetchDataFail: true
        })
      }
    })
  },

  occurFail(){
    this.setData({
      fetchDataFail: false
    })
    this.onLoad()
  },

  changePic() {
    wx.redirectTo({
      url: '/pages/changePic/changePic',
    })
  },

  nameFocus() {
    // console.log(1111)
    this.setData({
      nameBtnShow: true,
      nameFocus: true,
    })
  },
  nameBlur() {
    this.setData({
      nameBtnShow: false,
    })
  },
  nameChange(e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    })
  },
  nameSubmit() {
    let that = this
    let nameValue = this.data.userInfo.nickname.trim()
    let len = 0
    nameValue.split('').forEach(item => {
      if (checkCnText(item)){
        len += 2
      } else {
        len += 1
      }
    })
    if(len > 12){
      wx.showModal({
        title: '您的更改未提交',
        showCancel: false,
        content: '昵称在12个字符以内，1汉字等于2字符',
      })
      return 
    }
      wx.request({
        url: app.requestHost + 'member/update_userinfo/',
        method: 'POST',
        data: {
          token: app.TOKEN,
          nickname: nameValue
        },
        success: function (res) {
          if(res.data.code === 201){
            wx.setStorage({
              key: 'meInfo',
              data: that.data.userInfo,
            })
          } else if(res.data.code === 102){

          } else {
            wx.showModal({
              title: '提示',
              content: '修改失败',
              showCancel: false,
            })
          }
        },
        fail: function(){
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      })
  },

  wxIdFocus() {
    this.setData({
      wxIdBtnShow: true,
      wxIdFocus: true,
    })
  },
  wxIdBlur() {
    this.setData({
      wxIdBtnShow: false
    })
  },
  wxIdChange(e) {
    this.setData({
      'userInfo.wechat_num': e.detail.value
    })
  },
  wxIdSubmit() {
    let that = this
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        wechat_num: this.data.userInfo.wechat_num.trim()
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.setStorage({
            key: 'meInfo',
            data: that.data.userInfo,
          })
        } else if (res.data.code === 102) {

        } else {
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '修改失败',
          showCancel: false,
        })
      }
    })
  },


  genderChange(e) {
    this.setData({
      'userInfo.gender': e.detail.value
    })
    let that = this
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        gender: this.data.userInfo.gender
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.setStorage({
            key: 'meInfo',
            data: that.data.userInfo,
          })
        } else if (res.data.code === 102) {

        } else {
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '修改失败',
          showCancel: false,
        })
      }
    })
  },

  ageFocus() {
    this.setData({
      ageBtnShow: true,
      ageFocus: true
    })
  },
  ageBlur() {
    this.setData({
      ageBtnShow: false
    })
  },
  ageChange(e) {
    this.setData({
      'userInfo.age': e.detail.value
    })
  },
  ageSubmit() {
    let that = this
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        age: this.data.userInfo.age
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.setStorage({
            key: 'meInfo',
            data: that.data.userInfo,
          })
        } else if (res.data.code === 102) {

        } else {
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '修改失败',
          showCancel: false,
        })
      }
    })
  },

  infoChange(e) {
    this.setData({
      'userInfo.info': e.detail.value
    })
  },

  tallFocus() {
    this.setData({
      tallBtnShow: true,
      tallFocus: true
    })
  },
  tallBlur() {
    this.setData({
      tallBtnShow: false
    })
  },
  tallChange(e) {
    let tall = e.detail.value
    // console.log(tall)
    // let nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    // if (tall.length === 3) {
    //   // let tall0 = Math.floor(tall / 100)
    //   // let tall1 = Math.floor(tall % 100 / 10)
    //   // let tall2 = tall % 100 % 10
    //   let tall0 = parseInt(tall[0])
    //   let tall1 = parseInt(tall[1])
    //   let tall2 = parseInt(tall[2])
    //   if (nums.indexOf(tall0) !== -1 && nums.indexOf(tall1) !== -1 && nums.indexOf(tall2) !== -1) {
    //     this.setData({
    //       'userInfo.height': e.detail.value + 'cm',
    //       'tallUnit': ''
    //     })
    //   }
    // } else {
      this.setData({
        'userInfo.height': e.detail.value,
        'tallUnit': ''
      })
    // }
  },
  tallSubmit() {
    let that = this
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        height: this.data.userInfo.height
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.setStorage({
            key: 'meInfo',
            data: that.data.userInfo,
          })
        } else if (res.data.code === 102) {

        } else {
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '修改失败',
          showCancel: false,
        })
      }
    })
  },

  introFocus() {
    this.setData({
      introBtnShow: true,
      introFocus: true
    })
  },
  introBlur() {
    this.setData({
      introBtnShow: false
    })
  },
  introChange(e) {
    this.setData({
      'userInfo.introduction': e.detail.value
    })
  },
  introSubmit() {
    let that = this
    let introduction = this.data.userInfo.introduction.trim()
    let len = 0
    introduction.split('').forEach(item => {
      if (checkCnText(item)) {
        len += 2
      } else {
        len += 1
      }
    })
    if (len > 60) {
      wx.showModal({
        title: '您的更改未提交',
        showCancel: false,
        content: '简介在60个字符以内，1汉字等于2字符',
      })
      return
    }
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        introduction: introduction
      },
      success: function (res) {
        if (res.data.code === 201) {
          wx.setStorage({
            key: 'meInfo',
            data: that.data.userInfo,
          })
        } else if (res.data.code === 102) {

        } else {
          wx.showModal({
            title: '提示',
            content: '修改失败',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '修改失败',
          showCancel: false,
        })
      }
    })
  },


  connectUs(){
    wx.makePhoneCall({
      phoneNumber: '02981117328',
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