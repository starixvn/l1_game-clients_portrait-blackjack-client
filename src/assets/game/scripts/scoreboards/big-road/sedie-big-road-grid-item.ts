import { Node, _decorator } from "cc";
import { ScoreboardBigRoadItem } from "db://shared-components/game/scoreboards/scripts/components/scoreboard-big-road-item";
import { ScoreboardDataConverter } from "db://shared-components/game/scoreboards/scripts/components/scoreboard-converter";
import { BigRoadPoint } from "db://shared-components/game/scoreboards/scripts/helpers/scoreboard-big-road-helper";
import { ScoreboardItemState } from "db://shared-components/game/scoreboards/scripts/models/scoreboard-item-state";
import { GridItemSettings } from "db://shared-components/shared/common-components/grid-layout/scripts/settings/grid-item-settings";

const { ccclass } = _decorator;

@ccclass
export class SeDieBigRoadGridItem<T> extends ScoreboardBigRoadItem<T> {
    createState(_: GridItemSettings, point?: BigRoadPoint<T>, container?: Node): ScoreboardItemState {
        const converter = container.getComponent(ScoreboardDataConverter);

        return {
            status: this.getStatus(point, converter),
            tie: this.countTie(point, converter),
            data: point.data,
        };
    }
}
