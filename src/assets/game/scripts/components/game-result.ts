import gc from "@sg/game-client-base";
import { _decorator, Label, Node, sp, SpriteAtlas, SpriteFrame, tween, UIOpacity, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils } from "db://shared-components/shared/utils/utils";
import Observer from "observer";

import { ResultDice } from "./result-dice";

const { ccclass, property } = _decorator;
const { render } = Observer;

const { Rounds, Translator } = gc;

interface IResultDiceFrames {
    dice1: SpriteFrame[];
    dice2: SpriteFrame[];
    dice3: SpriteFrame[];
}

@ccclass("GameResult")
export class GameResult extends ObserverComponent {
    @property(ResultDice)
    dicesComponent: ResultDice[] = [];

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    @property(SpriteAtlas)
    diceAtlas: SpriteAtlas = null;

    @property(Node)
    nodeResult: Node = null;

    @property(Label)
    lblResult: Label = null;

    private resultDiceFrames: IResultDiceFrames;
    private diceSpriteFrames: SpriteFrame[] = [];
    private readonly DICE_POSITION_NUMBER = 7;
    private readonly LOOP_NUMBER = 2;
    private readonly DICE_END_FRAME = 11;
    private readonly RESULT_DURATION = 1.4;

    onLoad() {
        this.setResultTextVisibility(false);
        this.resetResultDiceFrames();
        this.initDiceSpriteFrames();
        super.onLoad();
    }

    private initDiceSpriteFrames() {
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    private resetResultDiceFrames() {
        this.resultDiceFrames = { dice1: [], dice2: [], dice3: [] };
    }

    private stopAllDiceAnimation() {
        this.dicesComponent.forEach((dice) => dice.stopAnimation());
    }

    private getDiceAnimationName(roundId: number): string {
        const position = roundId % this.DICE_POSITION_NUMBER || this.DICE_POSITION_NUMBER;
        const nextPosition = (position % this.DICE_POSITION_NUMBER) + 1;

        console.log("getDiceAnimationName", `s${position}-e${nextPosition}`);
        return `s${position}-e${nextPosition}`;
    }

    showResultNoAnim(result: any, roundId: number) {
        this.stopAllDiceAnimation();
        this.diceSkeleton && AnimationUtils.pauseSpineAnimation(this.diceSkeleton, 1, this.getDiceAnimationName(roundId));
        this.dicesComponent.forEach((dice, index) => {
            const endPos = result[`dice${index + 1}`];
            const frame = this.diceSpriteFrames.find((spriteFrame) => spriteFrame.name === `end-${endPos}-${this.DICE_END_FRAME}`);
            dice.setFrame(frame);
        });
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartingRound)
    hideResultText(isStartingRound: boolean) {
        if (isStartingRound) {
            this.setResultTextVisibility(false);
        }
    }

    setResultTextVisibility(isShow: boolean) {
        if (!this.nodeResult) {
            return;
        }

        this.nodeResult.active = isShow;
        const opacityComp = this.nodeResult.getComponent(UIOpacity);

        if (!isShow) {
            opacityComp.opacity = 0;
            return;
        }

        tween(this.nodeResult)
            .to(0.2, { scale: v3(1.2, 1.2, 1.2) }, { easing: "bounceOut" })
            .parallel(tween().to(0.3, { scale: v3(1, 1, 1) }), tween(opacityComp).to(0.3, { opacity: 255 }))
            .start();
    }

    showResultText(result: any) {
        const choiceWin = this.determineWinningChoice(this.calcTotalPoints(result));
        this.setResultText(choiceWin.toUpperCase());
        this.setResultTextVisibility(true);
    }

    calcTotalPoints(result: any): number {
        return ["dice1", "dice2", "dice3"].map((key) => result[key]).reduce((sum, value) => sum + value, 0);
    }

    determineWinningChoice(totalPoints: number): string {
        const winChoice = totalPoints > 6 ? "SicBo.glossary_big" : "SicBo.glossary_small";
        return `${totalPoints} - ${Translator.translate(winChoice)}`;
    }

    setResultText(value: string) {
        if (!this.lblResult || !value) {
            return;
        }

        this.lblResult.string = value;
    }

    async showResultAnim(prevResult: any, result: any, roundId: number) {
        this.resetResultDiceFrames();
        this.stopAllDiceAnimation();
        this.setResultDiceFrames(prevResult, result);
        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, this.getDiceAnimationName(roundId), false, this.RESULT_DURATION);
        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`], this.RESULT_DURATION);
        });
        await AnimationUtils.delayTime(this.RESULT_DURATION);
        this.showResultText(result);
    }

    private getRandomNumber(max: number): number {
        return Math.floor(Math.random() * max) + 1;
    }

    private setResultDiceFrames(prevResult: any, result: any) {
        for (let i = 0; i < this.dicesComponent.length; i++) {
            const startPos = prevResult[`dice${i + 1}`];
            const endPos = result[`dice${i + 1}`];
            const files = [`start-${startPos}`, `loop-${this.getRandomNumber(this.LOOP_NUMBER)}`, `end-${endPos}`];

            for (const file of files) {
                const matchingFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(file));
                this.resultDiceFrames[`dice${i + 1}`].push(...matchingFrames);
            }
        }
    }
}
