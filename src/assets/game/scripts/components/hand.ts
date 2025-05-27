import gc from "@sg/game-client-base";
import { _decorator, CCInteger, instantiate, Label, Node, Prefab, tween, UITransform, Vec3 } from "cc";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import { NewChip } from "db://shared-components/game/sliding-chip/scripts/components/new-chip";
import { NewSlidingChip } from "db://shared-components/game/sliding-chip/scripts/components/new-sliding-chip";
import { FlyChip3DUtils } from "db://shared-components/game/sliding-chip/scripts/utils/fly-chip-3d-utils";
import { FlyChipUtils } from "db://shared-components/game/sliding-chip/scripts/utils/fly-chip-utils";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { FormatUtils, GameBlackjack } = gc;
const { Hands } = GameBlackjack;

const ChipParams = {
    scaleX: 0.7,
    scaleY: 0.7,
    scaleYEnd: 0.6,
    offset: 6,
    rotation: 0,
    offsetStack: 1,
};

@ccclass
export class Hand extends ObserverComponent {
    @property(CCInteger)
    position: number = 1;

    @property(Node)
    betPlaceNode: Node = null;

    @property(Label)
    lblBetAmount: Label = null;

    @property(Node)
    nodeBgBetAmount: Node = null;

    @property(Node)
    clearButton: Node = null;

    @property(Node)
    cardContainer: Node = null;

    @property(Label)
    handId: Label = null;

    @property(Label)
    lblScore: Label = null;

    @property(Label)
    lblResult: Label = null;

    protected handData: gc.GameBlackjack.Hand = null;
    protected openedCards: gc.GameBlackjack.Card[] = [];

    protected cardBoxPosition = Vec3.ZERO;
    protected chipBoxPosition = Vec3.ZERO;
    protected slidingChip: NewSlidingChip = null;
    protected oldBetAmount = 0;
    protected prbCard: Prefab = null;

    protected timeoutMergeAndStackChips: NodeJS.Timeout = null;

    onLoad(): void {
        super.onLoad();
    }

    init(cardBoxPosition: Vec3, chipFlying: ChipFlying, prbCard: Prefab) {
        this.slidingChip = chipFlying.nodeSlidingChip?.getComponent(NewSlidingChip);
        this.cardBoxPosition = cardBoxPosition;
        this.prbCard = prbCard;
        // this.chipBoxPosition = chipBoxPosition;
    }

    @handle(Hands.HandHandlers, (handler, position: number) => handler.placeChip(position))
    onPlaceChip() {
        return this.position;
    }

    @handle(Hands.HandHandlers, (handler, position: number) => handler.clearChip(position))
    onClearChip() {
        this.reset();
        return this.position;
    }

    @render(Hands.HandsStore, (store) => store.hands)
    protected handleHandsData(hands: { [position: number]: gc.GameBlackjack.Hand }) {
        if (hands[this.position]) {
            this.handData = hands[this.position];
            const { bet, cards, id } = this.handData;
            this.setBetAmount(bet);
            this.setClearButtonActive(bet && (!cards || cards.length === 0));
            this.handId && id && (this.handId.string = id.toString());
        }
    }

    @render(Hands.HandsStore, (store) => store.activePosition)
    protected setActiveHand(activePosition: number) {}

    protected setBetAmount(amount: number) {
        const betAmount = amount - this.oldBetAmount;
        if (betAmount <= 0) {
            return;
        }
        this.throwChip(betAmount, amount);
        this.oldBetAmount = amount;
        this.lblBetAmount && (this.lblBetAmount.string = amount ? FormatUtils.numberWithCommas(amount) : "");
        this.setBgBetAmountActive(!!amount);
    }

    private setChipProperties(chipNode: NewChip) {
        const chipFlyConfig = {
            rotationComp1: 0,
            rotationComp2: 0,
            scaleX1: ChipParams.scaleX,
            scaleY1: 0.45,
            scaleX2: ChipParams.scaleX,
            scaleY2: ChipParams.scaleYEnd,
            rotationNode1: 24,
            rotationNode2: -12,
            rotationNode3: 0,
        };
    }

    protected throwChip(betAmount: number, totalAmount: number) {
        const chipFlyingDuration = 0.5;

        const { worldPos } = this.slidingChip.createStartNodeInfo(null, betAmount);
        const chipNode = this.slidingChip.createFlyingChip(betAmount);
        if (!chipNode) return;
        const containerTransform = this.betPlaceNode.getComponent(UITransform);
        chipNode.position = containerTransform.convertToNodeSpaceAR(worldPos);

        this.betPlaceNode.addChild(chipNode);
        const chipComponent = chipNode.getComponent(NewChip);
        this.setChipProperties(chipComponent);
        const numberOfChip = this.betPlaceNode.children.length;
        const destPosition = this.betPlaceNode.getPosition();
        if (numberOfChip === 1) {
            chipComponent.firstChipShadow.active = true;
        }
        if (numberOfChip > 1) {
            const destY = (numberOfChip - 1) * (ChipParams.offset + ChipParams.offsetStack);
            destPosition.set(destPosition.x, destPosition.y + destY, destPosition.z);
        }
        clearTimeout(this.timeoutMergeAndStackChips);
        FlyChipUtils.moveChipTo(chipNode, destPosition, chipFlyingDuration, () => {});
        this.timeoutMergeAndStackChips = setTimeout(() => {
            this.betPlaceNode.destroyAllChildren();
            FlyChip3DUtils.mergeAndStackChips(this.betPlaceNode, totalAmount, this.slidingChip);
        }, chipFlyingDuration * 1000);
    }

    protected setBgBetAmountActive(isShow: boolean) {
        this.nodeBgBetAmount && (this.nodeBgBetAmount.active = isShow);
    }

    protected setClearButtonActive(isShow: boolean) {
        this.clearButton && (this.clearButton.active = isShow);
    }

    async openCards() {
        if (!this.handData) return;
        this.openedCards = [...this.handData.cards];
        this.calculateScore();
    }

    async dealFirstCard() {
        await this.drawCard(true, 0);
    }

    async dealSecondCard() {
        await this.drawCard(true, 1);
    }

    async hitCard() {
        await this.drawCard(true, this.handData.cards.length - 1);
    }

    protected async drawCard(isAnimation: boolean, nth: number) {
        if (this.handData?.cards?.length > 0) {
            const card = instantiate(this.prbCard);
            card.position = this.cardContainer.getComponent(UITransform).convertToNodeSpaceAR(this.cardBoxPosition);
            this.cardContainer.addChild(card);
            const cardContainerPosition = this.cardContainer.getPosition();
            tween(card)
                .to(
                    0.5,
                    { position: new Vec3(cardContainerPosition.x + 10 * nth, cardContainerPosition.y, cardContainerPosition.z) },
                    { easing: "smooth" }
                )
                .start();
            this.openedCards.push(this.handData.cards?.[nth]);
            this.calculateScore();
        }
    }

    protected calculateScore() {
        if (this.lblScore) {
            this.lblScore.node.active = true;
            this.lblScore.string = this.openedCards.reduce((acc, card) => acc + card.rank, "").toString();
        }
    }

    reset() {
        this.openedCards = [];
        this.handData = null;
        this.lblScore && (this.lblScore.node.active = false);
        this.lblResult && (this.lblResult.node.active = false);
        this.lblBetAmount && (this.lblBetAmount.string = "");
        this.handId && (this.handId.string = "");
        this.oldBetAmount = 0;
        this.betPlaceNode.removeAllChildren();
        this.cardContainer.removeAllChildren();
    }
}
