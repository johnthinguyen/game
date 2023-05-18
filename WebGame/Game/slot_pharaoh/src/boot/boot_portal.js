"use strict";

cc.log("[BOOTSTRAP] Portal started!");

var hasNotifyNewVersion = hasNotifyNewVersion || false;

(function () {

            if (hasNotifyNewVersion === true) {
                        cc.log("[BOOTSTRAP] Popup should update has presented before");
                        return;
            }

            var LANG_CAM = 1;
            var LANG_CHINA = 2;

            var isChannelWeb = PortalHelper.getInstance().getChannelId() === 44;
            var isOldVersion = PortalHelper.getInstance().getVersionGame() === '1.0';

            if (isChannelWeb && isOldVersion) {

                        // show popup should update
                        setTimeout(function () {

                                    hasNotifyNewVersion = true;

                                    var langType = PortalHelper.getInstance().getLanguageType();

                                    var localizeText = function localizeText(text) {
                                                var isBold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                                                if (!text) return;

                                                if (langType === LANG_CAM || langType === LANG_CHINA) {

                                                            var fontName = "";
                                                            if (langType === LANG_CAM) fontName = isBold ? "hoYeah/Fonts/AngkorRegular.ttf" : "hoYeah/Fonts/KhmerOSsys.ttf";else fontName = isBold ? "localize/font/Portal_Zh_Bold.ttf" : "localize/font/Portal_Zh_Normal.ttf";

                                                            var fontSizeScale = 1;

                                                            var outlineSize = text.getOutlineSize();
                                                            var outlineColor = text.getEffectColor();

                                                            var shadowOffset = text.getShadowOffset();
                                                            var shadowColor = text.getShadowColor();

                                                            text.setFontName(fontName, true);
                                                            text.setFontSize(Math.floor(text.getFontSize() * fontSizeScale));

                                                            if (text.forceDoLayout) text.forceDoLayout();

                                                            if (outlineSize > 0) text.enableOutline(outlineColor, outlineSize);

                                                            if (shadowOffset.x !== 0 || shadowOffset.y !== 0) text.enableShadow(shadowColor, shadowOffset);
                                                }
                                    };

                                    var txtOK = "OK";
                                    var txtCancel = "Cancel";
                                    var txtTitle = "NOTIFICATION";
                                    var txtContent = "Let's update the new version to experience the better game";

                                    switch (langType) {
                                                case LANG_CAM:
                                                            {
                                                                        txtOK = "បញ្ជាក់";
                                                                        txtCancel = "បដិសេធ";
                                                                        txtTitle = "ជូនដំណឹង";
                                                                        txtContent = "ចូរធ្វើការតំឡើងកំណែថ្មីដើម្បីមានការបទពិសោធន៍ល្អជាងណា។";
                                                                        break;
                                                            }
                                                case LANG_CHINA:
                                                            {
                                                                        txtOK = "好的";
                                                                        txtCancel = "取消";
                                                                        txtTitle = "报告";
                                                                        txtContent = "让我们更新新版本以体验更好的游戏";
                                                                        break;
                                                            }
                                                default:
                                                            {
                                                                        break;
                                                            }
                                    }

                                    var cover = new cc.LayerColor(cc.color.BLACK);
                                    cover.setOpacity(0);
                                    var touchListener = cc.EventListener.create({
                                                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                                                swallowTouches: true,
                                                onTouchBegan: function onTouchBegan(sender, event) {
                                                            return true;
                                                },
                                                onTouchEnded: function onTouchEnded(sender, event) {
                                                            return true;
                                                }
                                    });

                                    touchListener.setEnabled(true);
                                    cc.eventManager.addListener(touchListener, cover);

                                    var popup = new cc.Node();
                                    popup.setAnchorPoint(cc.p(0.5, 0.5));

                                    popup.background = new cc.Sprite("hoYeah/Base/frameVipMain.png");
                                    popup.background.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.background.setContentSize(cc.size(900, 600));
                                    popup.background.setPosition(cc.p(0, 0));
                                    popup.addChild(popup.background);

                                    popup.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height + popup.background.getContentSize().height));

                                    popup.txtTitle = new cc.LabelBMFont(txtTitle, "hoYeah/Fonts/hoYeahTitle.fnt");
                                    popup.txtTitle.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.txtTitle.setPosition(cc.p(popup.background.getContentSize().width * 0.5, popup.background.getContentSize().height * 0.94));
                                    popup.background.addChild(popup.txtTitle);

                                    if (langType === LANG_CAM || langType === LANG_CHINA) {

                                                var frameName = cc.formatStr("%s_%s_%s.png", PortalHelper.getInstance().getLanguageStr(), "hyt", "key_popup_promt_title"); //portalHelper.getLanguageStr()
                                                var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
                                                if (!frame) {
                                                            return;
                                                }

                                                var title = new cc.Sprite(frame);
                                                title.setName("key_popup_promt_title");

                                                title.setAnchorPoint(popup.txtTitle.getAnchorPoint());
                                                title.setPosition(cc.p(popup.txtTitle.getPosition().x, popup.txtTitle.getPosition().y - 5));

                                                popup.txtTitle.getParent().addChild(title, popup.txtTitle.getLocalZOrder());
                                                popup.txtTitle.setVisible(false);
                                    }

                                    popup.pnlContent = new cc.Sprite("hoYeah/Base/framePopupContent.png");
                                    popup.background.addChild(popup.pnlContent);

                                    popup.pnlContent.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.pnlContent.setContentSize(cc.size(800, 400));
                                    popup.pnlContent.setPosition(cc.p(popup.background.getContentSize().width * 0.5, popup.background.getContentSize().height * 0.5));

                                    popup.txtContent = ccui.Text.create(txtContent, "hoYeah/Fonts/OpenSans-Regular.ttf", 40);
                                    popup.pnlContent.addChild(popup.txtContent);

                                    popup.txtContent.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.txtContent.setPosition(cc.p(popup.pnlContent.getContentSize().width * 0.5, popup.pnlContent.getContentSize().height * 0.5));
                                    popup.txtContent.boundingWidth = popup.pnlContent.getContentSize().width - 100;
                                    popup.txtContent.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                                    popup.txtContent.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);

                                    localizeText(popup.txtContent);

                                    popup.btnAccept = ccui.Button.create("hoYeah/Base/btnMGreen.png");
                                    popup.background.addChild(popup.btnAccept);

                                    popup.btnAccept.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.btnAccept.setPosition(cc.p(popup.background.getContentSize().width * 0.7, popup.background.getContentSize().height * 0.085));
                                    popup.btnAccept.addTouchEventListener(function (btn, type) {
                                                if (type === ccui.Widget.TOUCH_ENDED) {
                                                            cc.sys.openURL("http://static1.live777.com/download/Live777-v1.1.apk");
                                                }
                                    });

                                    popup.txtAccept = ccui.Text.create(txtOK, "hoYeah/Fonts/OpenSans-Regular.ttf", 30);
                                    popup.btnAccept.addChild(popup.txtAccept);

                                    popup.txtAccept.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.txtAccept.setPosition(cc.p(popup.btnAccept.getContentSize().width * 0.5, popup.btnAccept.getContentSize().height * 0.5));

                                    localizeText(popup.txtAccept);

                                    popup.btnCancel = ccui.Button.create("hoYeah/Base/btnMRed.png");
                                    popup.background.addChild(popup.btnCancel);

                                    popup.btnCancel.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.btnCancel.setPosition(cc.p(popup.background.getContentSize().width * 0.3, popup.background.getContentSize().height * 0.085));
                                    popup.btnCancel.addTouchEventListener(function (btn, type) {
                                                if (type === ccui.Widget.TOUCH_ENDED) {
                                                            popup.runAction(cc.sequence(cc.EaseBackIn.create(cc.moveTo(0.5, cc.p(cc.winSize.width / 2, cc.winSize.height))), cc.removeSelf()));
                                                            cover.runAction(cc.sequence(cc.fadeOut(0.2), cc.removeSelf()));
                                                }
                                    });

                                    popup.txtCancel = ccui.Text.create(txtCancel, "hoYeah/Fonts/OpenSans-Regular.ttf", 30);
                                    popup.btnCancel.addChild(popup.txtCancel);

                                    popup.txtCancel.setAnchorPoint(cc.p(0.5, 0.5));
                                    popup.txtCancel.setPosition(cc.p(popup.btnCancel.getContentSize().width * 0.5, popup.btnCancel.getContentSize().height * 0.5));

                                    localizeText(popup.txtCancel);

                                    popup.setScale(0.7);

                                    var currentScene = cc.Director.getInstance().getRunningScene();
                                    if (currentScene) {

                                                currentScene.addChild(cover);
                                                currentScene.addChild(popup);

                                                cover.runAction(cc.fadeTo(0.2, 100));
                                                popup.runAction(cc.EaseBackOut.create(cc.moveTo(0.5, cc.p(cc.winSize.width / 2, cc.winSize.height / 2))));
                                    }
                        }, 500);
            }
})();