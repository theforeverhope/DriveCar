import { _decorator, Component } from 'cc';
import { CustomEventListener } from '../CustomEventListener';
import { Constant } from '../constant/Constant';
const { ccclass } = _decorator;

@ccclass('mainUI')
export class mainUI extends Component {
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


