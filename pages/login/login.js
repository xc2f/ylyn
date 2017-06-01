// pages/login/login.js
var strophe = require('../../utils/strophe.js')
var WebIM = require('../../utils/WebIM.js')
var WebIM = WebIM.default

Page({

  /**
   * 页面的初始数据
   */
  data: {
    account: 'admin',
    password: '123'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.login();
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
  onShareAppMessage: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  bindAccount: function (e) {
    this.setData({
      account: e.detail.value
    })
  },
  bindPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  login: function (e) {
    var that = this
    if (that.data.account == '') {
      wx.showModal({
        title: '请输入用户名！',
        confirmText: 'OK',
        showCancel: false
      })
    } else if (that.data.password == '') {
      wx.showModal({
        title: '请输入密码！',
        confirmText: 'OK',
        showCancel: false
      })
    } else {
      var options = {
        apiUrl: WebIM.config.apiURL,
        user: that.data.account,
        pwd: that.data.password,
        grant_type: 'password',
        appKey: WebIM.config.appkey
      }
      wx.setStorage({
        key: "myAccount",
        data: that.data.account
      })
      //console.log('open')
      WebIM.conn.open(options)
    }
  },


  signup: function (e) {
    var that = this;
    if (that.data.account == '') {
      wx.showModal({
        title: '请输入用户名！',
        confirmText: 'OK',
        showCancel: false
      })
    } else if (that.data.password == '') {
      wx.showModal({
        title: '请输入密码！',
        confirmText: 'OK',
        showCancel: false
      })
    } else {
      var options = {
        apiUrl: WebIM.config.apiURL,
        username: that.data.account,
        password: that.data.password,
        nickname: '',
        appKey: WebIM.config.appkey,
        success: function (res) {
          console.log(res.access_token)
          if (res.statusCode == '200') {
            wx.showToast({
              title: '注册成功,正在登录',
              icon: 'success',
              duration: 1500,
              success: function () {
                var data = {
                  apiUrl: WebIM.config.apiURL,
                  user: that.data.account,
                  pwd: that.data.password,
                  grant_type: 'password',
                  appKey: WebIM.config.appkey
                }
                //console.log('data',data)
                wx.setStorage({
                  key: "myAccount",
                  data: that.data.account
                })

                setTimeout(function () {
                  WebIM.conn.open(data)
                }, 1000)
              }
            });
          }
        },
        error: function (res) {
          if (res.statusCode !== '200') {
            wx.showModal({
              title: '用户名已被占用',
              showCancel: false,
              confirmText: 'OK'
            })
          }
        }
      }
      WebIM.utils.registerUser(options)
    }
  }
})