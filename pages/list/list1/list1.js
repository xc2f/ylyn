Page({
  data: {},
  onLoad: function (options) {
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.log(latitude, longitude)
        wx.openLocation({
          latitude: 34.2771700000,
          longitude: 108.9619100000,
          name: '火车站',
          scale: 28
        })
      }
    })
  }
})