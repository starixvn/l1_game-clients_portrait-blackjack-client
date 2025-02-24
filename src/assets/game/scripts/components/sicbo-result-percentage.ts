import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
const { ccclass, property } = _decorator;
const { handle, render } = Observer;

export enum SicBoBetType {
    big = "big",
    small = "small",
    anyTriple = "anyTriple",
    specific1 = "specific1",
    specific2 = "specific2",
    specific3 = "specific3",
    specific4 = "specific4",
    specific5 = "specific5",
    specific6 = "specific6",
}

@ccclass
export class SicboResultPercentage extends ObserverComponent {
    @property(Label)
    lblSpecific1: Label = null;

    @property(Label)
    lblSpecific2: Label = null;

    @property(Label)
    lblSpecific3: Label = null;

    @property(Label)
    lblSpecific4: Label = null;

    @property(Label)
    lblSpecific5: Label = null;

    @property(Label)
    lblSpecific6: Label = null;

    @property(Label)
    lblBig: Label = null;

    @property(Label)
    lblSmall: Label = null;

    @property(Label)
    lblAnyTriple: Label = null;

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    renderResultPercentage(dataLogs: any[]) {
        this.calculatePercentagesMainChoice(dataLogs);
        this.calculatePercentagesSpecifics(dataLogs);
    }

    calculatePercentagesMainChoice(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            let bigTotal = 0,
                smallTotal = 0,
                anyTriple = 0;

            dataLogs.forEach((log) => {
                const { settlementResult } = log;

                bigTotal += settlementResult[SicBoBetType.big] ? 1 : 0;
                smallTotal += settlementResult[SicBoBetType.small] ? 1 : 0;
                anyTriple += settlementResult[SicBoBetType.anyTriple] ? 1 : 0;
            });

            const length = dataLogs.length;

            const bigPercentage = Math.round((bigTotal / length) * 100);
            const smallPercentage = Math.round((smallTotal / length) * 100);
            const anyTriplePercentage = Math.round((anyTriple / length) * 100);

            this.lblBig.string = `${bigPercentage}%`;
            this.lblSmall.string = `${smallPercentage}%`;
            this.lblAnyTriple.string = `${anyTriplePercentage}%`;
        }
    }
    calculatePercentagesSpecifics(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            let dice1Total = 0,
                dice2Total = 0,
                dice3Total = 0,
                dice4Total = 0,
                dice5Total = 0;

            dataLogs.forEach((log) => {
                dice1Total += this.countDiceValue(log.result, 1);
                dice2Total += this.countDiceValue(log.result, 2);
                dice3Total += this.countDiceValue(log.result, 3);
                dice4Total += this.countDiceValue(log.result, 4);
                dice5Total += this.countDiceValue(log.result, 5);
            });

            const length = dataLogs.length;

            const dice1Percentage = Math.round((dice1Total / (length * 3)) * 100);
            const dice2Percentage = Math.round((dice2Total / (length * 3)) * 100);
            const dice3Percentage = Math.round((dice3Total / (length * 3)) * 100);
            const dice4Percentage = Math.round((dice4Total / (length * 3)) * 100);
            const dice5Percentage = Math.round((dice5Total / (length * 3)) * 100);
            const dice6Percentage = 100 - (dice1Percentage + dice2Percentage + dice3Percentage + dice4Percentage + dice5Percentage);

            this.lblSpecific1.string = `${dice1Percentage}%`;
            this.lblSpecific2.string = `${dice2Percentage}%`;
            this.lblSpecific3.string = `${dice3Percentage}%`;
            this.lblSpecific4.string = `${dice4Percentage}%`;
            this.lblSpecific5.string = `${dice5Percentage}%`;
            this.lblSpecific6.string = `${dice6Percentage}%`;
        }
    }

    countDiceValue(result: any, value: number) {
        let count = 0;
        if (result.dice1 === value) {
            count++;
        }
        if (result.dice2 === value) {
            count++;
        }
        if (result.dice3 === value) {
            count++;
        }

        return count;
    }
}
