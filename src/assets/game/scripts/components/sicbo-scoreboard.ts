import { _decorator, Layout, Node, ScrollView, Sprite, SpriteAtlas, UITransform } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
const { handle, render } = Observer;

const { ccclass, property } = _decorator;

@ccclass()
export class SicboScoreBoard extends ObserverComponent {
    @property(Node)
    nodeDiceStatistic: Node = null;

    @property(Node)
    nodeBigRoad: Node = null;

    @property(Node)
    nodeContainer: Node = null;

    @property(SpriteAtlas)
    mainAtlas: SpriteAtlas = null;

    @property(ScrollView)
    scrollBigRoad: ScrollView = null;

    @property(ScrollView)
    scrollDiceStatistic: ScrollView = null;

    @property(Sprite)
    sprChangeModeBigRoad: Sprite = null;

    private isExpandBigRoad = false;

    private readonly WIDTH_COLLAPSE_BIGROAD = 98;
    private readonly WIDTH_SPACING = 32;
    private readonly WIDTH_GAME = 828;

    onClickExpandMode() {
        this.isExpandBigRoad = !this.isExpandBigRoad;

        if (this.isExpandBigRoad) {
            const widthNodeRemain = this.WIDTH_GAME - this.WIDTH_SPACING - this.WIDTH_COLLAPSE_BIGROAD;
            this.nodeDiceStatistic.getComponent(UITransform).width = this.WIDTH_COLLAPSE_BIGROAD;
            this.nodeBigRoad.getComponent(UITransform).width = widthNodeRemain;
            this.sprChangeModeBigRoad.spriteFrame = this.mainAtlas.getSpriteFrame("stats-icon-collapse");
        } else {
            const widthNodeRemain = this.WIDTH_GAME - this.WIDTH_SPACING - this.WIDTH_COLLAPSE_BIGROAD;
            this.nodeDiceStatistic.getComponent(UITransform).width = widthNodeRemain;
            this.nodeBigRoad.getComponent(UITransform).width = this.WIDTH_COLLAPSE_BIGROAD;
            this.sprChangeModeBigRoad.spriteFrame = this.mainAtlas.getSpriteFrame("stats-icon-expand");
        }

        this.scrollBigRoad.stopAutoScroll();
        this.scrollBigRoad.scrollToRight();

        this.scrollDiceStatistic.stopAutoScroll();
        this.scrollDiceStatistic.scrollToRight();

        this.nodeContainer.getComponent(Layout).updateLayout();
    }
}
