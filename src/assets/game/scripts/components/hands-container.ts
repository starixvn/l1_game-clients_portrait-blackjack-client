import gc from "@sg/game-client-base";
import { _decorator, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { Hand } from "./hand";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { FormatUtils, GameBlackjack } = gc;
const { Hands } = GameBlackjack;

@ccclass
export class HandsContainer extends ObserverComponent {
    @property([Hand])
    hands: Hand[] = [];

    private activePosition = 0;

    @render(Hands.HandsStore, (store) => store.activePosition)
    private handleActivePosition(activePosition: number) {
        this.activePosition = activePosition;
    }

    async dealFirstCards(destination: Vec3) {
        for (const hand of this.hands) {
            await hand.dealFirstCard(destination);
        }
    }

    async dealSecondCards(destination: Vec3) {
        for (const hand of this.hands) {
            await hand.dealSecondCard(destination);
        }
    }

    async openCards() {
        for (const hand of this.hands) {
            await hand.openCards();
        }
        this.setActiveHand();
    }

    async hitCard(destination: Vec3) {
        const hand = this.getActiveHand();
        await hand.hitCard(destination);
    }

    clearHands() {
        for (const hand of this.hands) {
            hand.clearHand();
        }
    }

    private getActiveHand() {
        return this.hands.find((hand) => hand.position === this.activePosition);
    }

    @handle(Hands.HandHandlers, (handler) => handler.setActiveHand())
    setActiveHand() {}
}
