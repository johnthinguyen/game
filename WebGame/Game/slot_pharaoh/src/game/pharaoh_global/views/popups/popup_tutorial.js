/*global define */

Module.define(function (require) {
    "use strict";
    const LOGTAG = "[SlotPharaoh::PopupTutorial]";

    const PopupTutorial = cc.Class.extend({
        ctor: function (options) {
            let parent = options.node || cc.director.getRunningScene();
            this.mainLayer = ccs._load(Resource.ASSETS.CCS_Tutorial);
            this.mainLayer.setContentSize(cc.visibleRect);
            ccui.helper.doLayout(this.mainLayer);
            parent.addChild(this.mainLayer, ViewStyle.LAYER_ORDER.POPUP);

            this.currentPageIndex = 0;
            this.pageCount = 6;
            this.mainLayer.setVisible(false);
            this.mainLayer.setOpacity(0);
            this.isClosed = true;
            this.isBusy = false;

            this.pages = [];

            this.initComponent(this.mainLayer);
        },

        initComponent: function (mainLayer) {
            this.cover = mainLayer.getChildByName("cover");
            this.cover.addTouchEventListener(this.onTouchBackground.bind(this));

            this.mainPanel = mainLayer.getChildByName("bg");
            this.mainPanel.setScale(ImageUtils.getFitScale());

            this.btnClose = this.mainPanel.getChildByName("button_close");
            this.btnClose.addTouchEventListener(this.onTouchClose.bind(this));

            this.btnPrev = this.mainPanel.getChildByName("button_left");
            this.btnPrev.addTouchEventListener(this.toPrevPage.bind(this));
            this.btnPrev.icon = this.btnPrev.getChildByName("icon");
            
            this.btnNext = this.mainPanel.getChildByName("button_right");
            this.btnNext.addTouchEventListener(this.toNextPage.bind(this));
            this.btnNext.icon = this.btnNext.getChildByName("icon");

            let pnlPagesIndex = this.mainPanel.getChildByName("button_pages");
            this.pagesIndex = [];
            for (let i = 0; i < this.pageCount; i++) {
                let pageIndex = pnlPagesIndex.getChildByName("button_page_" + i);
                this.pagesIndex.push(pageIndex);
            }
            
            this.pageView = this.mainPanel.getChildByName("page_view");
            this.pageView.addEventListener(this.pageViewEvent.bind(this));
            this.initPage0();
            this.initPage1();
            this.initPage2();
            this.initPage3();
            this.initPage4();
            this.initPage5();

            this.setPage(this.currentPageIndex);
        },

        initPage0: function () {            
            let page = this.pageView.getChildByName("page_0");
            
            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_GOLDEN_FRAME);

            let text0 = page.getChildByName("text_0");
            ImageUtils.localizeSpriteText(text0, Resource.SPRITES.TUTORIAL_PAGE_1_TEXT_1);

            this.pages.push(page);
            page.setVisible(false);
        },

        initPage1: function (){
            let page = this.pageView.getChildByName("page_1");

            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_WILD_AND_SCATTER);

            let text0 = page.getChildByName("text_0");
            ImageUtils.localizeSpriteText(text0, Resource.SPRITES.TUTORIAL_PAGE_2_TEXT_1);

            let text1 = page.getChildByName("text_1");
            ImageUtils.localizeSpriteText(text1, Resource.SPRITES.TUTORIAL_PAGE_2_TEXT_2);


            this.pages.push(page);
            page.setVisible(false);
        },

        initPage2: function (){
            let page = this.pageView.getChildByName("page_2");

            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_TUTORIAL_FREE_GAME);
            
            let text0 = page.getChildByName("text_0");
            ImageUtils.localizeSpriteText(text0, Resource.SPRITES.TUTORIAL_PAGE_3_TEXT_1);

            this.pages.push(page);
            page.setVisible(false);
        },

        initPage3: function (){
            let page = this.pageView.getChildByName("page_3");

            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_PAY_TABLE);

            this.pages.push(page);
            page.setVisible(false);
        },

        initPage4: function (){
            let page = this.pageView.getChildByName("page_4");

            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_PAY_TABLE);

            this.pages.push(page);
            page.setVisible(false);
        },

        initPage5: function(){
            let page = this.pageView.getChildByName("page_5");

            let title = page.getChildByName("text_title");
            ImageUtils.localizeSpriteText(title, Resource.SPRITES.TEXT_GAME_RULE);

            let text0 = page.getChildByName("text_0");
            ImageUtils.localizeSpriteText(text0, Resource.SPRITES.TUTORIAL_PAGE_6_TEXT_1);

            this.pages.push(page);
            page.setVisible(false);
        },

        // Show & Hide

        show: function () {
            if (!this.isClosed || this.isBusy) {
                return;
            }
            this.setPage(0);

            this.isBusy = true;
            this.mainPanel.setPosition(cc.p(cc.visibleRect.width * 0.5, cc.visibleRect.height * 1.5));
            this.mainLayer.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.1),
                cc.callFunc(() => {
                    this.mainPanel.runAction(cc.sequence(
                        cc.moveTo(0.3, cc.p(cc.visibleRect.width * 0.5, cc.visibleRect.height * 0.5)).easing(cc.easeBackOut()),
                        cc.callFunc(() => {
                            this.isBusy = false;
                            this.isClosed = false;
                        })
                    ));
                })
            ));
        },

        close: function() {
            if (this.isClosed || this.isBusy) {
                return;
            }

            this.isBusy = true;
            this.mainPanel.setPosition(cc.p(cc.visibleRect.width * 0.5, cc.visibleRect.height * 0.5));
            this.mainPanel.runAction(cc.sequence(
                cc.moveTo(0.3, cc.p(cc.visibleRect.width * 0.5, cc.visibleRect.height * 1.5)).easing(cc.easeBackIn()),
                cc.callFunc(() => {
                    this.mainLayer.runAction(cc.sequence(
                        cc.fadeOut(0.1),
                        cc.hide(),
                        cc.callFunc(() => {
                            this.isClosed = true;
                            this.isBusy = false;
                        })
                    ));
                })
            ));
        },

        pageViewEvent: function (sender, type) {
            if (type === ccui.PageView.EVENT_TURNING) {
                this.currentPageIndex = sender.getCurrentPageIndex();
                this.hideOtherPages(this.currentPageIndex);
            }
        },

        hideOtherPages: function(ignorePage){
            for(let idx = 0;idx < this.pages.length;idx++){
                if(ignorePage === idx){
                    continue;
                }
                this.pages[idx].setVisible(false);
            }
        },

        // Page management
        toNextPage: function (sender, type) {
            if (this.currentPageIndex == this.pageCount - 1) {
                return;
            }
            if (ButtonUtils.touchBounceEffect(sender, type, 1.0, 0.9)) {
                ButtonUtils.playClickSound();

                this.currentPageIndex++;
                this.toPage(this.currentPageIndex);
            }
        },

        toPrevPage: function (sender, type) {
            if (this.currentPageIndex == 0) {
                return;
            }
            if (ButtonUtils.touchBounceEffect(sender, type, 1.0, 0.9)) {
                ButtonUtils.playClickSound();

                this.currentPageIndex--;
                this.toPage(this.currentPageIndex);
            }
        },

        toPage: function (index) {
            if (index > -1 && index < this.pageCount) {
                this.currentPageIndex = index;
                this.pages[index].setVisible(true);
                this.updateButtonDisplay();
                this.pageView.scrollToPage(index);
            }
        },

        setPage: function (index) {
            if (index > -1 && index < this.pageCount) {
                this.currentPageIndex = index;
                this.updateButtonDisplay();
                this.pages[index].setVisible(true);
                this.pageView.setCurrentPageIndex(index);
            }
        },

        updateButtonDisplay: function () {
            if (this.currentPageIndex == 0) {
                this.btnPrev.icon.setVisible(false);
            } else {
                this.btnPrev.icon.setVisible(true);
            }

            if (this.currentPageIndex == this.pageCount - 1) {
                this.btnNext.icon.setVisible(false);
            } else {
                this.btnNext.icon.setVisible(true);
            }

            //cc.log("this.pagesIndex[i]: %j",this.pagesIndex);
            for (let i = 0; i < this.pageCount; i++) {
                let pageIndex = this.pagesIndex[i];
                let icon = pageIndex.getChildByName("Sprite");
                icon.setSpriteFrame(Resource.SPRITES.TUTORIAL_PAGE_INDEX);
            }

            let pageIndex = this.pagesIndex[0];
            let icon = pageIndex.getChildByName("Sprite");
            let contentSize = icon.getContentSize();
            pageIndex = this.pagesIndex[this.currentPageIndex];
            icon = pageIndex.getChildByName("Sprite");
            icon.setSpriteFrame(Resource.SPRITES.TUTORIAL_PAGE_HIGHLIGHT);
            icon.setAnchorPoint(cc.p(0.5,0.5));
            icon.setNormalizedPosition(cc.p(0.5,0.5));
        },

        // UI Callbacks

        onTouchClose: function (button, type) {
            if (ButtonUtils.touchBounceEffect(button, type, 1.0, 0.9)) {
                ButtonUtils.playClickSound();
                this.close();
            }
        },

        onTouchBackground: function (_, type) {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.close();
            }
        }
    });

    window.PopupTutorial = PopupTutorial;
    return PopupTutorial;
});