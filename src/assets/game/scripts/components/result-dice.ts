import { _decorator, Component, Sprite, SpriteFrame, Tween, tween, UIOpacity } from "cc";

const { ccclass, property } = _decorator;

@ccclass("ResultDice")
export class ResultDice extends Component {
    @property(Sprite)
    diceSprite: Sprite = null;

    private diceAnimation: Tween = null;

    onLoad() {
        this.setOpacity(0);
    }

    setOpacity(opacity: number) {
        this.diceSprite.node.getComponent(UIOpacity).opacity = opacity;
    }

    setFrame(spriteFrame: SpriteFrame) {
        this.setOpacity(255);
        this.diceSprite.spriteFrame = spriteFrame;
    }

    stopAnimation() {
        this.diceAnimation?.stop();
    }

    runAnimation(resultDiceFrames: SpriteFrame[], duration: number) {
        let index = 0;
        const diceFramesNumber = resultDiceFrames.length;

        this.diceAnimation = tween(this.diceSprite.node)
            .repeat(
                diceFramesNumber,
                tween()
                    .delay(duration / diceFramesNumber)
                    .call(() => {
                        this.setFrame(resultDiceFrames[index]);
                        index++;
                    })
            )
            .start();
    }
}
