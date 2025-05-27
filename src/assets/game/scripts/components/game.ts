import "./../../../resources/i18n";

import gc from "@sg/game-client-base";
import { _decorator, Game, game, Label, Node, Prefab, Vec3 } from "cc";
import { AudioContainer } from "db://shared-components/game/audios/scripts/component/audio-container";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import { GameComponentBase } from "db://shared-components/game/scripts/components/game-component-base";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { StaticNode } from "db://shared-components/shared/common-components/static-node/scripts/static-node";
import { StaticGroupId } from "db://shared-components/shared/common-components/static-node/scripts/static-node-info";
import { ComponentUtils } from "db://shared-components/shared/utils";
import { HandsContainer } from "./hands-container";
import { DealerComponent } from "./dealer";
import SlidingChip from "db://shared-components/game/sliding-chip/scripts/components/sliding-chip";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);
const { Connection, FormatUtils, GameBlackjack } = gc;
const { Rounds, Bets, BlackjackActions } = GameBlackjack;

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
@observer(settings.name)
export default class GameBlackjackComponent extends GameComponentBase {
    @property(Label)
    lblMinBet: Label = null;

    @property(Label)
    lblMaxBet: Label = null;

    @property(Label)
    lblTotalBetAmount: Label = null;

    @property(ChipFlying)
    chipFlying: ChipFlying = null;

    @property(Node)
    nodeAudioContainer: Node = null;

    @property(HandsContainer)
    handsContainer: HandsContainer = null;

    @property(DealerComponent)
    dealer: DealerComponent = null;

    @property(Node)
    cardBox: Node = null;

    @property(Prefab)
    prbCard: Prefab = null;

    @property(Node)
    btnDeal: Node = null;

    @property(Node)
    btnClear: Node = null;

    @property(Node)
    btnHit: Node = null;

    @property(Node)
    btnStand: Node = null;

    @property(Node)
    btnDouble: Node = null;

    @property(Node)
    btnSplit: Node = null;

    @property(Node)
    btnRebet: Node = null;

    @property(Node)
    btnNewBet: Node = null;

    override namespace = settings.name;
    protected enableFixHandleFinish = true;
    protected enableEventShowHideGame = true;

    protected cardBoxPosition = Vec3.ZERO;
    protected chipBoxPosition = Vec3.ZERO;
    private audioContainer: AudioContainer = null;
    private isAnimating = false;
    private prevResult: any;
    private currentRoundId: number;

    private isFinish = false;

    onLoad() {
        this.registerEventShowHideGame();
        this.initUserSettings();
        this.initPlayerSelections();
        this.handleStaticNodeAndSetEmptyLabels();
        this.audioContainer = this.nodeAudioContainer.getComponent(AudioContainer);
        this.cardBoxPosition = this.cardBox?.worldPosition || Vec3.ZERO;
        this.chipBoxPosition = this.chipFlying.node?.worldPosition || Vec3.ZERO;
        this.dealer?.init(this.cardBoxPosition, this.chipBoxPosition, this.prbCard);
        this.handsContainer?.init(this.cardBoxPosition, this.chipFlying, this.prbCard);
    }

    protected registerEventShowHideGame() {
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
    protected initUserSettings() {}

    @handle(gc.PlayerSelections.PlayerSelectionHandlers.InitHandlers)
    protected initPlayerSelections() {}

    protected onDestroy(): void {
        this.clearEventShowHideGame();
    }

    protected clearEventShowHideGame() {
        game.off(Game.EVENT_HIDE, this.onHideGame, this);
        game.off(Game.EVENT_SHOW, this.onShowGame, this);
    }

    protected onShowGame() {
        window.location.reload();
    }

    protected onHideGame() {}

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler)
    connectToService() {}

    @render(gc.GameConfigs.GameSetting, (gameSetting) => gameSetting.name)
    logLoadScene(gameName: string) {
        console.log(`LoadScene ${gameName}`);
    }

