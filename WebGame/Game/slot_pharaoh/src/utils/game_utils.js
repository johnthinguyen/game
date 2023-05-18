"use strict";

/**
 * Created by TungTT on 2/1/2019.
 */

var GameUtils = GameUtils || {};
GameUtils.COLOR_TXT_VIP_NAME = [new cc.Color(255, 157, 0, 255), new cc.Color(213, 217, 217, 255), new cc.Color(255, 248, 0, 255), new cc.Color(255, 0, 108, 255), new cc.Color(0, 255, 93, 255), new cc.Color(0, 255, 254, 255), new cc.Color(187, 165, 255, 255), new cc.Color(86, 149, 255, 255), new cc.Color(255, 120, 219, 255), new cc.Color(254, 75, 109, 255), new cc.Color(251, 226, 225, 255), new cc.Color(0, 223, 255, 255), new cc.Color(157, 255, 0, 255), new cc.Color(141, 95, 251, 255), new cc.Color(253, 229, 79, 255), new cc.Color(255, 255, 255, 255)];
GameUtils.BMFont = {};

var MAX_WIN_CHIPS = 8;

// GameUtils.prototype.showBackgroundBossEffect = function(parent, zOrder) {
//     var size = cc.winSize;//::getInstance()->getWinSize();
//     var bg =  cc.LayerColor.create(cc.Color4B(0, 0, 0, 0), size.width + size.width, size.height + size.height);
//     bg.setName("BG_CERBERUS");
//     parent.addChild(bg, zOrder);
//
//     var show = cocos2d::FadeTo::create(2.0f, 130);
//     //auto delay = cocos2d::DelayTime::create(60);
//     var hide = cocos2d::FadeTo::create(2.0f, 70);
//     var sequen = Sequence::create(show, /*delay, */hide, NULL);
//     auto repeat = Repeat::create(sequen, 35);
//     bg->runAction(Sequence::createWithTwoActions(repeat, cocos2d::RemoveSelf::create()));// sequen);
//
//     auto par1 = ParticleSystemQuad::create("Games/fishKing/particle/par_cover_fireflower_dark.plist");
//     par1->setPosition(Vec2(size.width / 2, 0));
//
//     auto par2 = ParticleSystemQuad::create("Games/fishKing/particle/par_cover_fireflower_light.plist");
//     par2->setPosition(Vec2(size.width / 2, 0));
//
//     bg->addChild(par1, 5);
//     bg->addChild(par2, 5);
// }
// void GameUtils::hideBackgroundBossEffect(cocos2d::Node* parent) {
//     if (parent) {
//         auto bg = parent->getChildByName("BG_CERBERUS");
//         if (bg) {
//             bg->stopAllActions();
//             auto fadeOut = FadeOut::create(0.6f);
//             auto re = RemoveSelf::create();
//             bg->runAction(Sequence::createWithTwoActions(fadeOut, re));
//         }
//     }
// }
// void GameUtils::makeActionCoral(Node* node, float skewXStart, float skewXEnd, float skewY) {
//     if (node == NULL) return;
//     float delay = RandomHelper::random_int(150, 300) / 60.0f;
//     auto rot1 = SkewTo::create(delay, skewXStart, skewY);
//     auto rot2 = SkewTo::create(delay, skewXEnd, skewY);
//     auto sequen = Sequence::createWithTwoActions(rot1, rot2);
//     auto repeat = RepeatForever::create(sequen);
//     node->runAction(repeat);
// }
// void GameUtils::showToast(cocos2d::Node* parent, const std::string &str) {
//     if (parent == nullptr)
//         return;
//
//     if (parent->getChildByName("TOAST") != nullptr) {
//         return;
//     }
//     auto node = cocos2d::Node::create();
//     node->setName("TOAST");
//     node->setCascadeOpacityEnabled(true);
//     auto txt = cocos2d::ui::Text::create(str, "studio/Fonts/tahoma.ttf", 20);
//     txt->setTextColor(cocos2d::Color4B::WHITE);
//     txt->setName("TEXT");
//     txt->setPosition(cocos2d::Vec2::ZERO);
//     auto frame = cocos2d::ui::Scale9Sprite::create("hoYeah/Base/bgMsg.png");
//     frame->setName("BG");
//     frame->setPosition(cocos2d::Vec2::ZERO);
//
//     txt->setText(str);
//     frame->setContentSize(cocos2d::Size(txt->getContentSize().width + 20, txt->getContentSize().height + 20));
//
//     cocos2d::Vec2 pos = cocos2d::Director::getInstance()->getWinSize() / 2;
//     pos.y = 200;
//     node->setScale(0.0f);
//     node->setPosition(pos);
//     node->addChild(frame, 0);
//     node->addChild(txt, 1);
//     auto scaleIn = cocos2d::EaseBackOut::create(cocos2d::ScaleTo::create(0.2f, 1.0f));
//     auto delay = cocos2d::DelayTime::create(2.0f);
//     auto moveOut = cocos2d::MoveBy::create(0.3f, cocos2d::Vec2(0, 100));
//     auto fadeOut = cocos2d::FadeOut::create(0.3f);
//     auto re = cocos2d::RemoveSelf::create();
//     auto spawnOut = cocos2d::Spawn::createWithTwoActions(moveOut, fadeOut);
//
//     node->runAction(cocos2d::Sequence::create(scaleIn, delay, spawnOut, re, NULL));
//     parent->addChild(node, 100);
// }
// void GameUtils::showHint(
//     cocos2d::Node* parent,
// const Vec2 &pos,
// const std::string &nodeName,
// const std::string &str,
//     float time	) {
//     if (parent->getChildByName(nodeName) != NULL)
//         return;
//     auto node = Node::create();
//     auto txt = Text::create(str, "studio/Fonts/tahoma.ttf", 20);
//     txt->setTextColor(Color4B::WHITE);
//     txt->setName("TEXT");
//     txt->setPosition(Vec2::ZERO);
//     auto bg = cocos2d::ui::Scale9Sprite::create("hoYeah/Base/bgMsg.png");
//     bg->setName("BG");
//     bg->setPosition(Vec2::ZERO);
//     auto arrow = DrawNode::create();
//     arrow->drawTriangle(Vec2(-10, 1), Vec2(10, 1), Vec2(0, -10), Color4F(0, 0, 0, 0.75f));
//     arrow->setName("ARROW");
//     arrow->setPosition(Vec2::ZERO);
//     node->addChild(bg, 0);
//     node->addChild(txt, 1);
//     node->addChild(arrow, 1);
//     node->setVisible(false);
//
//     txt->setText(str);
//     bg->setContentSize(Size(txt->getContentSize().width + 20, txt->getContentSize().height + 20));
//     arrow->setPositionY(-bg->getContentSize().height / 2);
//
//     node->setScale(0.0f);
//     auto scale = EaseBackOut::create(ScaleTo::create(0.1f, 1.0f));
//     auto delay = DelayTime::create(time);
//     auto call = RemoveSelf::create();
//     auto scaleOut = EaseBackIn::create(ScaleTo::create(0.2f, 0.0f));
//     auto sequen = Sequence::create(scale, delay, scaleOut, call, NULL);
//     node->runAction(sequen);
//     node->setVisible(true);
//     node->setPosition(pos);
//     node->setName(nodeName);
//     parent->addChild(node, 100);
// }
// void GameUtils::showBossDragonEffect(cocos2d::Node* parent, int zOrder) {
//     if (parent->getChildByName("LB_B_DRA") != NULL) {
//         return;
//     }
//     auto mainNode = Node::create();
//     mainNode->setName("LB_B_DRA");
//     mainNode->setCascadeOpacityEnabled(true);
//     auto winSize = Director::getInstance()->getWinSize();
//     {// from left to mid right
//         auto nodeTxt = Node::create();
//         nodeTxt->setCascadeOpacityEnabled(true);
//         auto cover = Sprite::create("studio/Bonus/Effects/drCoverText.png");
//         cover->setName("sp");
//         cover->setFlippedX(true);
//         cover->setPosition(-35, -10);
//         auto txt = Sprite::create("studio/Bonus/Effects/drTxtDragon.png");
//         txt->setName("txt");
//         txt->setOpacity(0);
//         nodeTxt->addChild(cover, 0);
//         nodeTxt->addChild(txt, 1);
//         nodeTxt->setPosition(Vec2(-cover->getContentSize().width, winSize.height * 0.35f));
//         mainNode->addChild(nodeTxt, 10);
//         auto move = EaseBackIn::create(MoveTo::create(1.0f, Vec2(winSize.width * 0.62f, winSize.height * 0.35f)));
//         auto call = CallFunc::create([&, txt, cover]() {
//         txt->setScale(4); txt->setOpacity(0);
//         auto scale = ScaleTo::create(0.45f, 1.0f);
//         auto fadeIn = FadeIn::create(0.45f);
//         txt->runAction(Spawn::createWithTwoActions(scale, fadeIn));
//
//         auto moveBitLeft = EaseBackOut::create(MoveBy::create(1.0f, Vec2(-10, 0)));
//         auto moveBitRight = EaseBackIn::create(MoveBy::create(1.0f, Vec2(10, 0)));
//         auto repeat = RepeatForever::create(Sequence::createWithTwoActions(moveBitLeft, moveBitRight));
//         cover->runAction(repeat);
//     });
//         nodeTxt->runAction(Sequence::createWithTwoActions(move, call));
//     }
//     {// from right to mid left
//         auto nodeTxt = Node::create();
//         nodeTxt->setCascadeOpacityEnabled(true);
//         auto cover = Sprite::create("studio/Bonus/Effects/drCoverText.png");
//         cover->setName("sp");
//         cover->setPosition(5, -10);
//         auto txt = Sprite::create("studio/Bonus/Effects/drTxtGolden.png");
//         txt->setName("txt");
//         txt->setOpacity(0);
//         nodeTxt->addChild(cover, 0);
//         nodeTxt->addChild(txt, 1);
//         nodeTxt->setPosition(Vec2(winSize.width + cover->getContentSize().width, winSize.height * 0.45f));
//         mainNode->addChild(nodeTxt, 10);
//         auto move = EaseBackIn::create(MoveTo::create(1.0f, Vec2(winSize.width * 0.38f, winSize.height * 0.45f)));
//         auto call = CallFunc::create([&, txt, cover]() {
//         txt->setScale(4); txt->setOpacity(0);
//         auto scale = ScaleTo::create(0.45f, 1.0f);
//         auto fadeIn = FadeIn::create(0.45f);
//         txt->runAction(Spawn::createWithTwoActions(scale, fadeIn));
//
//         auto moveBitLeft = EaseBackOut::create(MoveBy::create(1.0f, Vec2(10, 0)));
//         auto moveBitRight = EaseBackIn::create(MoveBy::create(1.0f, Vec2(-10, 0)));
//         auto repeat = RepeatForever::create(Sequence::createWithTwoActions(moveBitLeft, moveBitRight));
//         cover->runAction(repeat);
//     });
//         nodeTxt->runAction(Sequence::create(DelayTime::create(0.2f), move, call, NULL));
//     }
//     auto fadeIn = FadeIn::create(0.4f);
//     auto delay = DelayTime::create(1.2f);
//     auto sequen = Sequence::createWithTwoActions(delay, fadeIn);
//     {// make light & dragon icon
//         auto light = Sprite::create("studio/Bonus/Effects/drBgLight.png");
//         auto dragon = Sprite::create("studio/Bonus/Effects/drDragon.png");
//         auto star = Sprite::create("studio/Bonus/Effects/drStarLight.png");
//
//         light->setPosition(Vec2(winSize.width * 0.55f, winSize.height * 0.55f));	light->setOpacity(0);
//         dragon->setPosition(Vec2(winSize.width * 0.52f, winSize.height * 0.52f));	dragon->setOpacity(0);
//         star->setPosition(Vec2(winSize.width * 0.45f, winSize.height * 0.62f));		star->setOpacity(0);
//
//         dragon->runAction(sequen->clone());
//         star->runAction(sequen->clone());
//
//         mainNode->addChild(light, 0);
//         mainNode->addChild(dragon, 2);
//         mainNode->addChild(star, 1);
//
//         auto call = CallFunc::create([&, light, dragon]() {
//         auto fade1 = FadeTo::create(0.2f, 150);
//         auto fade2 = FadeTo::create(0.2f, 255);
//         light->runAction(RepeatForever::create(Sequence::createWithTwoActions(fade1, fade2)));
//
//         auto scaleBitIn = EaseBackOut::create(ScaleTo::create(1.0f, 0.95f));
//         auto scaleBitOut = EaseBackIn::create(ScaleTo::create(1.0f, 1.05f));
//         auto repeat = RepeatForever::create(Sequence::createWithTwoActions(scaleBitIn, scaleBitOut));
//         dragon->runAction(repeat);
//     });
//         light->runAction(Sequence::createWithTwoActions(sequen->clone(), call));
//
//         float angle = CC_DEGREES_TO_RADIANS(160);
//         Vec2 veloc = Vec2(cos(angle), sin(angle));
//         veloc.normalize();
//         Vec2 posStar = star->getPosition();
//         auto move1 = MoveTo::create(0.5f, posStar - veloc * 10);
//         auto move2 = MoveTo::create(0.5f, posStar + veloc * 10);
//         auto repeat1 = RepeatForever::create(Sequence::createWithTwoActions(move1, move2));
//         star->runAction(repeat1);
//     }
//     // make effect lines
//     {
//         {
//             auto callCre = CallFunc::create([mainNode, winSize]() {
//             // make random lighting here: from right to left
//             auto sp1 = Sprite::create(StringUtils::format("studio/Bonus/Effects/drLine%d.png", RandomHelper::random_int(1, 3)));	// line
//             float ySp = winSize.height / 2 + random(-20, 20) * 6;
//             sp1->setPosition(winSize.width + sp1->getContentSize().width, ySp);
//             sp1->setOpacity(random(5, 20) * 10);
//             sp1->setScale(random(4, 13) / 10.0f);
//             auto moveLeft = MoveTo::create(random(5, 10) / 10.0f, Vec2(-100, ySp));
//             auto callRe = RemoveSelf::create();
//             sp1->runAction(Sequence::createWithTwoActions(moveLeft, callRe));
//             mainNode->addChild(sp1, random(0, 3));
//             // make random lighting: from left to right
//             auto sp2 = Sprite::create(StringUtils::format("studio/Bonus/Effects/drLine%d.png", RandomHelper::random_int(1, 3)));	// line
//             ySp = winSize.height / 2 + random(-20, 20) * 6;
//             sp2->setPosition(-sp2->getContentSize().width, ySp);
//             sp2->setOpacity(random(5, 20) * 10);
//             sp2->setScale(random(4, 13) / 10.0f);
//             auto moveRight = MoveTo::create(random(5, 10) / 10.0f, Vec2(winSize.width + sp2->getContentSize().width, ySp));
//             auto callRe2 = RemoveSelf::create();
//             sp2->runAction(Sequence::createWithTwoActions(moveRight, callRe2));
//             mainNode->addChild(sp2, random(0, 3));
//         });
//             auto delayCre = DelayTime::create(0.05f);	// 0.05
//             auto repeatCe = Repeat::create(Sequence::createWithTwoActions(delayCre, callCre), 120);	//120
//
//             mainNode->runAction(repeatCe);
//         }
//     }
//
//     auto delayC = DelayTime::create(4.0f);
//     auto fadeC = FadeOut::create(0.5f);
//     auto callRe = RemoveSelf::create();
//     auto sequenC = Sequence::create(delayC, fadeC, callRe, NULL);
//     mainNode->runAction(sequenC);
//     parent->addChild(mainNode, zOrder);
// }
// void GameUtils::showSkillEffect(cocos2d::Node* parent, int skillKind) {
//     CCLOG("GameUtils::showSkillEffect: skill: %d", skillKind);
//     switch (skillKind) {
//         case 1: {	// LASER
//             playSkillLaserEffect(parent);
//             break;
//         } case 2: {	// WAVE
//             playSkillWaveEffect(parent);
//             break;
//         } case 3: {	// BOMB
//             playSkillBombEffect(parent);
//             break;
//         }
//     }
// }
// void GameUtils::showToastGuildInGame(cocos2d::Node* parent, const std::string &nName, const Vec2 &pos, const std::string &msg) {
//     if (msg.empty()) return;
//
//     Node* node = parent->getChildByName(nName);
//     //std::string msg = StringUtils::format("Bang %s\r\nPhe %s", bang.c_str(), phe.c_str());
//     if (node == NULL) {
//         auto txt = Text::create(msg, "studio/Fonts/MyriadPro-Bold.ttf", 24);
//         txt->setTextColor(Color4B(255, 246, 140, 255));
//         txt->enableOutline(Color4B(138, 0, 0, 255), 2);
//         txt->setTextHorizontalAlignment(TextHAlignment::CENTER);
//         txt->setTextVerticalAlignment(TextVAlignment::CENTER);
//         txt->setSkewX(10);
//         auto sizeTxt = txt->getContentSize();
//         auto node = cocos2d::ui::Scale9Sprite::create("studio/Bonus/Achievement/frameItem.png");
//         node->setContentSize(sizeTxt + Size(40, 30));
//         txt->setPosition(Vec2(node->getContentSize() / 2) + Vec2(0, -5));
//         node->addChild(txt);
//         node->setName(nName);
//         node->setPosition(pos);
//         parent->addChild(node);
//     }
//     if (node->numberOfRunningActions() > 0) {
//         node->stopAllActions();
//     }
//     node->setCascadeOpacityEnabled(true);
//     node->setScale(0);
//     node->setOpacity(0);
//
//     auto scale = EaseBackOut::create(ScaleTo::create(0.4f, 1.0f));
//     auto fadeIn = FadeIn::create(0.4f);
//     auto spawnIn = Spawn::createWithTwoActions(scale, fadeIn);
//
//     auto delay = DelayTime::create(2.5f);
//
//     auto scale2 = EaseBackIn::create(ScaleTo::create(0.4f, 0.3f));
//     auto fadeOut = FadeOut::create(0.4f);
//     auto spawnOut = Spawn::createWithTwoActions(scale2, fadeOut);
//
//     node->runAction(Sequence::create(spawnIn, delay, spawnOut, NULL));
// }

