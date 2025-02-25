import { _decorator, Component, Label, Node } from "cc";

const { ccclass, property } = _decorator;

export class BetPlace extends Component {
    @property(Label)
    lblBetAmount: Label = null;

    @property(Node)
    nodeBgBetAmount: Node = null;

    setBetAmount(amount: number) {
        this.lblBetAmount && (this.lblBetAmount.string = amount ? amount.toString() : "");
        this.nodeBgBetAmount && (this.nodeBgBetAmount.active = !!amount);
    }
}
