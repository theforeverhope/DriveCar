import { _decorator, Component, LabelComponent } from 'cc';
import { CustomEventListener } from '../CustomEventListener';
import { Constant } from '../constant/Constant';
import { RunTimeData } from '../constant/RunTimeData';
const { ccclass, property } = _decorator;

@ccclass('mainUI')
export class mainUI extends Component {
    @property({
        type: LabelComponent
    })
    moneyLabel: LabelComponent = null;

    protected onEnable(): void {
        this.moneyLabel.string = `${RunTimeData.instance().curMoney}`;
    }

    public clickStart() {
        CustomEventListener.dispatch(Constant.EventName.GAME_START);
    }

    public show() {
        // this.node.active = true;
    }

    public hide() {
        // this.node.active = false;
    }
}


