import gc from "@sg/game-client-base";
import { _decorator, CCInteger, Label, Node, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { FormatUtils, GameBlackjack } = gc;
const { Hands } = GameBlackjack;

@ccclass
export class Hand extends ObserverComponent {
    @property(CCInteger)
    position: number = 1;

    @property(Label)
    lblBetAmount: Label = null;

    @property(Node)
    nodeBgBetAmount: Node = null;

    @property(Node)
    clearButton: Node = null;

    @property(Node)
    cardContainer: Node = null;

    @property(Node)
    prbCard: Node = null;

    private handData: gc.GameBlackjack.Hand = null;
    private openedCards: gc.GameBlackjack.Card[] = [];

    onLoad(): void {
        super.onLoad();
        this.init();
    }

    private init() {
        this.setBgBetAmountActive(false);
        this.setClearButtonActive(false);
    }

    @handle(Hands.HandHandlers, (handler, position: number) => handler.placeChip(position))
    onPlaceChip() {
        return this.position;
    }

    @handle(Hands.HandHandlers, (handler, position: number) => handler.clearChip(position))
    onClearChip() {
        return this.position;
    }

    @render(Hands.HandsStore, (store) => store.hands)
    private handleHandsData(hands: { [position: number]: gc.GameBlackjack.Hand }) {
        if (hands[this.position]) {
            this.handData = hands[this.position];
            const { bet, cards } = this.handData;
            this.setBetAmount(bet || 0);
            this.setClearButtonActive(bet && (!cards || cards.length === 0));
        }
    }

    @render(Hands.HandsStore, (store) => store.activePosition)
    private setActiveHand(activePosition: number) {
        console.log("setActiveHand", { activePosition, position: this.position });
    }

    private setBetAmount(amount: number) {
        this.lblBetAmount && (this.lblBetAmount.string = amount ? FormatUtils.numberWithCommas(amount) : "");
        this.setBgBetAmountActive(!!amount);
    }

    private setBgBetAmountActive(isShow: boolean) {
        this.nodeBgBetAmount && (this.nodeBgBetAmount.active = isShow);
    }

    private setClearButtonActive(isShow: boolean) {
        this.clearButton && (this.clearButton.active = isShow);
    }

    async openCards() {
        console.log("openCards", { cards: this.handData.cards });
        this.openedCards = [...this.handData.cards];
        this.calculateScore();
    }

    async dealFirstCard(destination: Vec3) {
        await this.drawCard(destination, true, 0);
    }

    async dealSecondCard(destination: Vec3) {
        await this.drawCard(destination, true, 1);
    }

    async hitCard(destination: Vec3) {
        await this.drawCard(destination, true, this.handData.cards.length - 1);
    }

    clearHand() {
        console.log("clearHand");
        if (this.handData) {
            this.handData = null;
            this.openedCards = [];
        }
    }

    private async drawCard(destination: Vec3, isAnimation: boolean, nth: number) {
        if (this.handData?.cards?.length > 0) {
            console.log("drawCard", { destination, isAnimation, nth, cards: this.handData, position: this.position });
            this.openedCards.push(this.handData.cards?.[nth]);
            this.calculateScore();
        }
    }

    private calculateScore() {
        console.log("calculateScore", {
            openedCards: this.openedCards.reduce((acc, card) => acc + card.rank, ""),
            position: this.position,
        });
    }
}