GameUtils.getColorVipText = function (vipLevel) {
    var iLevel = vipLevel;
    var color = new cc.Color(255, 255, 255, 255);
    if (iLevel >= 0 && iLevel < this.COLOR_TXT_VIP_NAME.length) {
        color = this.COLOR_TXT_VIP_NAME[iLevel];
        cc.log("HAS COLOR COLOR: " + color.r);
    }
    cc.log("GET COLOR: " + vipLevel + " " + color.b);
    return color;
};
// void GameUtils::playSkillLaserEffect(cocos2d::Node* parent) {
//     // di chuyển từ trong ra
//     auto sp = Sprite::create("studio/Bonus/Effects/bgLaze.png");
//     auto size = Director::getInstance()->getWinSize();
//     auto moveIn = EaseBackOut::create(MoveTo::create(1.0f, Vec2(size.width / 2, size.height / 2)));
//     auto moveOut = EaseBackIn::create(MoveTo::create(1.0f, Vec2(-sp->getContentSize().width, size.height / 2)));
//     auto moveBitLeft = EaseBackOut::create(MoveBy::create(1.0f, Vec2(-30, 0)));
//     auto moveBitRight = EaseBackIn::create(MoveBy::create(1.0f, Vec2(30, 0)));
//     auto repeat = Repeat::create(Sequence::createWithTwoActions(moveBitLeft, moveBitRight), 1);
//     auto sequen = Sequence::create(moveIn, repeat, moveOut, DelayTime::create(2), RemoveSelf::create(), NULL);
//
//     auto screenSize = Size(size.width / 2, size.height / 2);
//     sp->setPosition(Vec2(size.width + sp->getContentSize().width / 2, size.height / 2));
//     sp->runAction(sequen);
//     parent->addChild(sp, 200);
//     // add lighting left right
//     {
//         auto callCre = CallFunc::create([parent, screenSize]() {
//         // make random lighting here
//         auto sp = Sprite::create("studio/Bonus/Effects/lazelight.png");	// line
//         float ySp = screenSize.height + random(-20, 20) * 6;
//         sp->setPosition(screenSize.width * 2 + 100, ySp);
//         sp->setOpacity(random(5, 20) * 10);
//         sp->setScale(random(4, 13) / 10.0f);
//         auto moveLeft = MoveTo::create(random(5, 10) / 10.0f, Vec2(-100, ySp));
//         auto callRe = RemoveSelf::create();
//         sp->runAction(Sequence::createWithTwoActions(moveLeft, callRe));
//         parent->addChild(sp, 200 - random(0, 1));
//     });
//         auto delayCre = DelayTime::create(0.025f);	// 0.05
//         auto repeatCe = Repeat::create(Sequence::createWithTwoActions(delayCre, callCre), 200);	//120
//
//         sp->runAction(repeatCe);
//     }
// }
// void GameUtils::playSkillWaveEffect(cocos2d::Node* parent) {
//     // scale nhỏ từ trong ra.
//     // scale phập phồng.
//     auto sp = Sprite::create("studio/Bonus/Effects/bgSonic.png");
//     sp->setScale(0);
//     auto scaleIn = EaseBackOut::create(ScaleTo::create(0.5f, 1.0f));
//     auto call = CallFunc::create([sp](){
//         auto light = Sprite::create("studio/Bonus/Effects/soniclight.png");
//         light->setPosition(Vec2(sp->getContentSize().width * 0.8f, sp->getContentSize().height * 0.6f));
//         light->setLocalZOrder(-1);
//         light->setOpacity(0);
//         auto fadeOut = FadeTo::create(0.4f, 255);
//         auto fadeIn = FadeTo::create(0.4f, 50);
//         auto repeat = Repeat::create(Sequence::createWithTwoActions(fadeIn, fadeOut), 10);
//         light->runAction(repeat);
//         sp->addChild(light, 10);
//     });
//     auto scaleOut = EaseBackIn::create(ScaleTo::create(0.5f, 0.0f));
//     auto re = RemoveSelf::create();
//     auto sequen = Sequence::create(scaleIn, call, DelayTime::create(2.5f), scaleOut, re, NULL);
//
//     auto size = Director::getInstance()->getWinSize();
//     sp->setPosition(Vec2(size.width / 2, size.height / 2));
//     sp->runAction(sequen);
//     parent->addChild(sp, 200);
// }
// void GameUtils::playSkillBombEffect(cocos2d::Node* parent) {
//     // hiệu ứng to mờ sáng dần đập vào giữa.
//     // hiệu ứng bomb nổ.
//     //
//     auto sp = Sprite::create("studio/Bonus/Effects/bgBoom.png");
//     sp->setScale(3.0f);
//     sp->setOpacity(0);
//     {	/// make bomb animation
//         auto light = Sprite::createWithSpriteFrameName("bullet203explode0.png");
//         light->setLocalZOrder(-1);
//         light->setPosition(Director::getInstance()->getWinSize() / 2);
//         auto spriteFrameCache = SpriteFrameCache::getInstance();
//         auto animation = Animation::create();
//         animation->setDelayPerUnit(0.08f);
//         animation->setLoops(1);
//         for (int i = 0; i <= 10; i++)
//         {
//             std::string name(StringUtils::format("bullet203explode%d.png", i));
//             animation->addSpriteFrame(spriteFrameCache->getSpriteFrameByName(name));
//         }
//         auto re = RemoveSelf::create();
//         light->runAction(Sequence::createWithTwoActions(Animate::create(animation), re));
//         parent->addChild(light, 199);
//     };
//     auto scaleIn = EaseBackOut::create(ScaleTo::create(0.5f, 1.0f));
//     auto fadeIn = FadeIn::create(0.5f);
//     auto spawn = Spawn::createWithTwoActions(scaleIn, fadeIn);
//     auto scaleBitIn = EaseBackOut::create(ScaleTo::create(1.0f, 0.95f));
//     auto scaleBitOut = EaseBackIn::create(ScaleTo::create(1.0f, 1.05f));
//     auto repeat = Repeat::create(Sequence::createWithTwoActions(scaleBitIn, scaleBitOut), 1);
//     auto scaleOut = EaseBackIn::create(ScaleTo::create(0.5f, 0.0f));
//     auto re = RemoveSelf::create();
//     auto sequen = Sequence::create(spawn, repeat, scaleOut, re, NULL);
//
//     auto size = Director::getInstance()->getWinSize();
//     sp->setPosition(Vec2(size.width / 2, size.height / 2));
//     sp->runAction(sequen);
//     parent->addChild(sp, 200);
// }
GameUtils.makeBigWinEffect = function (isMe) {
    if (isMe) {
        return cc.ParticleSystemQuad.create("fishKing/particle/par_big_win.plist");
    } else {
        return cc.ParticleSystemQuad.create("fishKing/particle/sil_par_big_win.plist");
        ;
    }
};
GameUtils.makeNorWinEffect = function (isMe) {
    if (isMe) {
        return cc.ParticleSystemQuad.create("fishKing/particle/par_nor_win.plist");
    } else {
        return cc.ParticleSystemQuad.create("fishKing/particle/sil_par_nor_win.plist");
        ;
    }
};
GameUtils.makeBigRoundWinEffect = function (isMe) {
    if (isMe) {
        return cc.ParticleSystemQuad.create("fishKing/particle/par_big_round_win.plist");
    } else {
        return cc.ParticleSystemQuad.create("fishKing/particle/sil_par_big_round_win.plist");
        ;
    }
};
// LabelBMFont* GameUtils::makeTextGold(int gold, bool isMe) {
//     if (isMe) {
//         auto txt = LabelBMFont::create(StringUtils::format("%d", gold), Score_BMFont_path_forMe);
//         return txt;
//     }
//     else {
//         auto txt = LabelBMFont::create(StringUtils::format("%d", gold), Score_BMFont_path_forOther);
//         return txt;
//     }
// }
// Text* GameUtils::makeTextUIForEditBox(Vec2 pos, const std::string &str, const Color4B &color) {
//     Text* txt = Text::create(str, FONT_DEFAULT, 25);
//     txt->setAnchorPoint(Vec2(0, 0.5f));
//     txt->setPosition(pos);
//     txt->setName("text");
//     txt->setTextColor(color);
//     return txt;
// }
GameUtils.makeEditBoxForFrame = function (frame, inputMode, maxLength, delegate) {
    var returnType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : cc.KEYBOARD_RETURNTYPE_DONE;

    var padding = cc.p(12, 0);
    var size = frame.getContentSize();
    // size.width -= padding.width * 2;
    // size.height -= padding.height * 2;
    var mFont = { type: "font", name: "Default", srcs: ["hoYeah/Fonts/OpenSans-Bold.ttf"] }; //cc.path.join(portalHelper.getGamePath(), "res/hoYeah/Fonts/OpenSans-Bold.ttf")]};
    var bgPath = "Default/editbox_default.png"; //cc.path.join(portalHelper.getGamePath(), "../res/Default/editbox_default.png");
    var editBox = cc.EditBox.create(size, bgPath);
    editBox.setPosition(cc.p(0, 0));
    editBox.setAnchorPoint(cc.p(0, 0));
    editBox.setFontSize(25);
    editBox.setFontName(GameUtils.getFontName(mFont));
    editBox.setMaxLength(maxLength);
    editBox.setReturnType(returnType);
    editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
    editBox.setInputMode(inputMode);
    editBox.setDelegate(delegate);
    //editBox.setPlaceHolder("TAPHERE");
    frame.addChild(editBox, 1);
    return editBox;
};
GameUtils.getFontName = function (resource) {
    if (cc.sys.isNative && resource.srcs && cc.isArray(resource.srcs) && resource.srcs.length > 0 && resource.srcs[0]) return resource.srcs[0];
    if (resource.name) return resource.name;
    return resource;
};
GameUtils.makeTextUIForEditBox = function (pos, str, color) {
    var mFont = { type: "font", name: "Default", srcs: ["hoYeah/Fonts/OpenSans-Bold.ttf"] };
    var txt = ccui.Text(str, GameUtils.getFontName(mFont), 25);
    txt.setAnchorPoint(cc.p(0, 0.5));
    txt.setPosition(pos);
    txt.setName("text");
    txt.setTextColor(color);
    return txt;
};

