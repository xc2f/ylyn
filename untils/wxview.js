(function() {
    var wxView = {
        elasticity:0.45,
        upBound:0,
        downBound:0,
        diff:.5,
        friction:.96,
        speedMultiplier:16,
        maxSpeed:35,
        stopSpeed:.1,
        upRatio:5,
        downRatio:.8,
        loopInterval:4,
        isMove:false,
        stopMove:false,
        checkY:true,

        y:0,
        render:null,
        width:0,
        height:0,

        touchstartcb:null,
        touchmovecb:null,
        touchendcb:null,
        touchcancelcb:null,
        touchendMovecb:null,

        setTouchcb: function (scb, mcb, ecb, ccb) {
            this.touchstartcb = scb;
            this.touchmovecb = mcb;
            this.touchendcb = ecb;
            this.touchcancelcb = ccb;
        },
        setTouchendMovecb: function (cb) {
            this.touchendMovecb = cb;
        },
        setWH: function(width, height) {
            this.width = width;
            this.height = height;
        },
        setBound: function(upBound, downBound) {
            this.upBound = upBound;
            this.downBound = downBound || 0;
        },
        setCheckY: function(checkY) {
            this.checkY = checkY;
        },
        setAnimationParam: function(animationParam) {
            this.animationParam = animationParam;
        },
        moveY: function(y) {
            this.y = y;
            var sindex = this.animationParam;
            var animation = wx.createAnimation({duration:0});
            animation.translateY(y).step();
            var renderData = this.page.getRenderData();
            renderData[sindex] = animation.export();
            this.page.render();
        },
        smoothMoveY: function(y, callback) {
            this.y = y;
            var sindex = this.animationParam;
            var animation;
            animation = wx.createAnimation({duration:300, timingFunction:'ease-in-out'});
            animation.translateY(y).step();
            var renderData = this.page.getRenderData();
            renderData[sindex] = animation.export();
            this.page.render();
            if (typeof callback === 'function') {
                setTimeout(callback, 300);
            }
        },
        lineMoveY: function(y, callback) {
            this.y = y;
            var sindex = this.animationParam;
            var animation;
            animation = wx.createAnimation({duration:300});
            animation.translateY(y).step();
            var renderData = this.page.getRenderData();
            renderData[sindex] = animation.export();
            this.page.render();
            if (typeof callback === 'function') {
                setTimeout(callback, 300);
            }
        },
        ontouchstart: function(e) {
            var isMove = this.isMove;
            if (this.isMove) {
                this.stopMove = true;
            }
            if (typeof this.touchstartcb === 'function'){
                var args = {};
                args.isMove = isMove;
                this.touchstartcb(e, 'touchstart', args);
            }
        },
        ontouchmove: function(e, dy) {
            if (!this.checkY) {
                return;
            }
            if (this.y + dy < this.upBound || this.y + dy > this.downBound) {
                dy = dy * this.elasticity;
            }
            this.moveY(this.y + dy);
      
            if (typeof this.touchmovecb === 'function'){
                var args = {};
                args.y = this.y;
                args.dy = dy;
                this.touchmovecb(e, 'touchmove', args);
            }
        },
        ontouchend: function(e, speedY) {
            if (!this.checkY) {
                return;
            }
            var args = {};
            if (typeof this.touchendcb === 'function'){
                args.y = this.y;
                this.touchendcb(e, 'touchend', args);
            }
            if (args.isStop) {
                return;
            }
            speedY = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, speedY * this.speedMultiplier));
            this.isMove = true;
            this.stopMove = false;
            var s = this;
            loop();

            function loop() {
                if (s.stopMove) {
                    s.isMove = false;
                    return;
                }
                var y = 0;
                var isLoop = true;
                speedY *= s.friction;
                if (s.y > s.diff + s.downBound) {
                    s.y *= s.downRatio;
                    speedY *= 0.85;
                    if (s.y > s.diff + s.downBound) {
                        y = s.y + speedY;
                    }
                    else {
                        y = s.downBound;
                        isLoop = false;
                    }  
                }
                else if (s.y < s.upBound - s.diff) {
                    s.y += (s.upBound - s.y) / s.upRatio;
                    speedY *= 0.85;
                    if (s.y < s.upBound - s.diff) {
                        y = s.y + speedY;
                    }
                    else {
                        y = s.upBound;
                        isLoop = false;
                    }
                }
                else if (Math.abs(speedY) > 0.1) {
                    y = s.y + speedY;
                }
                else {
                    y = s.y + speedY;
                    isLoop = false;
                }
                s.moveY(y);
                var args = {};
                args.isStop = false;
                if (typeof s.touchendMovecb === 'function') {
                    args.y = s.y;
                    s.touchendMovecb(e, 'touchendmove', args);
                }
                s.isMove = isLoop && !args.isStop;
                if (isLoop && !args.isStop) {
                    setTimeout(loop, 16);
                }
            }
        },
    };

    function createWXView() {
        return Object.create(wxView);
    }

    module.exports = {createWXView:createWXView};
})();