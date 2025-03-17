import gc from "@sg/game-client-base";
import { _decorator, Node, Vec3 } from "cc";
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

    @property(Node)
    prbCard: Node = null;

    private cards: gc.GameBlackjack.Card[] = [];

    @render(Dealer.DealerStore, (store) => store.cards)
    private handleCardsData(cards: gc.GameBlackjack.Card[]) {
        this.cards = cards;
    }

    async openCards() {
        console.log(this.cards);
    }

    async dealFirstCard(destination: Vec3) {
        await this.dealCard(destination, 0);
    }

    async dealSecondCard(destination: Vec3) {
        await this.dealCard(destination, 1);
    }

    async dealCard(destination: Vec3, nth: number) {
        console.log({ action: "dealerDrawCard", card: this.cards[nth] });
    }

    private drawAndOpenCard(destination: Vec3, nth: number) {
        console.log({ action: "dealerDrawAndOpenCard", card: this.cards[nth] });
    }

    private drawCard(destination: Vec3, nth: number) {
        console.log({ action: "dealerDrawCard", card: this.cards[nth] });
    }
}
