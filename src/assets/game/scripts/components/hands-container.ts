import gc from "@sg/game-client-base";
import { _decorator, Prefab, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { Hand } from "./hand";
import SlidingChip from "db://shared-components/game/sliding-chip/scripts/components/sliding-chip";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;
const { FormatUtils, GameBlackjack } = gc;
const { Hands } = GameBlackjack;

@ccclass
export class HandsContainer extends ObserverComponent {
    @property([Hand])
    hands: Hand[] = [];

    private activePosition = 0;

    init(cardBoxPosition: Vec3, chipFlying: ChipFlying, prbCard: Prefab) {
        for (const hand of this.hands) {
            hand.init(cardBoxPosition, chipFlying, prbCard);
        }
    }

    @render(Hands.HandsStore, (store) => store.activePosition)
    private handleActivePosition(activePosition: number) {
        this.activePosition = activePosition;
    }

    async dealFirstCards() {
        for (const hand of this.hands) {
            await hand.dealFirstCard();
        }
    }

    async dealSecondCards() {
        for (const hand of this.hands) {
            await hand.dealSecondCard();
        }
    }

    async openCards() {
        for (const hand of this.hands) {
            await hand.openCards();
        }
        this.setActiveHand();
    }

    async hitCard() {
        const hand = this.getActiveHand();
        await hand.hitCard();
    }

    private getActiveHand() {
        return this.hands.find((hand) => hand.position === this.activePosition);
    }

    @handle(Hands.HandHandlers, (handler) => handler.setActiveHand())
    async setActiveHand() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    reset() {
        for (const hand of this.hands) {
            hand.reset();
        }
    }
}
