//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    cityname: null,
    weatherInfo: null

  },
  //事件处理函数

  getCity1: function (e) {
    this.setData({ cityname: e.detail.value })
  },
  getCity2: function () {
    var thispage1 = this
    app.getWeatherInfo(this.data.cityname, function (data) {
      thispage1.setData({ weatherInfo: data.result.future })
      // thispage2.setData({weatherNow : data.result.sk})
      // thispage3.setData({ weatherToday:data.result.today})
      console.log(data)
    })
  },

  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  }
})
