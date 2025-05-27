import gc from "@sg/game-client-base";
import { _decorator, Label, Node, Prefab, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { render } = Observer;
const { GameBlackjack } = gc;
const { Dealer, Hands } = GameBlackjack;

@ccclass("Dealer")
export class DealerComponent extends ObserverComponent {
    @property(Node)
    cardContainer: Node = null;

    @property(Label)
    lblScore: Label = null;

    @property(Label)
    lblResult: Label = null;

    private cards: gc.GameBlackjack.Card[] = [];
    private openedCards: gc.GameBlackjack.Card[] = [];
    private cardBoxPosition = Vec3.ZERO;
    private chipBoxPosition = Vec3.ZERO;
    private prbCard: Prefab = null;

    init(cardBoxPosition: Vec3, chipBoxPosition: Vec3, prbCard: Prefab) {
        this.cardBoxPosition = cardBoxPosition;
        this.chipBoxPosition = chipBoxPosition;
        this.prbCard = prbCard;
    }

    @render(Dealer.DealerStore, (store) => store.cards)
    private handleCardsData(cards: gc.GameBlackjack.Card[]) {
        this.cards = cards;
    }

    async dealFirstCard() {
        await this.dealCard(0);
    }

    async dealSecondCard() {
        await this.dealCard(1);
    }

    async dealCard(nth: number) {
        await this.openCard(nth);
    }

    private async openCard(nth: number) {
        if (!this.cards?.[nth]) {
            return;
        }
        this.openedCards.push(this.cards[nth]);
        this.calculateScore();
    }

    async openCards() {
        for (let i = 0; i < this.cards.length; i++) {
            this.openedCards.length < i + 1 && (await this.dealCard(i));
        }
    }

    private calculateScore() {
        this.lblScore && (this.lblScore.string = this.openedCards.reduce((acc, card) => acc + card.rank, "").toString());
    }

    reset() {
        this.openedCards = [];
        this.lblScore && (this.lblScore.string = "");
    }
}
