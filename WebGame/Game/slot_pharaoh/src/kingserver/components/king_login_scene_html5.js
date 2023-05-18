"use strict";

var KingLoginLayer = cc.Layer.extend({
    LOGTAG: "[KingLoginLayer]",

    ACCOUNT_LOCAL: [{
        userId: "33125",
        userName: "phahl002",
        userEmail: "phahl002@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33126",
        userName: "phahl003",
        userEmail: "phahl003@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33127",
        userName: "phahl004",
        userEmail: "phahl004@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33128",
        userName: "phahl005",
        userEmail: "phahl005@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33129",
        userName: "phahl006",
        userEmail: "phahl006@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33130",
        userName: "phahl007",
        userEmail: "phahl007@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33131",
        userName: "phahl008",
        userEmail: "phahl008@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33132",
        userName: "phahl009",
        userEmail: "phahl009@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }, {
        userId: "33133",
        userName: "phahl0010",
        userEmail: "phahl0010@abc.net",
        userPass: "12-0D-1B-68-A0-99-F9-62-CD-69-87-AC-07-88-A2-EE-C3-71-E1-8E"
    }],

    ACCOUNT_ONLINE: [{
        userId: "210764",
        userName: "DickSmith",
        userEmail: "dicksmith@abc.net",
        userPass: "123@abc",
        userPassHash: "dfa64301bee6fc4952c3e30542aaaed1"
    }, {
        userId: "210773",
        userName: "JackWilson",
        userEmail: "jackwilson@abc.net",
        userPass: "123@abc",
        userPassHash: "dfa64301bee6fc4952c3e30542aaaed1"
    }, {
        userId: "210772",
        userName: "GeorgeStacey",
        userEmail: "georgestacey@abc.net",
        userPass: "123@abc",
        userPassHash: "dfa64301bee6fc4952c3e30542aaaed1"
    }, {
        userId: "210769",
        userName: "HarryStafford",
        userEmail: "harrystafford@abc.net",
        userPass: "123@abc",
        userPassHash: "dfa64301bee6fc4952c3e30542aaaed1"
    }],

    TABS: {
        LOCAL: 0,
        ONLINE: 1
    },

    TAB_COLOR_NORMAL: cc.hexToColor("#2f2f2f"),
    TAB_COLOR_SELECTED: cc.hexToColor("#f1c40f"),

    TEXT_COLOR_INPUT: cc.color.BLACK,
    TEXT_COLOR_PLACEHOLDER: cc.hexToColor("#D1D1D1"),

    ACC_NAME_COLOR_LOCAL: cc.hexToColor("#f39c12"),
    ACC_NAME_COLOR_ONLINE: cc.hexToColor("#2ecc71"),

    ctor: function ctor() {
        var onBetaSelected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var onOnlineSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this._super();

        this.isBusy = false;

        this.isWindows = cc.sys.os === cc.sys.OS_WINDOWS;
        this.isTemplate = true;

        this.usePortalLogin = !this.isTemplate;

        this.onBetaSelected = onBetaSelected;
        this.onOnlineSelected = onOnlineSelected;

        // reset overriden funcs

        if (portalHelper._getLanguageStr !== undefined) {
            portalHelper.getLanguageStr = portalHelper._getLanguageStr;
            delete portalHelper._getLanguageStr;
        }
        if (portalHelper._getLanguageType !== undefined) {
            portalHelper.getLanguageType = portalHelper._getLanguageType;
            delete portalHelper._getLanguageType;
        }

        this.resourceRoot = this.isTemplate ? "res/dev" : "common/resources";
        var jsonFile = this.resourceRoot + "/portal_login.json";

        this.root = ccs.load(jsonFile).node;
        NodeUtils.fixTextLayout(this.root);
        this.addChild(this.root);

        var bg = this.root.getChildByName("bg");
        bg.setContentSize(cc.size(cc.visibleRect.width, cc.visibleRect.height));

        this.initButtons(this.root);
        this.initPanelLocal(this.root);
        this.initPanelOnline(this.root);
        this.initPanelSetting(this.root);

        this.initTabs(this.root);
    },

    onEnter: function onEnter() {
        this._super();

        this.loadAccount(this.listAccountLocal, this.ACCOUNT_LOCAL, true);
        this.loadAccount(this.listAccountOnline, this.ACCOUNT_ONLINE);
    },

    initPanelLocal: function initPanelLocal(node) {
        var _this = this;

        this.panelLocal = node.getChildByName("panel_local");
        this.panelLocal.setVisible(false);

        this.buttonLocal = node.getChildByName("button_local");
        this.buttonLocal.addTouchEventListener(function (sender, type) {
            if (_this.applyPressedEffect(sender, type, 1, 1)) {
                _this.selectTab(_this.TABS.LOCAL);
            }
        });

        this.buttonLocalText = this.buttonLocal.getChildByName("text");

        this.listAccountLocal = this.panelLocal.getChildByName("list_accounts");
        this.listAccountLocal.setScrollBarEnabled(false);
        this.listAccountLocal.setContentSize(cc.size(cc.visibleRect.width, cc.visibleRect.height - this.buttonLocal.height));
    },

    initPanelOnline: function initPanelOnline(node) {
        var _this2 = this;

        this.panelOnline = node.getChildByName("panel_online");
        this.panelOnline.setVisible(false);

        this.buttonOnline = node.getChildByName("button_online");
        this.buttonOnline.addTouchEventListener(function (sender, type) {
            if (_this2.applyPressedEffect(sender, type, 1, 1)) {
                _this2.selectTab(_this2.TABS.ONLINE);
            }
        });

        this.buttonOnlineText = this.buttonOnline.getChildByName("text");

        this.panelLogin = this.panelOnline.getChildByName("panel_login");
        this.panelLogin.setScale(cc.visibleRect.height / 720);

        this.listAccountOnline = this.panelOnline.getChildByName("list_accounts");
        this.listAccountOnline.setScrollBarEnabled(false);
        this.listAccountOnline.setVisible(!this.usePortalLogin);
        this.listAccountOnline.setContentSize(cc.size(cc.visibleRect.width - this.panelLogin.width * this.panelLogin.getScale(), cc.visibleRect.height - this.buttonOnline.height));

        if (this.usePortalLogin) this.panelLogin.setPositionX(cc.visibleRect.center.x - this.panelLogin.width * this.panelLogin.getScale() * 0.5);

        this.inputFrameName = this.panelLogin.getChildByName("bg_input_name");
        this.inputFramePass = this.panelLogin.getChildByName("bg_input_pass");

        this.textName = this.inputFrameName.getChildByName("box").getChildByName("text_name");
        this.textName.setTextColor(this.TEXT_COLOR_PLACEHOLDER);
        this.textName.setString(portalHelper.getUserName());
        this.textName.setVisible(this.usePortalLogin);

        this.textPass = this.inputFramePass.getChildByName("box").getChildByName("text_pass");
        this.textPass.setTextColor(this.TEXT_COLOR_PLACEHOLDER);
        this.textPass.setString("******");
        this.textPass.setVisible(this.usePortalLogin);

        if (this.usePortalLogin) {

            var inputMargin = 15;
            var inputFontSize = 28;
            var inputFontName = this.resourceRoot + "/fester_bold.ttf";

            var inputSize = this.inputFrameName.getContentSize();
            inputSize = cc.size(inputSize.width - inputMargin * 2, inputSize.height - 5);

            this.inputName = cc.EditBox.create(inputSize, "Default/editbox_default.png");
            this.panelLogin.addChild(this.inputName);

            this.inputName.setMaxLength(100);
            this.inputName.setFontName(inputFontName);
            this.inputName.setFontSize(inputFontSize);
            this.inputName.setFontColor(this.TEXT_COLOR_INPUT);
            this.inputName.setPlaceholderFontName(inputFontName);
            this.inputName.setPlaceholderFontSize(inputFontSize);
            this.inputName.setPlaceholderFontColor(this.TEXT_COLOR_PLACEHOLDER);
            this.inputName.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
            this.inputName.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
            this.inputName.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
            this.inputName.setAnchorPoint(cc.ANCHOR_MIDDLE_LEFT());
            this.inputName.setPosition(cc.p(this.inputFrameName.x + inputMargin, this.inputFrameName.y - 5));
            this.inputName.setPlaceHolder("Enter username");
            this.inputName.setDelegate(this);

            this.inputPass = cc.EditBox.create(inputSize, "Default/editbox_default.png");
            this.panelLogin.addChild(this.inputPass);

            this.inputPass.setMaxLength(100);
            this.inputPass.setFontName(inputFontName);
            this.inputPass.setFontSize(inputFontSize);
            this.inputPass.setFontColor(this.TEXT_COLOR_INPUT);
            this.inputPass.setPlaceholderFontName(inputFontName);
            this.inputPass.setPlaceholderFontSize(inputFontSize);
            this.inputPass.setPlaceholderFontColor(this.TEXT_COLOR_PLACEHOLDER);
            this.inputPass.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
            this.inputPass.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
            this.inputPass.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
            this.inputPass.setAnchorPoint(cc.ANCHOR_MIDDLE_LEFT());
            this.inputPass.setPosition(cc.p(this.inputFramePass.x + inputMargin, this.inputFramePass.y));
            this.inputPass.setPlaceHolder("Enter password");
            this.inputPass.setDelegate(this);
        }

        this.buttonLogin = this.panelLogin.getChildByName("button_login");
        this.buttonLogin.addTouchEventListener(function (sender, type) {
            if (_this2.applyPressedEffect(sender, type, 1, 0.9)) {
                if (_this2.usePortalLogin) {
                    _this2.onOnlineSelected && _this2.onOnlineSelected(null, _this2.getOptions());
                } else {
                    var userName = _this2.inputName.getString();
                    var userPass = _this2.inputPass.getString();
                    if (userName.length > 0 && userPass.length > 0) {
                        portalHelper.setUserName(userName);
                        portalHelper.setUserPass(userPass);
                        _this2.loginOnlineNormal(portalHelper.getUserName(), portalHelper.getUserPassHash(), function () {
                            _this2.onOnlineSelected && _this2.onOnlineSelected(null, _this2.getOptions());
                        });
                    } else {
                        // TODO: Show error
                    }
                }
            }
        });

        this.buttonInstant = this.panelLogin.getChildByName("button_instant");
        this.buttonInstant.setVisible(!this.usePortalLogin);
        this.buttonInstant.addTouchEventListener(function (sender, type) {
            if (_this2.applyPressedEffect(sender, type, 1, 0.9)) {
                _this2.loginOnlineInstant(function () {
                    _this2.onOnlineSelected && _this2.onOnlineSelected(null, _this2.getOptions());
                });
            }
        });
    },

    initPanelSetting: function initPanelSetting(node) {
        var _this3 = this;

        this.buttonSetting = node.getChildByName("button_setting");
        this.buttonSetting.addTouchEventListener(function (sender, type) {
            if (_this3.applyPressedEffect(sender, type, 1, 0.9)) {
                _this3.toggleSetting();
            }
        });

        this.panelSetting = node.getChildByName("panel_setting");
        NodeUtils.setNodeCascade(this.panelSetting, true, true);

        this.panelSetting.setVisible(false);
        this.panelSetting.isBusy = false;
        this.panelSetting.basePosition = this.panelSetting.getPosition();

        this.initPanelSettingIP(this.panelSetting);
        this.initPanelSettingRemote(this.panelSetting);
        this.initPanelSettingSocket(this.panelSetting);
        this.initPanelSettingLanguage(this.panelSetting);
    },

    initPanelSettingIP: function initPanelSettingIP(node) {
        this.panelIP = node.getChildByName("panel_ip");
        if (this.panelIP) {
            var inputMargin = 15;
            var inputFontSize = 28;
            var inputFontName = this.resourceRoot + "/fester_bold.ttf";

            var inputColor = cc.hexToColor("#FFFFFF");
            var inputColorPlaceholder = cc.hexToColor("#D1D1D1");

            var inputSize = this.panelIP.getContentSize();
            inputSize = cc.size(inputSize.width - inputMargin * 2, inputSize.height - 5);

            this.inputIP = cc.EditBox.create(inputSize, "Default/editbox_default.png");
            node.addChild(this.inputIP);

            this.inputIP.setMaxLength(100);
            this.inputIP.setFontName(inputFontName);
            this.inputIP.setFontSize(inputFontSize);
            this.inputIP.setFontColor(inputColor);
            this.inputIP.setPlaceholderFontName(inputFontName);
            this.inputIP.setPlaceholderFontSize(inputFontSize);
            this.inputIP.setPlaceholderFontColor(inputColorPlaceholder);
            this.inputIP.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
            this.inputIP.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
            this.inputIP.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
            this.inputIP.setAnchorPoint(cc.ANCHOR_MIDDLE_LEFT());
            this.inputIP.setPosition(cc.p(this.panelIP.x + inputMargin - this.panelIP.width * 0.5, this.panelIP.y));
            this.inputIP.setPlaceHolder("Enter ip address");
            this.inputIP.setDelegate(this);
        }
    },

    initPanelSettingRemote: function initPanelSettingRemote(node) {
        var _this4 = this;

        this.panelRemote = node.getChildByName("panel_remote");
        this.panelRemote.isChecked = false;
        this.panelRemote.setVisible(false);
        this.panelRemote.addTouchEventListener(function (sender, type) {
            if (_this4.applyPressedEffect(sender, type, 1, 1)) {
                _this4.panelRemote.isChecked = !_this4.panelRemote.isChecked;
                _this4.buttonRemote.loadTexture(_this4.resourceRoot + (_this4.panelRemote.isChecked ? "/switch_on.png" : "/switch_off.png"));
            }
        });

        this.buttonRemote = this.panelRemote.getChildByName("button_remote");
        this.buttonRemote.loadTexture(this.resourceRoot + "/switch_off.png");

        this.textRemote = this.panelRemote.getChildByName("text_remote");
    },

    initPanelSettingSocket: function initPanelSettingSocket(node) {
        var _this5 = this;

        this.panelSocket = node.getChildByName("panel_socket");
        this.panelSocket.textValue = this.panelSocket.getChildByName("text_value");
        this.panelSocket.textValue.setString("");

        this.panelSocket.items = [];

        var entries = [{ name: "ws", value: KingSocketType.WS }, { name: "raw", value: KingSocketType.TCP }];

        entries.forEach(function (entry) {
            var item = _this5.panelSocket.getChildByName(entry.name);
            if (item) {

                item.value = entry.value;
                item.text = item.getChildByName("text");
                item.check = item.getChildByName("check");
                item.addTouchEventListener(function (sender, type) {
                    if (_this5.applyPressedEffect(sender, type, 1, 0.9)) {
                        _this5.panelSocket.select(sender);
                    }
                });

                _this5.panelSocket.items.push(item);
            }
        });

        this.panelSocket.select = function (target) {

            if (typeof target === 'number') {
                target = _this5.panelSocket.items[target];
            }

            if (target) {
                _this5.panelSocket.value = target.value;
                _this5.panelSocket.items.forEach(function (item) {
                    item.check && item.check.setSelected(item === target);
                });
                _this5.panelSocket.textValue.setString(target.text.getString());
            }
        };

        this.panelSocket.select(0);
    },

    initPanelSettingLanguage: function initPanelSettingLanguage(node) {
        var _this6 = this;

        this.panelLang = node.getChildByName("panel_lang");
        this.panelLang.textValue = this.panelLang.getChildByName("text_value");
        this.panelLang.textValue.setString("");

        this.panelLang.items = [];
        var langs = Object.keys(Localize.LANG_TYPE);
        for (var i = 0; i < 10; i++) {
            var item = this.panelLang.getChildByName(cc.formatStr("item_%d", i + 1));
            if (item) {
                item.text = item.getChildByName("text");
                item.check = item.getChildByName("check");
                item.visible = i < langs.length;
                if (i < langs.length) {

                    item.index = i;
                    item.value = Localize.LANG_TYPE[langs[i]];
                    item.text.setString(langs[i]);
                    item.addTouchEventListener(function (sender, type) {
                        if (_this6.applyPressedEffect(sender, type, 1, 0.9)) {
                            _this6.panelLang.select(sender);
                        }
                    });

                    this.panelLang.items.push(item);
                }
            } else {
                break;
            }
        }

        this.panelLang.value = Localize.LANG_TYPE.EN;
        this.panelLang.select = function (target) {

            if (typeof target === 'number') {
                target = _this6.panelLang.items[target];
            }

            if (target) {
                _this6.panelLang.value = target.value;
                _this6.panelLang.items.forEach(function (item) {
                    item.check && item.check.setSelected(item === target);
                });
                _this6.panelLang.textValue.setString(target.text.getString());
            }

            var langCodes = {};
            langCodes[Localize.LANG_TYPE.VI] = "vi";
            langCodes[Localize.LANG_TYPE.KM] = "km";
            langCodes[Localize.LANG_TYPE.ZH] = "zh";
            langCodes[Localize.LANG_TYPE.ML] = "ml";
            langCodes[Localize.LANG_TYPE.TH] = "th";
            langCodes[Localize.LANG_TYPE.EN] = "en";
            langCodes[Localize.LANG_TYPE.MY] = "my";

            if (portalHelper._getLanguageStr === undefined) portalHelper._getLanguageStr = portalHelper.getLanguageStr;

            if (portalHelper._getLanguageType === undefined) portalHelper._getLanguageType = portalHelper.getLanguageType;

            portalHelper.getLanguageStr = function () {
                return langCodes[_this6.panelLang.value];
            };
            portalHelper.getLanguageType = function () {
                return _this6.panelLang.value;
            };
        };

        var langMap = {};
        langMap["vi"] = Localize.LANG_TYPE.VI;
        langMap["km"] = Localize.LANG_TYPE.KM;
        langMap["zh"] = Localize.LANG_TYPE.ZH;
        langMap["en"] = Localize.LANG_TYPE.EN;
        langMap["th"] = Localize.LANG_TYPE.TH;
        langMap["ml"] = Localize.LANG_TYPE.ML;
        langMap["my"] = Localize.LANG_TYPE.MY;

        this.panelLang.select(langMap[portalHelper.getLanguageStr()] || 5);
    },

    initTabs: function initTabs(node) {

        this.activeTab = 0;
        this.tabs = this.tabs || [];

        this.tabs.push({
            index: this.TABS.LOCAL,
            panel: this.panelLocal,
            button: this.buttonLocal,
            buttonText: this.buttonLocalText
        });

        this.tabs.push({
            index: this.TABS.ONLINE,
            panel: this.panelOnline,
            button: this.buttonOnline,
            buttonText: this.buttonOnlineText
        });

        this.selectTab(this.TABS.LOCAL, true);
    },

    initButtons: function initButtons(node) {
        var _this7 = this;

        this.buttonBack = node.getChildByName("button_back");
        this.buttonBack.setVisible(!portalManager.isTemplate());
        this.buttonBack.addTouchEventListener(function (sender, type) {
            if (_this7.applyPressedEffect(sender, type, 1, 1)) {
                portalHelper.returnLobbyScene(portalHelper.GAME_LOBBY_LOCATION.LIST_PORTAL);
            }
        });
    },

    hide: function hide() {
        if (!this.isBusy) {
            this.isBusy = true;
            portalHelper.returnLobbyScene();
        }
    },

    toggleSetting: function toggleSetting() {
        if (this.panelSetting.isVisible()) this.hideSetting();else this.showSetting();
    },

    showSetting: function showSetting() {
        var _this8 = this;

        if (this.panelSetting.isBusy) return;

        this.panelSetting.isBusy = true;

        var time = 0.4;
        var moveTo = new cc.EaseSineOut(cc.moveTo(time * 0.5, this.panelSetting.basePosition.x + 10, this.panelSetting.basePosition.y));
        var moveBack = new cc.EaseSineOut(cc.moveTo(time * 0.5, this.panelSetting.basePosition.x, this.panelSetting.basePosition.y));

        this.panelSetting.setPositionX(-this.panelSetting.basePosition.x - this.panelSetting.width);
        this.panelSetting.runAction(cc.sequence(cc.show(), moveTo, moveBack, cc.callFunc(function () {
            _this8.panelSetting.isBusy = false;
        })));

        this.buttonSetting.runAction(cc.rotateTo(time * 0.5, 60));
    },

    hideSetting: function hideSetting() {
        var _this9 = this;

        if (this.panelSetting.isBusy) return;

        this.panelSetting.isBusy = true;

        var time = 0.4;
        var moveTo = new cc.EaseSineOut(cc.moveTo(time * 0.5, this.panelSetting.basePosition.x + 10, this.panelSetting.basePosition.y));
        var moveBack = new cc.EaseSineOut(cc.moveTo(time * 0.5, -this.panelSetting.basePosition.x - this.panelSetting.width, this.panelSetting.basePosition.y));

        this.panelSetting.runAction(cc.sequence(moveTo, moveBack, cc.hide(), cc.callFunc(function () {
            _this9.panelSetting.isBusy = false;
        })));

        this.buttonSetting.runAction(new cc.EaseSineOut(cc.rotateTo(time, 0)));
    },

    selectTab: function selectTab(index) {
        var _this10 = this;

        var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (!force && index === this.activeTab) return;

        this.activeTab = index;
        this.tabs.forEach(function (tab) {
            tab.panel.setVisible(tab.index === _this10.activeTab);
            tab.button.setBackGroundColor(tab.index === _this10.activeTab ? _this10.TAB_COLOR_SELECTED : _this10.TAB_COLOR_NORMAL);
            tab.buttonText.setTextColor(tab.index === _this10.activeTab ? cc.hexToColor("#1A1A1A") : cc.color.WHITE);
        });

        this.panelRemote.setVisible(this.activeTab === this.TABS.LOCAL);
    },

    loadAccount: function loadAccount(list, accounts) {
        var _this11 = this;

        var local = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (!list) return;

        list.removeAllItems();

        var itemRow = null;
        var itemPerRow = 0;

        var itemWidth = 0;
        var itemMarginX = 10;
        var itemMarginY = 10;

        accounts.forEach(function (user, index) {

            var item = _this11.createAccountItem(user, local);
            item.isLocal = local;

            item.setTouchEnabled(true);
            item.addTouchEventListener(function (sender, type) {
                if (_this11.applyPressedEffect(sender, type, 1, 0.9)) {
                    var options = _this11.getOptions();

                    if (sender.isLocal) {
                        KingBeta.setRemote(_this11.panelRemote.isChecked);
                        _this11.onBetaSelected && _this11.onBetaSelected(sender.data, options);
                    } else {
                        portalHelper.setUserId(sender.data.userId);
                        portalHelper.setUserName(sender.data.userName);
                        portalHelper.setUserPass(sender.data.userPass);
                        _this11.loginOnlineNormal(portalHelper.getUserName(), portalHelper.getUserPassHash(), function () {
                            _this11.onOnlineSelected && _this11.onOnlineSelected(null, options);
                        });
                    }
                }
            });

            if (itemPerRow <= 0) {
                itemWidth = item.width + itemMarginX * 2;
                itemPerRow = Math.floor(list.width / itemWidth);
                itemWidth = (list.width - itemMarginX * 2) / itemPerRow;
            }

            var itemIndex = index % itemPerRow;
            if (itemIndex === 0) {

                itemRow = new ccui.Widget();
                itemRow.setContentSize(cc.size(list.width, item.height + itemMarginY * 2));
                itemRow.setTouchEnabled(false);

                list.pushBackCustomItem(itemRow);
            }

            if (itemRow) {
                item.setAnchorPoint(cc.ANCHOR_CENTER());
                item.setPosition(cc.p(itemMarginX + (0.5 + itemIndex) * itemWidth, item.height * 0.5));
                itemRow.addChild(item);
            }
        });

        var botItem = new ccui.Widget();
        botItem.setContentSize(cc.size(list.width, itemMarginY * 2));
        list.pushBackCustomItem(botItem);
    },

    createAccountItem: function createAccountItem(user) {
        var local = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var jsonFile = this.resourceRoot + "/portal_account.json";
        var root = ccs.load(jsonFile).node;

        var item = root.getChildByName("item");
        item.removeFromParent();
        item.data = user;

        var textId = item.getChildByName("text_id");
        textId.setString(user.userId);

        var textName = item.getChildByName("text_name");
        textName.setString(user.userName);
        textName.setTextColor(local ? this.ACC_NAME_COLOR_LOCAL : this.ACC_NAME_COLOR_ONLINE);

        NodeUtils.fixTextLayout(item);

        return item;
    },

    loginOnlineNormal: function loginOnlineNormal(userName, userPass) {
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        WebService.login(userName, userPass, function (response) {
            var result = response.Result || 0;
            if (result === 1) {
                if (response.Data) {
                    portalHelper.setUserId(response.Data.userid || 0);
                    portalHelper.setUserToken(response.Data.token || "");
                    callback && callback();
                } else {
                    callback && callback(new Error("Error while logging in normal mode"));
                }
            } else {
                callback && callback(new Error("Error while logging in normal mode"));
            }
        });
    },

    loginOnlineInstant: function loginOnlineInstant() {
        var _this12 = this;

        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        WebService.registerInstant(function (response) {
            var result = response.Result || 0;
            if (result === 1) {
                if (response.Data) {
                    var userName = response.Data.username || "";
                    var userPass = response.Data.pass || "";
                    _this12.loginOnlineNormal(userName, userPass, callback);
                } else {
                    callback && callback(new Error("Error while logging in instant mode"));
                }
            } else {
                callback && callback(new Error("Error while logging in instant mode"));
            }
        });
    },

    applyPressedEffect: function applyPressedEffect(button, type) {
        var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;
        var deltaScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.8;

        if (!button) return false;

        var scaleX = scale.x || scale;
        var scaleY = scale.y || scale;

        if (type === ccui.Widget.TOUCH_BEGAN) {
            button.setScale(scaleX, scaleY);
            button.runAction(cc.scaleTo(0.1, scaleX * deltaScale, scaleY * deltaScale));
            return false;
        } else if (type === ccui.Widget.TOUCH_MOVED) {
            return false;
        } else if (type === ccui.Widget.TOUCH_CANCELED) {
            button.setScale(scaleX * deltaScale, scaleY * deltaScale);
            button.runAction(cc.EaseBackOut.create(cc.scaleTo(0.3, scaleX, scaleY)));
            return false;
        }

        button.setScale(scaleX * deltaScale, scaleY * deltaScale);
        button.runAction(cc.EaseBackOut.create(cc.scaleTo(0.3, scaleX, scaleY)));

        return true;
    },

    editBoxReturn: function editBoxReturn(sender) {},

    getOptions: function getOptions() {
        var options = {
            socketType: this.panelSocket.value
        };

        if (this.inputIP) {
            var ip = this.inputIP.getString();
            if (ip.indexOf(":") > -1) {
                var parts = ip.split(":");
                var host = parts[0];
                var port = parseInt(parts[1]);
                options.host = host;
                options.port = port;
            }
        }

        return options;
    }
});

var KingLoginScene = cc.Scene.extend({
    ctor: function ctor() {
        var onBetaSelected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var onOnlineSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this._super();
        this.addChild(new KingLoginLayer(onBetaSelected, onOnlineSelected));
    }
});
