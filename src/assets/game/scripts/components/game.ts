import "./../../../resources/i18n";
import { _decorator } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import GameBlackjackComponent from "db://blackjack-shared-components/components/game";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);

const { ccclass } = _decorator;
const { observer } = Observer;

@ccclass
@observer(settings.name)
export default class GameComponent extends GameBlackjackComponent {
    override namespace = settings.name;
}
