import gc from "@sg/game-client-base";
import { _decorator, Color, Component, Label, Node, Sprite, SpriteAtlas } from "cc";
const { ccclass, property } = _decorator;

const enum Choice {
    anyTriple = "anyTriple",
    big = "big",
    small = "small",
}

@ccclass("round_result_item")
export class RoundResultItem extends Component {
    @property({ type: Node })
    dices: Node[] = [];

    @property(Label)
    lblResult: Label = null;

    @property(Label)
    lblTotalPoint: Label = null;

    @property(Node)
    highlight: Node = null;

    @property(SpriteAtlas)
    mainAtlas: SpriteAtlas = null;

    private mainChoice = ["anyTriple", "big", "small"];
    private choiceColors = ["ffc514", "ff4848", "3a8eff"];

    setData(data: any) {
        const { result, settlementResult } = data;
        this.mainChoice.forEach((choice, index) => {
            if (settlementResult[choice]) {
                this.lblResult.string = gc.Translator.gameTranslate(`scoreboard_${choice}`);
                this.lblResult.color = new Color().fromHEX(this.choiceColors[index]);
            }
        });

        let totalPoint = 0;
        Object.keys(result).forEach((key) => {
            const dice = this.dices.find((item) => item.name === key);
            dice.getComponent(Sprite).spriteFrame = this.mainAtlas.getSpriteFrame(`dice-${result[key]}`);
            totalPoint += result[key];
        });
        this.lblTotalPoint.string = totalPoint.toString();
    }
}
