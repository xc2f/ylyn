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
    introBtnShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.request({
      // url: 'http://easy-mock.com/mock/592e223d91470c0ac1fec1bb/ylyn/config',
      url: app.requestHost + 'member/get_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN
      },
      success: function (res) {
        console.log(res)
        that.setData({
          userInfo: res.data.result
        })
      }
    })
  },


  changePic() {
    wx.redirectTo({
      url: '/pages/changePic/changePic',
    })
  },

  nameFocus() {
    this.setData({
      nameBtnShow: true
    })
  },
  nameBlur() {
    this.setData({
      nameBtnShow: false
    })
  },
  nameChange(e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    })
  },
  nameSubmit() {
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
        content: '昵称在12个字符以内，1汉字 === 2字符',
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
          // console.log(res)
        }
      })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },

  wxIdFocus() {
    this.setData({
      wxIdBtnShow: true
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
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        wechat_num: this.data.userInfo.wechat_num.trim()
      },
      success: function (res) {
        // console.log(res)
      }
    })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },


  genderChange(e) {
    this.setData({
      'userInfo.gender': e.detail.value
    })
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        gender: this.data.userInfo.gender
      },
      success: function (res) {
        // console.log(res)
      }
    })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },

  ageFocus() {
    this.setData({
      ageBtnShow: true
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
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        age: this.data.userInfo.age
      },
      success: function (res) {
        // console.log(res)
      }
    })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },

  infoChange(e) {
    this.setData({
      'userInfo.info': e.detail.value
    })
  },

  tallFocus() {
    this.setData({
      tallBtnShow: true
    })
  },
  tallBlur() {
    this.setData({
      tallBtnShow: false
    })
  },
  tallChange(e) {
    let tall = e.detail.value
    let nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    if (tall.length === 3) {
      let tall0 = Math.floor(tall / 100)
      let tall1 = Math.floor(tall % 100 / 10)
      let tall2 = tall % 100 % 10
      if (nums.indexOf(tall0) !== -1 && nums.indexOf(tall1) !== -1 && nums.indexOf(tall2) !== -1) {
        this.setData({
          'userInfo.height': e.detail.value + 'cm',
          'tallUnit': ''
        })
      }
    } else {
      this.setData({
        'userInfo.height': e.detail.value,
        'tallUnit': ''
      })
    }
  },
  tallSubmit() {
    wx.request({
      url: app.requestHost + 'member/update_userinfo/',
      method: 'POST',
      data: {
        token: app.TOKEN,
        height: this.data.userInfo.height
      },
      success: function (res) {
        // console.log(res)
      }
    })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },

  introFocus() {
    this.setData({
      introBtnShow: true
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
        content: '简介在60个字符以内，1汉字 === 2字符',
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
        // console.log(res)
      }
    })
    wx.setStorage({
      key: 'meInfo',
      data: this.data.userInfo,
    })
  },
  postConfig() {
    // console.log(this.data.userInfo)
  },

  cleanAccount() {
    wx.showModal({
      title: '警告',
      content: '此操作将删除您本地所有账号信息，包括聊天记录。您可通过重新登录继续授权，但聊天记录不可恢复。',
      success: function (res) {
        if (res.confirm) {
          // TODO 后期如果有保存文件到缓存
          wx.clearStorage()
          wx.closeSocket()
          app.globalData.userId = null
          wx.redirectTo({
            url: '/pages/nearlist/nearlist?op=nologin',
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
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