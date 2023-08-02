import { _decorator, Component, Node } from 'cc';
import { MapManager } from './MapManager';
import { CarManager } from './CarManager';
import { AudioManager } from './AudioManager';
import { Constant } from './constant/Constant';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    @property({
        type: MapManager
    })
    mapManager = null;

    @property({
        type: CarManager
    })
    carManager = null;

    public onLoad() {
        this.mapManager.resetMap();
        this.carManager.resetCar(this.mapManager.curPath);
    }

    public start() {
        this.node.on(Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
        AudioManager.playMusic(Constant.AudioSource.BACKGROUND);
    }

    private _touchStart(touch: Touch, event: TouchEvent) {
        this.carManager.controlRunning(true);
    } 

    private _touchEnd(touch: Touch, event: TouchEvent) {
        this.carManager.controlRunning(false);
    } 

    update(deltaTime: number) {
        
    }
}