GameUtils.TextRegularHandler = function (text, fontDefault) {
    if (!fontDefault) {
        fontDefault = "hoYeah/Fonts/OpenSans-Regular.ttf";
    }
    if (text) {
        var type = portalHelper.getLanguageType();
        if (type === Localize.LANG.CAM) {
            text.setFontName("hoYeah/Fonts/KhmerOSsys.ttf", true);
        } else {
            text.setFontName(fontDefault);
        }
    }
};

GameUtils.TextBoldHandler = function (text, fontDefault) {
    if (!fontDefault) {
        fontDefault = "hoYeah/Fonts/OpenSans-Bold.ttf";
    }
    if (text) {
        var type = portalHelper.getLanguageType();
        if (type === Localize.LANG.CAM) {
            text.setFontName("hoYeah/Fonts/AngkorRegular.ttf", true);
        } else {
            text.setFontName(fontDefault);
        }
    }
};

GameUtils.LOCALSIZE_FONTS = {};
GameUtils.LOCALSIZE_FONTS[Localize.LANG.CAM] = {
    normal: "hoYeah/Fonts/KhmerOSsys.ttf",
    bold: "hoYeah/Fonts/AngkorRegular.ttf"
};
GameUtils.LOCALSIZE_FONTS[Localize.LANG.CHINA] = {
    normal: "localize/font/Portal_Zh_Normal.ttf",
    bold: "localize/font/Portal_Zh_Bold.ttf"
};

