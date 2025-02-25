import "./../../../resources/i18n";

import gc from "@sg/game-client-base";
import { _decorator, Game, game, Label, Node } from "cc";
import { AudioContainer } from "db://shared-components/game/audios/scripts/component/audio-container";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import { GameComponentBase } from "db://shared-components/game/scripts/components/game-component-base";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { GameResult } from "./game-result";
import { StaticNode } from "db://shared-components/shared/common-components/static-node/scripts/static-node";
import { StaticGroupId } from "db://shared-components/shared/common-components/static-node/scripts/static-node-info";
import { ComponentUtils } from "db://shared-components/shared/utils";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);
const { Connection, FormatUtils, GameBlackjack } = gc;
// const { Rounds } = GameBlackjack;

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
@observer(settings.name)
export default class GameBlackjackComponent extends GameComponentBase {
    @property(Label)
    lblMinBet: Label = null;

    @property(Label)
    lblMaxBet: Label = null;

    @property(ChipFlying)
    chipFlying: ChipFlying = null;

    @property(Node)
    nodeAudioContainer: Node = null;

    @property(GameResult)
    resultComp: GameResult = null;

    override namespace = settings.name;
    protected enableFixHandleFinish = true;
    protected enableEventShowHideGame = true;

    private audioContainer: AudioContainer = null;
    private isAnimatingResult = false;
    private prevResult: any;
    private currentRoundId: number;

    onLoad() {
        this.registerEventShowHideGame();
        this.initUserSettings();
        this.initPlayerSelections();
        this.handleStaticNodeAndSetEmptyLabels();
        this.audioContainer = this.nodeAudioContainer.getComponent(AudioContainer);
    }

    private registerEventShowHideGame() {
        if (!this.enableEventShowHideGame) {
            return;
        }
        game.on(Game.EVENT_HIDE, this.onHideGame, this);
        game.on(Game.EVENT_SHOW, this.onShowGame, this);
    }

    protected handleStaticNodeAndSetEmptyLabels() {
        const lblList: Label[] = [this?.lblMinBet, this?.lblMaxBet];
        if (lblList.length > 0) {
            lblList?.forEach((label) => {
                if (label) {
                    const component = label?.addComponent(StaticNode);
                    component && (component.groupId = StaticGroupId.TextContainer);
                }
            });
            ComponentUtils.setEmptyLabels(lblList);
        }
    }

    @handle(gc.UserSettings.UserSettingHandlers, (handle) => handle.loadStorages())
    initUserSettings() {}

    @handle(gc.PlayerSelections.PlayerSelectionHandlers.InitHandlers)
    initPlayerSelections() {}

    protected onDestroy(): void {
        this.clearEventShowHideGame();
    }

    private clearEventShowHideGame() {
        game.off(Game.EVENT_HIDE, this.onHideGame, this);
        game.off(Game.EVENT_SHOW, this.onShowGame, this);
    }

    private onShowGame() {
        window.location.reload();
    }

    private onHideGame() {}

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler)
    connectToService() {}

    @render(gc.GameConfigs.GameSetting, (gameSetting) => gameSetting.name)
    logLoadScene(gameName: string) {
        console.log(`LoadScene ${gameName}`);
    }

    @render(Connection.ConnectionStore, (store) => store.signedIn)
    onSignedIn(signedIn: boolean) {
        signedIn && this.inGame();
    }

    @handle(Connection.ConnectionHandlers.InGameHandler)
    inGame() {}

    // @render(Rounds.RoundStore, (store) => ({ minBet: store.minBet, maxBet: store.maxBet }))
    // renderMinMaxBet({ minBet, maxBet }: { minBet: number; maxBet: number }) {
    //     this.lblMinBet && (this.lblMinBet.string = FormatUtils.numberWithCommas(minBet));
    //     this.lblMaxBet && (this.lblMaxBet.string = FormatUtils.numberWithCommas(maxBet));
    // }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }
}
