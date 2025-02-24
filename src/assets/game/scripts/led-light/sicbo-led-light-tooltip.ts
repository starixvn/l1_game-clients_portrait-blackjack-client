import gc from "@sg/game-client-base";
import { _decorator, Label, Layout } from "cc";
import { LedLightTooltip } from "db://shared-components/game/led-light/scripts/components/led-light-tooltip";
const { ccclass, property } = _decorator;

@ccclass("sicbo_led_light_tooltip")
export class SicboLedLightTooltip extends LedLightTooltip {
    @property({ type: Label })
    diceList: Label[] = [];

    @property(Layout)
    layoutResult: Layout = null;

    private mainChoice = ["anyTriple", "big", "small"];

    public setTooltipInfo(ledLightInfo: gc.RoundHistories.RoundHistory) {
        const { roundId, result, settlementResult } = ledLightInfo;
        this.roundId.string = `#${roundId}`;
        Object.keys(result).forEach((key) => {
            const dice = this.diceList.find((item) => item.node.name === key);
            dice.string = result[key].toString();
        });

        this.mainChoice.forEach((choice) => {
            if (settlementResult[choice]) {
                this.result.string = gc.Translator.gameTranslate(`glossary_${choice}`);
            }
        });
        this.layoutResult.updateLayout();
    }
}