    @render(Connection.ConnectionStore, (store) => store.signedIn)
    protected onSignedIn(signedIn: boolean) {
        signedIn && this.inGame();
    }

    @handle(Connection.ConnectionHandlers.InGameHandler)
    protected inGame() {}

    @render(Rounds.RoundStore, (store) => ({ minBet: store.minBet, maxBet: store.maxBet }))
    protected renderMinMaxBet({ minBet, maxBet }: { minBet: number; maxBet: number }) {
        this.lblMinBet && (this.lblMinBet.string = FormatUtils.numberWithCommas(minBet));
        this.lblMaxBet && (this.lblMaxBet.string = FormatUtils.numberWithCommas(maxBet));
    }

    @render(Rounds.RoundStore, (store) => store.totalBetAmount)
    protected renderTotalBetAmount(totalBetAmount: number) {
        totalBetAmount > 0 && this.lblTotalBetAmount && (this.lblTotalBetAmount.string = FormatUtils.numberWithCommas(totalBetAmount));
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    protected playSound(id: string) {
        return id;
    }

    @handle(Bets.DealHandler)
    onBtnDealClick() {}

    onBtnClearClick(): number | void {
        this.clearHandStore();
        this.handsContainer.reset();
    }

    @handle(Bets.ClearHandler)
    clearHandStore() {
        return this.handsContainer.hands.length / 2;
    }

    @handle(Bets.DoubleHandler)
    onBtnDoubleClick() {}

    @handle(Bets.SplitHandler)
    onBtnSplitClick() {}

    @handle(Bets.HitHandler)
    onBtnHitClick() {}

    @handle(Bets.StandHandler)
    onBtnStandClick() {}

    @handle(Bets.RebetHandler)
    onBtnRebetClick(): number | void {
        this.onBtnNewBetClick();
        return this.handsContainer.hands.length / 2;
    }

    @handle(Bets.NewBetHandler)
    onBtnNewBetClick() {
        this.handsContainer?.reset();
        this.dealer?.reset();
    }

    @render(Rounds.RoundStore, (store) => store.action, { fireImmediately: false })
    protected async handleActions(action: string) {
        switch (action) {
            case BlackjackActions.FINISH:
                this.handleFinish();
                break;
            case BlackjackActions.RUNNING:
                await this.handleJoinGame();
                break;
            case BlackjackActions.DEAL:
                await this.handleDealCards();
                break;
            case BlackjackActions.HIT:
                await this.handleHitCard();
                break;
            case BlackjackActions.STAND:
                await this.handleStand();
                break;
            case BlackjackActions.DOUBLE:
                await this.handleHitCard();
                break;
            case BlackjackActions.SPLIT:
                await this.handleSplit();
                break;
        }

        // TODO: update visibility of buttons
    }

    private finishGame() {
        // TODO: show result
        this.dealer?.openCards();
        // TODO: settle
    }

    protected async handleJoinGame() {
        await this.handsContainer?.openCards();
        await this.dealer?.openCards();
    }

    protected async handleDealCards() {
        this.isFinish = false;
        await this.handsContainer?.dealFirstCards();
        await this.dealer?.dealFirstCard();
        await this.handsContainer?.dealSecondCards();
        await this.dealer?.dealSecondCard();
        await this.handsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    protected async handleHitCard() {
        this.isFinish = false;
        await this.handsContainer?.hitCard();
        await this.handsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    protected async handleStand() {
        this.isFinish = false;
        await this.handsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    // protected async handleDouble() {
    //     this.isFinish = false;
    //     await this.handsContainer?.hitCard(this.cardBoxPosition);
    //     this.handsContainer?.setActiveHand();
    //     this.isFinish && this.showResult();
    // }

    protected async handleSplit() {
        // TODO: handle split
        await this.handsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    protected async handleFinish() {
        this.isFinish = true;
    }
}
