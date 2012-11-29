KISSY.add("brix/gallery/packet/index", function(S, Brick) {
    /**
     * 抽奖组件
     * <br><a href="../demo/gallery/packet/packet.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Packet
     * @extends Brix.Brick
     */
    function Packet() {
        Packet.superclass.constructor.apply(this, arguments);
    }
    Packet.ATTRS = {
        /**
         * 抽奖节点
         * @cfg {string}
         */
        el: {
            value: '.J_Packet'
        },
        /**
         * 防作弊ua.js地址
         * @cfg {String}
         */
        uaSrc: {
            value: 'http://uaction.aliyuncdn.com/js/ua.js'
        },
        /**
         * 用户token
         * @cfg {String}
         */
        token: {
            value: 'inner packe token'
        },
        /**
         * 抽奖接口
         * @cfg {String}
         */
        url: {
            value: 'http://huodong.daily.etao.net/ajax/draw_prize.do?id=1'
        },
        /**
         * 是否可抽奖
         * @cfg {Boolean}
         */
        allowStatus: {
            value: true
        },
        /**
         * 抽奖回调函数集合，包含success和error事件回调函数
         * @cfg {Object}
         */
        callback: {
            value: {
                success: S.noop,
                error: S.noop
            }
        },
        /**
         * 是否在抽奖之后立即设置是否可抽状态
         * @cfg {Boolean}
         */
        autoSetAllowStatus: {
            value: false
        }
    };
    Packet.FIRES = {
        /**
         * @event afterInit
         * 初始化后触发
         */
        afterInit: 'afterInit',
        /**
         * @event beforeSnatch
         * 点击之后抽奖之前触发
         */
        beforeSnatch: 'beforeSnatch'
    };
    Packet.METHODS = {
        /**
         * 初始化防作弊UA
         */
        initUA: function () {
            var self = this,
                hasUALoaed = window.UA_Opt && 'reload' in window.UA_Opt;

            if (hasUALoaed) {
                return;
            }

            window.ua="";
            window.UA_Opt={
                LogVal: 'ua',
                MaxMCLog: 3,
                MaxMPLog: 3,
                MaxKSLog: 3,
                MPInterval: 20,
                Token: new Date().getTime()+":"+Math.random(),
                SendMethod: 8,
                Flag: 14222
            };

            S.IO({
               url: self.get('uaSrc'),
               dataType: 'script',
               timeout: 20,
               success: successHandler,
               error: errorHandler
            });

            function successHandler () {
                S.log('ua.js loaded');
            }

            function errorHandler () {
                S.log('timeout for ua.js');
            }
            
        },
        /**
         * reload 防作弊UA
         */
        reloadUA: function () {
            window.UA_Opt.Token = new Date().getTime()+":"+Math.random();
            window.UA_Opt.reload();
        },
        /**
         * 根据抽奖接口发送抽奖请求
         */
        sendRequest: function () {
            var self = this;

            S.IO({
               url: self.get('url') + self.get('token') + '&ua='+ encodeURIComponent(window.ua),
               dataType: 'jsonp',
               jsonpCallback: 'jsonpCallback',
               success: self.get('callback').success,
               error: self.get('callback').error,
               complete: function () {
                   if (self.get('autoSetAllowStatus')) {
                        self.setAllowStatus(true);
                   }
               },
               timeout: 20
            });
        },
        /**
         * 设置是否可抽状态
         */
        setAllowStatus: function (statusBoolean) {
            if (statusBoolean == undefined) {
                statusBoolean = false;
            }
            this.set('allowStatus', statusBoolean);
        },
        /**
         * 获取当前是否可抽状态
         */
        getAllowStatus: function () {
            return this.get('allowStatus');
        },
        /**
         * 检查当前登录状态，如果未登录则弹出登录浮层并退出抽奖流程
         */
        checkLogin: function () {
            // window.loginPopup = window.loginPopup || S.LoginPopup();

            // if (!window.loginPopup.checkLongOrTrueLogin()) {
            //     window.loginPopup.showLoginPopup();
            //     return;
            // }

            return true;
        }
    };

    Packet.DOCEVENTS = {
    };
    Packet.EVENTS = {
        '':{
            click:function(e){
                this.fire(Packet.FIRES.beforeSnatch);
                this.snatch();
            }
        }
    };

    S.extend(Packet, Brick, {
        initialize: function() {
            var self = this;

            this.fire(Packet.FIRES.afterInit);
            self.initUA();
        },
        snatch: function() {
            var self = this;

            if (!self.checkLogin()) {
                return;
            }

            if (!self.getAllowStatus()) {
                return;
            }

            self.sendRequest();
            self.reloadUA();
            self.setAllowStatus(false);

        }
    });

    S.augment(Packet,Packet.METHODS);
    return Packet;
}, {
    requires: ["brix/core/brick"]
});