GameUtils.TextHandler = function (text) {
    var sizeFont = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    var isBold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!text || !cc.sys.isObjectValid(text)) return;

    var type = portalHelper.getLanguageType();
    var fontConfig = GameUtils.LOCALSIZE_FONTS[type];
    if (fontConfig !== undefined) {
        var fontName = isBold ? fontConfig.bold : fontConfig.normal;
        text.setFontName(fontName, true);
    }

    if (sizeFont > 0) {
        text.setFontSize(sizeFont);
    }
};

GameUtils.getLocalizeFont = function () {
    var isBold = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var type = portalHelper.getLanguageType();
    var fontConfig = GameUtils.LOCALSIZE_FONTS[type];
    if (fontConfig) return isBold ? fontConfig.bold : fontConfig.normal;
    return "";
};

GameUtils.makeEffectButton = function (button, type, scNor) {
    var scEff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.8;

    if (button === null) {
        return false;
    }
    if (type === ccui.Widget.TOUCH_BEGAN) {
        button.setScale(scNor); // 0.5f);
        button.runAction(cc.scaleTo(0.1, scNor * scEff, scNor * scEff));
        return false;
    } else if (type === ccui.Widget.TOUCH_MOVED) {
        return false;
    } else if (type === ccui.Widget.TOUCH_CANCELED) {
        button.setScale(scNor * scEff); // 0.4f);
        button.runAction(cc.EaseBackOut.create(cc.scaleTo(0.3, scNor, scNor))); // 0.3f, 0.5f)));
        return false;
    }
    button.setScale(scNor * scEff); // 0.4f);
    button.runAction(cc.EaseBackOut.create(cc.scaleTo(0.3, scNor, scNor)));
    return true;
};
GameUtils.makeEffectFadeButton = function (button, type) {
    var fadeNor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 255;
    var fadeEff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 150;

    if (button === null) {
        return false;
    }
    if (type === ccui.Widget.TOUCH_BEGAN) {
        button.setOpacity(fadeNor); // 0.5f);
        button.runAction(cc.fadeTo(0.1, fadeEff));
        return false;
    } else if (type === ccui.Widget.TOUCH_MOVED) {
        return false;
    } else if (type === ccui.Widget.TOUCH_CANCELED) {
        button.setOpacity(fadeEff); // 0.4f);
        button.runAction(cc.fadeTo(0.3, fadeNor)); // 0.3f, 0.5f)));
        return false;
    }
    button.setOpacity(fadeEff); // 0.4f);
    button.runAction(cc.fadeTo(0.3, fadeNor));
    return true;
};

GameUtils.DownloadImageWithSize = function (url, sprite, size) {
    function isSpriteValid(sprite) {
        return sprite && cc.sys.isObjectValid(sprite);
    }

    if (isSpriteValid(sprite)) {
        var sizeAva = size;
        cc.textureCache.addImageAsync(url, function (texture) {
            var isTextureValid = texture instanceof cc.Texture2D && cc.sys.isObjectValid(texture);
            if (isTextureValid && isSpriteValid(sprite)) {
                var scaleX = sizeAva.width / texture.getContentSize().width;
                var scaleY = sizeAva.height / texture.getContentSize().height;
                sprite.initWithTexture(texture);
                sprite.setScale(scaleX, scaleY);
                return true;
            } else {
                cc.TextureCache.getInstance().removeAllTextures();
                return false;
            }
        });
    }
};

GameUtils.DownloadImage = function (url, sprite) {
    var isSpriteValid = sprite && cc.sys.isObjectValid(sprite);
    if (isSpriteValid) {
        var size = sprite.getContentSize();
        return GameUtils.DownloadImageWithSize(url, sprite, size);
    }
};

