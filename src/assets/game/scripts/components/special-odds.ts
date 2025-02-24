import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { GameConfigs, Rounds } = gc;

const { handle, render } = Observer;

@ccclass("SpecialOdds")
export class SpecialOdds extends ObserverComponent {
    @property({ type: Label })
    lblSpecialOdds: Label[] = [];

    @render(Rounds.RoundStore, (store) => store.roundOdds)
    renderOdds(roundOdds: gc.Rounds.RoundOdds) {
        const { odds, fractional } = roundOdds;

        if (!this.lblSpecialOdds || !odds) return;

        this.lblSpecialOdds.forEach((label) => {
            if (odds[label.node.name]) {
                label.string = gc.FormatUtils.formatOdds(odds[label.node.name], fractional);
            }
        });
    }
}
