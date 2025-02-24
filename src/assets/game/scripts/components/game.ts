import "./../../../resources/i18n";

import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { AudioContainer } from "db://shared-components/game/audios/scripts/component/audio-container";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { GameResult } from "./game-result";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces.concat(["Baccarat", "ui"]));
const { Rounds, RoundHistories } = gc;

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property(ChipFlying)
    chipFlying: ChipFlying = null;
    override namespace = settings.name;
    override containerOptions = containerOptions;

    @property(Node)
    nodeAudioContainer: Node = null;

    @property(GameResult)
    resultComp: GameResult = null;

    protected enableFixHandleFinish = true;
    private audioContainer: AudioContainer = null;
    private isAnimatingResult = false;
    private prevResult: any;
    private currentRoundId: number;

    onLoad() {
        this.audioContainer = this.nodeAudioContainer.getComponent(AudioContainer);

        super.onLoad();
    }

    @render(Rounds.RoundStore, (store) => store.clientRoundId)
    updateCurrentRoundId(roundId: number) {
        roundId > 0 && (this.currentRoundId = roundId);
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.histories)
    async updatePrevResult(histories: gc.RoundHistories.RoundHistory) {
        if (!histories) {
            return;
        }
        this.prevResult = histories[0]?.result;
    }

    async showResult(
        result: gc.GameServiceMessage.TResult,
        hasAnimation: boolean,
        settlementResult: gc.GameServiceMessage.TSettlementResult
    ) {
        if (result) {
            if (this.isAnimatingResult) {
                return;
            }
            this.isAnimatingResult = true;

            if (hasAnimation) {
                this.playSound("dice_shake");
                await this.resultComp.showResultAnim(this.prevResult, result, this.currentRoundId);
            } else {
                this.resultComp?.showResultNoAnim(result, this.currentRoundId);
            }

            this.isAnimatingResult = false;
        }
    }

    async renderCurrentFinish(currentFinish: gc.GameServiceMessage.Finish) {
        if (!currentFinish || !this.enableFixHandleFinish) {
            return;
        }
        const { result, settlementResult } = currentFinish as any;

        if (!this.isValidResult(result, settlementResult)) {
            return;
        }

        this.showResult(result, true, settlementResult).then(() => {
            this.finishShowResult(result, settlementResult);
            this.chipFlying.callActionPayChips();
        });
        this.playSound(gc.Audios.AudioIds.RECEIVE_FINISH);
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    async renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }

        const lastRound = firstJoinGameHistory.roundHistory as any;
        if (lastRound) {
            const { result, settlementResult } = lastRound;
            this.showResult(result, false, settlementResult);
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.roundState)
    fadeVolumeBgMusic(roundState: string) {
        if (roundState === Rounds.ROUND_STATE.LOCKING_BET) {
            this.audioContainer.updateVolumeMusicSource(0.3, 3);
        } else if (roundState === Rounds.ROUND_STATE.SHOW_RESULT) {
            this.audioContainer.updateVolumeMusicSource(1, 3);
        }
    }
}