GameUtils.getAnimateFrameSprite = function (_formatName, _animName, _min, _max, _delay, _loop) {
    var step = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

    if (!_loop) _loop = -1;
    if (!_delay) _delay = 0.08;
    var aniCache = cc.animationCache;
    var animation = aniCache.getAnimation(_animName);
    if (!animation) {
        var spCache = cc.spriteFrameCache;
        animation = cc.Animation.create();
        animation.setDelayPerUnit(_delay);
        for (var i = _min; i <= _max; i += step) {
            var strFile = StringUtils.formatString(_formatName, i);
            var frame = spCache.getSpriteFrame(strFile);
            if (frame) {
                animation.addSpriteFrame(frame);
            } else {
                break;
            }
        }
        aniCache.addAnimation(animation, _animName);
    }
    animation.setDelayPerUnit(_delay);
    if (_loop <= 0) {
        var anime = new cc.RepeatForever(new cc.Animate(animation));
        return anime;
    } else {
        animation.setLoops(_loop);
        var _anime = new cc.Animate(animation);
        return _anime;
    }
};
GameUtils.getAnimateWithDuration = function (_formatName, _animName, _duration, _loop) {
    if (!_loop) _loop = -1;
    // if (!_delay) _delay = 0.08;
    var aniCache = cc.animationCache;
    var animation = aniCache.getAnimation(_animName);
    if (!animation) {
        var spCache = cc.spriteFrameCache;
        animation = cc.Animation.create();
        for (var i = 0;; i++) {
            var strFile = StringUtils.formatString(_formatName, i);
            var frame = spCache.getSpriteFrame(strFile);
            if (frame) {
                animation.addSpriteFrame(frame);
            } else {
                break;
            }
        }
        var delay = _duration / animation.getFrames().length;
        animation.setDelayPerUnit(delay);
        aniCache.addAnimation(animation, _animName);
    }
    // animation.setDelayPerUnit(_delay);
    if (_loop <= 0) {
        var anime = new cc.RepeatForever(new cc.Animate(animation));
        return anime;
    } else {
        animation.setLoops(_loop);
        var _anime2 = new cc.Animate(animation);
        return _anime2;
    }
};
GameUtils.getAnimateByFiles = function (_formatName, _animName, _min, _max, _delay, _loop) {
    if (!_loop) _loop = -1;
    if (!_delay) _delay = 0.08;
    var aniCache = cc.animationCache;
    var animation = aniCache.getAnimation(_animName);
    if (!animation) {
        animation = new cc.Animation();
        animation.setDelayPerUnit(_delay);
        for (var i = _min; i <= _max; i++) {
            var strFile = StringUtils.formatString(_formatName, i);
            animation.addSpriteFrameWithFile(strFile);
        }
        aniCache.addAnimation(animation, _animName);
    }
    animation.setDelayPerUnit(_delay);
    if (_loop <= 0) {
        var anime = new cc.RepeatForever(new cc.Animate(animation));
        return anime;
    } else {
        animation.setLoops(_loop);
        var _anime3 = new cc.Animate(animation);
        return _anime3;
    }
};
GameUtils.tripURL = function (url) {
    var i = url.search(' ');
    if (i > 0) {
        return url.substr(0, i); //.substr(0, i);
    }
    return url;
};

/**
 * Make winning animation
 * @param {cc.Node} node - parent node to add effect
 * @param {cc.Point} startPos - usually position of pot/dealer
 * @param {cc.Point} endPos - position of user that win chips
 * @param {int}  chipAmount - amount of winning chips
 * @param {boolean} isMe - decide which animation to use. red chips animation by default
 * @param {int} zOrder - local Z Order of effect
 * @param {number} spawnCoin - delay between each spawning chips
 */
GameUtils.getWonChips = function (node, startPos, endPos, chipAmount) {
    var isMe = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var zOrder = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var spawnCoin = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0.12;

    //Add money text at starting position - a.k.a dealer's pot position
    var mStr = "+" + StringUtils.Coin(chipAmount);
    var moneyText = new ccui.TextBMFont("", res.WON_FNT);
    // let moneyText = new ccui.Text();
    // let mFont = {type:"font", name:"Default", srcs:["res/Fonts/OpenSans-Bold.ttf"]};
    // moneyText.setFontName(GameUtils.getFontName(mFont));
    // moneyText.setFontSize(32);
    // moneyText.setTextColor(cc.color(255,255,0));
    // moneyText.enableShadow(cc.color(255,88,0), cc.size(2,-2), 1.5);
    moneyText.setPosition(endPos);
    moneyText.setAnchorPoint(cc.p(0.5, 0));
    //moneyText.setScale(0.0);
    moneyText.setString(mStr);
    moneyText.setScale(0.0);
    //auto scale = ScaleTo::create(0.8f, 0.5f);
    var fade = cc.fadeOut(0.25);
    var moveOut = cc.MoveTo(0.4, endPos.x, endPos.y - 100);
    var spawn = cc.spawn(moveOut, fade);
    var fadeIn = cc.fadeIn(0.2);
    var move = cc.moveTo(0.2, endPos.x, endPos.y + 55);
    var scaleIn = new cc.EaseBackOut(cc.scaleTo(0.2, 1.0, 1.0));
    var spawnIn = cc.spawn(scaleIn, fadeIn, move);
    var sequence = cc.sequence(spawnIn, cc.delayTime(1.2), spawn, cc.removeSelf(true));
    moneyText.runAction(sequence);
    node.addChild(moneyText, zOrder);

    //Chips animation
    for (var i = 0; i <= MAX_WIN_CHIPS; i++) {
        var delay = cc.delayTime(spawnCoin * i);
        var call = cc.callFunc(function () {
            var coin = new cc.Sprite();
            if (isMe) coin.initWithSpriteFrameName("CoinWin0.png");else coin.initWithSpriteFrameName("CoinWin0_sil.png");
            var anim = GameUtils.makeCoinAnimate(isMe);
            coin.runAction(cc.repeatForever(anim));
            //Bounce
            var bounce = new cc.EaseBounceOut(cc.moveBy(0.1, 0, 50));
            var bounceBack = new cc.EaseBounceOut(cc.moveBy(0.1, 0, -50));

            //Bezier
            var bezier = [startPos, cc.p(startPos.x, (endPos.y - startPos.y) / 3 * 2), endPos];
            var bezierTo = cc.bezierTo(0.5, bezier);

            //Fade
            var fadeOut = cc.fadeOut(0.25);
            var scaleTo = cc.scaleTo(0.25, 0.25, 0.25);

            var sequence = cc.sequence(bounce, bounceBack, bezierTo, cc.spawn(fadeOut, scaleTo), cc.removeSelf(true));

            coin.setPosition(startPos);
            coin.runAction(sequence);
            node.addChild(coin, zOrder);
        });
        var seq = cc.sequence(delay, call);
        node.runAction(seq);
    }
};

/**
 * performCountdownText
 * @param {cc.Text} txt - parent node to add effect
 * @param {int} totalCount - total counting
 * @param {int} currMoney - current money at txt
 * @param {int} bonusMoney - coin has to plus increase
 * @param {int} _totalMoney - number set last offset.
 */
GameUtils.performCountdownTextBM = function (txt, totalCount, currMoney, bonusMoney) {
    var _totalMoney = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;

    if (!txt) {
        cc.log("GameUtils.performCountdownText: NODE NULL");
        return;
    }
    var totalMoney = currMoney + bonusMoney;
    if (_totalMoney != -1) {
        // set default if var have.
        totalMoney = _totalMoney;
    }
    var isCountDown = bonusMoney < 0 ? true : false;
    var factorMoney = bonusMoney / totalCount;
    if (factorMoney == 0) {
        factorMoney = 1;
    }
    var scaleVal = txt.getScale();
    txt.stopActionByTag(968);
    txt.setString(StringUtils.Coin(currMoney));
    txt.setTag(0);
    var callCount = cc.callFunc(function () {
        //[&, txt, currMoney, totalCount, totalMoney, factorMoney, scaleVal]() {
        var currIndex = txt.getTag();
        if (currIndex > totalCount) return;
        var inMoney = currMoney + currIndex * factorMoney;
        if (isCountDown) {
            if (inMoney < totalMoney) {
                inMoney = totalMoney;
            }
        } else {
            if (inMoney > totalMoney) {
                inMoney = totalMoney;
            }
        }
        //CCLOG("GameUtils::performCountdownTextBM ======= inMoney: %d", inMoney);
        txt.setString(StringUtils.Coin(inMoney)); //StringUtils::format("%d", inMoney));
        currIndex++;
        txt.setTag(currIndex);
    });
    var sequenCountMoney = cc.sequence(cc.delayTime(0.015), callCount);
    var repeatCountMoney = cc.repeat(sequenCountMoney, totalCount + 1);
    repeatCountMoney.setTag(968);
    txt.runAction(repeatCountMoney);
};

