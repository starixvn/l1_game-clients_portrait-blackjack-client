import { _decorator } from "cc";
import gc from "@sg/game-client-base";
import BetDetailDirectBodyItem from "db://direct-shared-components/bet-history/scripts/bet-detail-direct-body-item";
import { GameRoundBetDetailsLog } from "db://shared-components/game/bet-history/scripts/components/bet-detail/bet-detail-log-item";
import { CHOICE_TO_NUMBER, ODD_CHOICE } from "./bet-detail-sicbo-constant";

const { ccclass, property } = _decorator;
const { FormatUtils, Translator } = gc;

@ccclass
export class BetDetailLogSicboItem extends BetDetailDirectBodyItem {
    oddAfterCalculateOddsSpecificChoice = 0;
    isWinningBet = false;

    setData(data) {
        super.setData(data);
        this.setChoiceLabel(data.betDetailsLog.choice);
    }

    parseOddByData(data) {
        const { betDetailsLog, odds, result, fractionalOddsFormat } = data;
        const choiceNumber = CHOICE_TO_NUMBER[betDetailsLog.choice];

        let oddsValue = 0;
        if (choiceNumber === undefined) {
            oddsValue = odds[betDetailsLog.choice];
        } else {
            oddsValue = this.calculateOddsSpecificChoice(choiceNumber, odds, result);
        }

        this.lblOdds.string = this.formatOdds(oddsValue, fractionalOddsFormat);
    }

    private setChoiceLabel(choice: string) {
        const choiceNumber = CHOICE_TO_NUMBER[choice];
        this.lblChoice.string =
            choiceNumber !== undefined
                ? `${Translator.gameTranslate("glossary_specific")} - ${choiceNumber}`
                : Translator.gameTranslate(`glossary_${choice}`);
    }

    calculateOddsSpecificChoice(choiceNumber: number, odds: any, result: any) {
        const occurrenceCount = [result.dice1, result.dice2, result.dice3].filter((dice) => dice === choiceNumber).length;

        this.isWinningBet = occurrenceCount > 0;
        this.oddAfterCalculateOddsSpecificChoice =
            odds?.[[ODD_CHOICE.SINGLE, ODD_CHOICE.DOUBLE, ODD_CHOICE.TRIPLE][occurrenceCount - 1]] || odds?.single;

        return this.oddAfterCalculateOddsSpecificChoice;
    }

    formatOdds(oddsValue, fractionalOddsFormat) {
        return fractionalOddsFormat ? FormatUtils.numberWithCommas(+oddsValue - 1, 2) : oddsValue.toString();
    }

    protected calculateWinValue(data) {
        const { betDetailsLog, freeBet } = data;
        const { amount, choice } = betDetailsLog as GameRoundBetDetailsLog & gc.BetHistory.DynamicObject<object>;

        const choiceNumber = CHOICE_TO_NUMBER[choice];
        const isChoiceSpecific = choiceNumber !== undefined;

        if (isChoiceSpecific && this.isWinningBet) {
            this.setWinValue(amount, this.oddAfterCalculateOddsSpecificChoice, freeBet);
            return;
        }

        super.calculateWinValue(data);
    }

    private setWinValue(amount: number, rawOdd: number, freeBet = false) {
        const effectiveOdds = freeBet ? rawOdd - 1 : rawOdd;
        const winningAmount = amount * effectiveOdds;
        this.lblWin.string = FormatUtils.numberWithCommas(winningAmount, 2);
        this.setHighlightTicketDetail(winningAmount > amount);
    }
}
