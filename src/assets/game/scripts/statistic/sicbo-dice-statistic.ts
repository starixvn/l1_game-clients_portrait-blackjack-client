import gc from "@sg/game-client-base";
import { _decorator, instantiate, Node, Prefab, ScrollView } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { RoundResultItem } from "./round-result-item";
const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("sicbo_dice_statistic")
export class SicboDiceStatistic extends ObserverComponent {
    @property(Prefab)
    roundResultPrefab: Prefab = null;

    @property(Node)
    content: Node = null;

    @property(Node)
    dicesScrollView: Node = null;

    @render(gc.RoundHistories.RoundHistoryStore, (store) => store.histories)
    updateData(dataLogs: any[]) {
        this.updateRoundResult(dataLogs);
        this.dicesScrollView.getComponent(ScrollView).scrollToRight();
    }

    updateRoundResult(dataLogs: any[]) {
        this.content.destroyAllChildren();

        for (let i = 0; i < dataLogs.length; i++) {
            const dataLog = dataLogs[i];
            const roundResultNode = instantiate(this.roundResultPrefab);
            const roundResultComponent = roundResultNode.getComponent(RoundResultItem);
            roundResultComponent.setData(dataLog);
            roundResultComponent.highlight.active = i === 0;
            this.content.addChild(roundResultNode);
        }
    }
}