/**
 * showBowlFlyingChips2
 * @param {cc.Node} node - parent node to add effect
 * @param {cc.Point} startPos - usually position of pot/dealer
 * @param {cc.Point} endPos - position of user that win chips
 * @param {string} strFormat - nameSpriteFrame format, EX: coin{0}.png
 * @param {int} maxChips - number of chips show
 * @param {int} zOrder - local Z Order of effect
 * @param {number} spawnCoin - delay between each spawning chips
 */
GameUtils.showBowlFlyingChips2 = function (node, startPos, endPos, strFormat) {
    var maxChips = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : MAX_WIN_CHIPS;
    var zOrder = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var spawnCoin = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0.12;

    var COIN_MIN_SCALE = 0.5;
    var COIN_MAX_SCALE = 1;

    // Flying chips

    var _loop2 = function _loop2(i) {

        var coin = new cc.Sprite();
        coin.scale = COIN_MIN_SCALE;
        coin.setSpriteFrame(StringUtils.formatString(strFormat, 0));

        var anim = GameUtils.getAnimateFrameSprite(strFormat, "BOWL_COIN", 0, 28, 0.08, -1);
        coin.runAction(cc.repeatForever(anim));

        var posStart = cc.p(startPos.x + MathUtils.randomMinMax(-60, 60), startPos.y);
        var iRandY = MathUtils.randomMinMax(2, 5) * 10;

        coin.setPosition(posStart);
        node.addChild(coin, zOrder);

        var delayStart = cc.delayTime(spawnCoin * i);
        var callStart = cc.callFunc(function () {
            //Bounce
            var bounce = cc.EaseBackOut.create(cc.moveBy(0.25, cc.p(0, iRandY)));
            var bounceBack = cc.EaseBackIn.create(cc.moveBy(0.25, cc.p(0, -iRandY)));
            var sequenStart = cc.sequence(bounce, bounceBack);
            var repeatStart = cc.repeat(sequenStart, 20);
            repeatStart.setTag(999);
            coin.runAction(repeatStart);
        });
        var seqStart = cc.sequence(delayStart, callStart);
        // show move coin to endPos
        var delay = cc.delayTime(spawnCoin * maxChips + 0.8 + spawnCoin * i);
        var call = cc.callFunc(function () {
            coin.stopActionByTag(999);
            //Bezier    //(endPos.y - posStart.y) / 2
            var bezier = [posStart, cc.p(posStart.x, endPos.y), endPos];
            var bezierTo = cc.bezierTo(0.5, bezier);

            //Fade
            var fadeOut = cc.fadeOut(0.25);
            var scaleTo = cc.scaleTo(0.25, COIN_MAX_SCALE * 2);

            var sequence = cc.sequence(bezierTo, cc.spawn(fadeOut, scaleTo), cc.removeSelf(true));

            coin.runAction(sequence);
        });

        var seq = cc.sequence(seqStart, delay, call);
        node.runAction(seq);
    };

    for (var i = 0; i <= maxChips; i++) {
        _loop2(i);
    }
};

/**
 * showBowlFlyingChips
 * @param {cc.Node} node - parent node to add effect
 * @param {cc.Point} startPos - usually position of pot/dealer
 * @param {cc.Point} endPos - position of user that win chips
 * @param {int} zOrder - local Z Order of effect
 * @param {number} spawnCoin - delay between each spawning chips
 */
GameUtils.showBowlFlyingChips = function (node, startPos, endPos) {
    var maxChips = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MAX_WIN_CHIPS;
    var zOrder = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var spawnCoin = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0.12;

    var COIN_MIN_SCALE = 0.25;
    var COIN_MAX_SCALE = 0.5;

    // Flying chips
    for (var i = 0; i <= maxChips; i++) {
        var delay = cc.delayTime(spawnCoin * i);
        var call = cc.callFunc(function () {
            var coin = new cc.Sprite();
            coin.scale = COIN_MIN_SCALE;
            coin.setSpriteFrame("CoinEffect0.png");

            var anim = GameUtils.getAnimateFrameSprite("CoinEffect{0}.png", "BOWL_COIN", 0, 28, 1.0 / 28, 1);
            coin.runAction(cc.repeatForever(anim));

            //Bounce
            var bounce = new cc.EaseBounceOut(cc.moveBy(0.1, 0, 50));
            var bounceBack = new cc.EaseBounceOut(cc.moveBy(0.1, 0, -50));

            //Bezier
            var bezier = [startPos, cc.p(startPos.x, (endPos.y - startPos.y) / 3 * 2), endPos];
            var bezierTo = cc.bezierTo(0.5, bezier);

            //Fade
            var fadeOut = cc.fadeOut(0.25);
            var scaleTo = cc.scaleTo(0.25, COIN_MAX_SCALE);

            var sequence = cc.sequence(bounce, bounceBack, bezierTo, cc.spawn(fadeOut, scaleTo), cc.removeSelf(true));

            coin.setPosition(startPos);
            coin.runAction(sequence);
            node.addChild(coin, zOrder);
        });

        var seq = cc.sequence(delay, call);
        node.runAction(seq);
    }
};

GameUtils.makeCoinAnimate = function (isMe) {
    var animName = "";
    var format = "";
    if (isMe) {
        animName = "A_COIN";
        format = "CoinWin{0}.png";
    } else {
        animName = "SI_COIN";
        format = "CoinWin{0}_sil.png";
    }
    var aniCache = cc.animationCache;

    var anim = aniCache.getAnimation(animName);
    if (!anim) {
        var spCache = cc.spriteFrameCache;
        anim = cc.Animation.create();
        anim.setDelayPerUnit(0.05);
        for (var i = 0;; i++) {
            var strFile = StringUtils.formatString(format, i);
            var frame = spCache.getSpriteFrame(strFile);
            if (frame) anim.addSpriteFrame(frame);else break;
        }
        if (!anim) {
            cc.log("GAMEUTILS::makeCoinAnimate - NO FRAME FOUND. PLEASE CHECK IF PLIST EXIST!!!");
            return;
        }
        aniCache.addAnimation(anim, animName);
    }
    return cc.animate(anim);
};

GameUtils.checkExistsFolder = function (folder) {
    var folderPath = jsb.fileUtils.getWritablePath() + folder + "/";
    if (!jsb.fileUtils.isDirectoryExist(folderPath)) {
        jsb.fileUtils.createDirectory(folderPath);
    }
    return folderPath;
};

GameUtils.scalePopupByDeviceResolution = function (node) {
    if (node) {
        node.setScale(GameUtils.getPopupScaleByDeviceResolution());
    }
};

GameUtils.getPopupScaleByDeviceResolution = function () {
    var size = cc.winSize;
    var aspect = size.width / size.height;
    var targetAspect = 1280.0 / 720.0;
    if (aspect >= targetAspect) {
        return targetAspect / aspect;
    } else {
        return 1.0;
    }
};

GameUtils.makeBMString = function (label, keyname) {
    var type = portalHelper.getLanguageType();
    cc.log("makeBMString - type:", type);
    var mSprite = label.getParent().getChildByName(keyname);
    if (mSprite) {
        label.getParent().removeChild(mSprite, true);
    }
    if (type === 0 || type === 5 || type === 6) {
        //type = 0-> VI, type = 5 -> EN
        label.setString(Localize.lang[keyname]);
        label.setVisible(true);
    } else {
        GameUtils.textToSprite(keyname, label);
    }
};
GameUtils.textToSprite = function (keyname, label) {
    var renderData = label.getRenderFile();
    var fontPrefix = "";
    cc.log("textToSprite: ", renderData.file);
    cc.log("textToSprite: ", GameUtils.BMFont[renderData.file]);
    if (GameUtils.BMFont.length != 0 && GameUtils.BMFont.hasOwnProperty(renderData.file)) {
        fontPrefix = GameUtils.BMFont[renderData.file];
    }
    var frameName = StringUtils.formatString("{0}_{1}_{2}.png", portalHelper.getLanguageStr(), fontPrefix, keyname); //portalHelper.getLanguageStr()
    var frame = cc.spriteFrameCache.getSpriteFrame(frameName);
    if (!frame) {
        cc.log("GameUtils.textToSprite: %s not found", frameName);
        return;
    }
    var mSprite = new cc.Sprite(frame);
    mSprite.setName(keyname);
    mSprite.setAnchorPoint(label.getAnchorPoint());
    mSprite.setPosition(cc.p(label.getPosition().x, label.getPosition().y - 5));

    label.getParent().addChild(mSprite, label.getLocalZOrder());
    label.setVisible(false);
};

