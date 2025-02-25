import gc from "@sg/game-client-base";
import { _decorator, CCInteger, Label, Node } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { FormatUtils, GameBlackjack } = gc;
const { Hands, Bets } = GameBlackjack;

@ccclass
export class Hand extends ObserverComponent {
    @property(CCInteger)
    position: number = 1;

    @property(Label)
    lblBetAmount: Label = null;

    @property(Node)
    nodeBgBetAmount: Node = null;

    @property(Node)
    cardContainer: Node = null;

    @property(Node)
    prbCard: Node = null;

    private handData: gc.GameBlackjack.Hand = null;

    @handle(Bets.PlaceChipHandler, (handler, position: number) => handler.handle(position))
    onPlaceChip() {
        return this.position;
    }

    @handle(Bets.ClearChipHandler)
    onClearChip() {
        return this.position;
    }

    @render(Hands.HandsStore, (store) => store.hands)
    setBetAmount(hands: { [position: number]: gc.GameBlackjack.Hand }) {
        if (hands[this.position]) {
            this.handData = hands[this.position];
            const { bet } = hands[this.position];
            this.lblBetAmount && (this.lblBetAmount.string = bet ? FormatUtils.numberWithCommas(bet) : "");
            this.nodeBgBetAmount && (this.nodeBgBetAmount.active = !!bet);
        }
    }
}
