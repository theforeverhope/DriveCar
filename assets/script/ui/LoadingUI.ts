import { _decorator, Component, Node } from 'cc';
import { CustomEventListener } from '../CustomEventListener';
import { Constant } from '../constant/Constant';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends Component {
    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    protected onEnable(): void {
        CustomEventListener.on(Constant.EventName.LOADING, this.loading, this);
    }

    protected onDisable(): void {
        CustomEventListener.off(Constant.EventName.LOADING, this.loading, this);
    }

    public loading() {}
}