GameUtils.RoundSquareAva = function (spCover, url, fileDefault, padding) {
    var size = cc.size(spCover.getContentSize().width - padding, spCover.getContentSize().height - padding);
    var ava = spCover.getChildByName("ava");
    if (!ava) {
        ava = new cc.Sprite(fileDefault);
        ava.setAnchorPoint(cc.p(0.5, 0.5));
        ava.setName("ava");
        ava.setScale(size.width / ava.width, size.height / ava.height);
        ava.setNormalizedPosition(cc.p(0.5, 0.5));
        spCover.addChild(ava, -1);
    }
    GameUtils.DownloadImageWithSize(url, ava, size);
},

//Download and clipping to circle image
//Param: cover sprite and url
//note that cover sprite should not be having blank padding
    GameUtils.RoundClipper = function (spCover, url) {
        //parentNode, spAva, size) {
        if (!spCover) return;
        var size = cc.size(spCover.getContentSize().width - 1, spCover.getContentSize().height - 1);
        var node = spCover.getChildByName("clippingNode");
        if (!node) {
            //node.removeFromParent(true);
            node = new ccui.Widget();
            node.setName("clippingNode");
            var _spAva = cc.Sprite.create();
            if (jsb.fileUtils.isFileExist("res/Main/defaultAvatar.png")) {
                _spAva.initWithFile("res/Main/defaultAvatar.png");
            }
            _spAva.setName("ava");

            var mask = cc.Sprite.create("res/Main/_mask.png");
            var texture = mask.getTextureRect();
            mask.setScale(size.width / texture.width, size.height / texture.height);

            var maskedFill = new cc.ClippingNode(mask);
            maskedFill.setName("mask");
            maskedFill.setAlphaThreshold(0.65);
            maskedFill.addChild(_spAva);
            maskedFill.setAnchorPoint(cc.p(0.5, 0.5));
            maskedFill.setNormalizedPosition(cc.p(0.5, 0.5));

            node.addChild(maskedFill);
            node.setAnchorPoint(cc.p(0.5, 0.5));
            node.setContentSize(_spAva.getContentSize());
            node.setNormalizedPosition(cc.p(0.5, 0.5));
            spCover.addChild(node, -1);
        }
        var spAva = node.getChildByName("mask").getChildByName("ava");
        spAva.setContentSize(size);
        GameUtils.DownloadImage(url, spAva);
        spAva.setAnchorPoint(cc.p(0.5, 0.5));
        spAva.setNormalizedPosition(cc.p(0.5, 0.5));
    };

var Toast = function () {
    'use strict';

    var Container = cc.LayerColor.extend({
        Node: cc.Sprite.extend({
            ctor: function ctor(text, parent, defaults) {
                text = text || '';
                parent = parent || cc.director.getRunningScene();
                defaults = defaults || {};

                defaults.sprite = defaults.sprite || res_common.png_toast;
                defaults.fontName = defaults.fontName || res_common.font_toast.name;
                defaults.fontSize = defaults.fontSize || 38;

                this._super(defaults.sprite);
                parent.addChild(this);

                this.label = new cc.LabelTTF(text, defaults.fontName, defaults.fontSize);
                this.label.x = this.getContentSize().width * 0.5;
                this.label.y = this.getContentSize().height * 0.5;
                this.addChild(this.label);
            }
        }),

        ctor: function ctor(parent) {
            this._super(cc.color(0, 0, 0, 0));
            this.setName('TOAST_CONTAINER');

            parent = parent || cc.director.getRunningScene();
            parent.addChild(this, 999999);

            this.nodes = [];
            this.pushingNodes = [];
            this.disposingNodes = [];

            this.scheduleUpdate();
            this.x = 0;
            this.y = 0;
            this.anchorX = 0;
            this.anchorY = 0;
        },

        showMessage: function showMessage(text, options) {
            var node = new this.Node(text, this, options);
            node.visible = false;
            this.pushingNodes.push(node);
        },

        disposeTimer: 0.0,
        update: function update(dt) {
            var _this = this;

            for (var i = 0, n = this.pushingNodes.length; i < n; i++) {
                var node = this.pushingNodes[i];
                node.visible = true;
                node.pushing = true;

                node.x = node.targetX = this.getContentSize().width * 0.5;
                if (node.intersect(this.nodes)) {
                    var lastNode = this.nodes[this.nodes.length - 1];
                    node.y = lastNode.y - lastNode.getContentSize().height;
                    node.targetY = lastNode.targetY - lastNode.getContentSize().height;
                } else {
                    node.y = 32 + node.getContentSize().height * 0.5;
                    var _lastNode = this.nodes[this.nodes.length - 1];
                    if (_lastNode) {
                        node.targetY = _lastNode.targetY - _lastNode.getContentSize().height;
                    } else {
                        node.targetY = 32 + node.getContentSize().height * 4.0;
                    }
                }

                this.nodes.push(node);
            }

            for (var _i = 0, _n = this.nodes.length; _i < _n; _i++) {
                var _node = this.nodes[_i];
                if (_node.pushing) {
                    _node.y += 300 * dt;
                    if (_node.y >= _node.targetY) {
                        _node.y = _node.targetY;
                        _node.pushing = false;
                    }
                }
            }

            this.pushingNodes = [];
            if (this.nodes.length > 0) {
                this.disposeTimer += dt;
                if (this.disposeTimer >= 1.0) {
                    this.disposeTimer -= 1.0;

                    var _node2 = this.nodes[0];
                    this.nodes.splice(0, 1);

                    var fadeTime = 0.3;
                    _node2.runAction(cc.sequence(cc.fadeOut(fadeTime), cc.callFunc(function () {
                        _node2.removeFromParent();
                        for (var _i2 = 0, _n2 = _this.nodes.length; _i2 < _n2; _i2++) {
                            var _node3 = _this.nodes[_i2];
                            _node3.pushing = true;
                            _node3.targetY += _node3.getContentSize().height;
                        }
                    })));
                    _node2.label.runAction(cc.fadeOut(fadeTime));
                }
            }

            for (var _i3 = this.disposingNodes.length - 1; _i3 > -1; _i3--) {
                var _node4 = this.disposingNodes[_i3];
                _node4.opacity -= 10;
                if (_node4.opacity <= 0) {
                    _node4.removeFromParent();
                    this.disposingNodes.splice(_i3, 1);
                }
            }
        }
    });

    return {
        show: function show(text, parent) {
            parent = parent || cc.director.getRunningScene();
            var toastContainer = parent.getChildByName('TOAST_CONTAINER');
            if (!toastContainer) {
                toastContainer = new Container();
            }
            toastContainer.showMessage(text);
        }
    };
}();

var AnimateLabel = AnimateLabel || ccui.Layout.extend({
    ctor: function ctor(node) {
        this._super();
        cc.assert(this != node, "Label must be difference from this");

        this.setAnchorPoint(cc.p(0.5, 0.5));

        this.size = node.getContentSize();
        this._label = node;
        // if (node.isShadowEnabled()) {
        //     this._label.enableShadow(node.getShadowColor(), node.getShadowOffset(), node.getShadowBlurRadius());
        // }
        this._label.setPosition(0, 0);
        this._label.setAnchorPoint(cc.p(0, 0));
        this.addChild(this._label);
        NodeUtils.fixTextLayout(this._label);

        this._lastStopTime = 0.4;
        this._lastMoveSpeed = 30.0;

        var size = this._label.getContentSize() || cc.size(0, 0);
        this.setContentSize(size);
        return true;
    },

    setContentSize: function setContentSize(size) {
        this._super(size);
        this.clippingEnabled = true;
        this.clippingType = ccui.Layout.CLIPPING_SCISSOR;
    },

    update: function update(dt) {
        if (this._waitingTime >= 0) {
            this._waitingTime -= dt;
        } else {

            var pos = this._label.getPosition();
            var size = this._label.getContentSize();
            var region = this.getPosition();
            pos.x += this._moveSpeed * dt;
            if (this._moveSpeed > 0 && pos.x > 0 || this._moveSpeed < 0 && pos.x + size.width < this.getContentSize().width) {
                this._moveSpeed = -this._moveSpeed;
                this._waitingTime = this._stopTime;
            }

            this._label.setPosition(pos);
        }
    },

    setString: function setString(value) {
        if (this._label && this._label.setString) {
            this._label.setString(value);
            this.turnOnTextAnimate(this._lastMoveSpeed, this._lastStopTime);
        }
    },

    getString: function getString() {
        if (this._label && this._label.getString) {
            return this._label.getString();
        } else {
            return "";
        }
    },

    turnOffTextAnimate: function turnOffTextAnimate() {
        this.unscheduleUpdate();
        this._moveSpeed = 0.0;
        this._textAnimating = false;
        this._stopTime = 0.0;
        this._waitingTime = 0.0;
    },

    /* Set Alignment for Animate Label
    cc.TEXT_ALIGNMENT_LEFT = 0;
    cc.TEXT_ALIGNMENT_CENTER = 1;
    cc.TEXT_ALIGNMENT_RIGHT = 2;
     */
    align: function align(alignment) {

        switch (alignment) {
            case cc.TEXT_ALIGNMENT_LEFT:
            {
                this._label.setPositionX(0);
                break;
            }
            case cc.TEXT_ALIGNMENT_RIGHT:
            {
                this._label.setPositionX(this.size.width - this._label.getContentSize().width);
                break;
            }
            default:
            {
                this._label.setPositionX((this.size.width - this._label.getContentSize().width) / 2);
            }
        }
    },

    turnOnTextAnimate: function turnOnTextAnimate(size, moveSpeed, stopTime) {
        if (typeof size === 'number') {
            moveSpeed = size;
        } else {
            this.setContentSize(size);
        }

        moveSpeed = moveSpeed || 30.0;
        stopTime = stopTime || 0.3;

        var region = this.getContentSize();

        if (region.width - this._label.getContentSize().width >= 0) {
            this.turnOffTextAnimate();
            this._label.setPositionX((region.width - this._label.getContentSize().width) / 2);
        } else {
            this.scheduleUpdate();
            this._textAnimating = true;
            this._moveSpeed = moveSpeed;
            this._stopTime = stopTime;
            this._lastMoveSpeed = moveSpeed;
            this._lastStopTime = stopTime;
            this._waitingTime = 0.0;
        }

        return this._textAnimating;
    }
});

GameUtils.setTextForNode = function (node, value) {
    if (node && node.setString) {
        node.setString(value);
    }
};

GameUtils.setTextAnimateOff = function (node) {
    if (node) {
        var animateLabel = node;
        if (!(animateLabel instanceof AnimateLabel)) {
            animateLabel = node.getParent();
        }

        if (animateLabel instanceof AnimateLabel) {
            animateLabel.turnOffTextAnimate();
        }
    }
};

//GameUtils.setTextAnimateOn = function (node, moveSpeed, stopTime)
//{
//    if (node)
//    {
//        let animateLabel = node;
//        if (!(animateLabel instanceof AnimateLabel))
//        {
//            animateLabel = node.getParent();
//        }
//
//        if (!(animateLabel instanceof AnimateLabel))
//        {
//            let nodeParent = node.getParent();
//            node.retain();
//            node.removeFromParentAndCleanup(false);
//            node.setParent(null);
//
//            let nodePos = node.getPosition();
//            let nodeAnc = node.getAnchorPoint();
//            let nodeZOrder = node.getLocalZOrder();
//            animateLabel = new AnimateLabel(node);
//            animateLabel.setPosition(nodePos);
//            animateLabel.setAnchorPoint(nodeAnc);
//            animateLabel.setName(node.getName());
//
//            if (nodeParent)
//            {
//                nodeParent.addChild(animateLabel,nodeZOrder);
//            }
//        }
//
//        animateLabel.turnOnTextAnimate(moveSpeed, stopTime);
//    }
//}

GameUtils.setTextAnimateOn = function (node, size, moveSpeed, stopTime) {
    if (node) {
        var animateLabel = node;
        if (!(animateLabel instanceof AnimateLabel)) {
            animateLabel = node.getParent();
        }

        if (!(animateLabel instanceof AnimateLabel)) {
            var nodeParent = node.getParent();
            node.retain();
            node.removeFromParent(false);
            node.setParent(null);

            var nodePos = node.getPosition();
            var nodeAnc = node.getAnchorPoint();
            var nodeZOrder = node.getLocalZOrder();
            animateLabel = new AnimateLabel(node);
            animateLabel.setPosition(nodePos);
            animateLabel.setAnchorPoint(nodeAnc);
            animateLabel.setName(node.getName());
            nodeParent.addChild(animateLabel, nodeZOrder);
            node.release();
        }

        animateLabel.turnOnTextAnimate(size, moveSpeed, stopTime);
    }
};

GameUtils.setRichTextInside = function (node, strXML) {
    var richText = node.getChildByName("rich_content");
    if (!richText) {
        richText = new ccui.RichText();
        richText.setName("rich_content");
        node.addChild(richText);
    }
    richText.initWithXML(strXML, {});
    richText.formatText();
    richText.setAnchorPoint(cc.p(0.0, 0.5));
    richText.setNormalizedPosition(cc.p(0.015, 0.5));
};

GameUtils.captureScreen = function (targetWidth, targetHeight, onAfterCapture) {
    function onCaptureScreen(targetWidth, targetHeight, onAfterCapture) {
        function resize(srcBuffer, srcWidth, srcHeight, dstWidth, dstHeight) {
            var dstBuffer = new Uint8Array(dstWidth * dstHeight * 4);

            var widthFactor = srcWidth / dstWidth;
            var heightFactor = srcHeight / dstHeight;

            for (var dx = 0; dx < dstWidth; dx++) {
                var sx = Math.floor(dx * widthFactor);

                for (var dy = 0; dy < dstHeight; dy++) {
                    var sy = Math.floor(dy * heightFactor);

                    var indexDst = (dx + dy * dstWidth) * 4;
                    var indexSrc = (sx + sy * srcWidth) * 4;

                    dstBuffer[indexDst + 0] = srcBuffer[indexSrc + 0];
                    dstBuffer[indexDst + 1] = srcBuffer[indexSrc + 1];
                    dstBuffer[indexDst + 2] = srcBuffer[indexSrc + 2];
                    dstBuffer[indexDst + 3] = srcBuffer[indexSrc + 3];
                }
            }

            return dstBuffer;
        }

        if (typeof onAfterCapture !== "function") {
            return;
        }

        var winSize = cc.view.getFrameSize();
        var width = winSize.width;
        var height = winSize.height;
        var buffer = new Uint8Array(width * height * 4);
        var flippedBuffer = new Uint8Array(width * height * 4);

        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                flippedBuffer[((height - i - 1) * width + j) * 4 + 0] = buffer[(i * width + j) * 4 + 0];
                flippedBuffer[((height - i - 1) * width + j) * 4 + 1] = buffer[(i * width + j) * 4 + 1];
                flippedBuffer[((height - i - 1) * width + j) * 4 + 2] = buffer[(i * width + j) * 4 + 2];
                flippedBuffer[((height - i - 1) * width + j) * 4 + 3] = buffer[(i * width + j) * 4 + 3];
            }
        }

        var finalWidth = targetWidth;
        var finalHeight = targetHeight;
        var finalBuffer = flippedBuffer;
        if (width !== finalWidth || height !== finalHeight) {
            cc.log("resize image");
            finalBuffer = resize(flippedBuffer, width, height, finalWidth, finalHeight);
        }

        var image = JPEG.encode(finalBuffer, finalWidth, finalHeight);
        cc.async.map([{ image: image, width: targetWidth, height: targetHeight }], function (payload) {
            onAfterCapture(payload.image, payload.width, payload.height);
        });
    }

    if (typeof onAfterCapture !== "function") {
        return null;
    }

    var eventListener = cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_DRAW, function () {
        cc.eventManager.removeListener(eventListener);

        onCaptureScreen(targetWidth, targetHeight, onAfterCapture);
    });

    return eventListener;
};

GameUtils.captureScreenAsBase64 = function (targetWidth, targetHeight, onAfterCapture) {
    function Uint8ArrayToBase64(array) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var t = "";
        var n = void 0,
            r = void 0,
            i = void 0,
            s = void 0,
            o = void 0,
            u = void 0,
            a = void 0;
        var f = 0;

        while (f < array.length) {
            n = array[f++];
            r = array[f++];
            i = array[f++];
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + keyStr.charAt(s) + keyStr.charAt(o) + keyStr.charAt(u) + keyStr.charAt(a);
        }

        return t;
    }

    if (typeof onAfterCapture !== "function") {
        return null;
    }

    return GameUtils.captureScreen(targetWidth, targetHeight, function (buffer, width, height) {
        onAfterCapture(Uint8ArrayToBase64(buffer), width, height);
    });
};
