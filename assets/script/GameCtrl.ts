import { _decorator, BoxColliderComponent, Component, instantiate, loader, Node, Prefab, Vec3 } from 'cc';
import { MapManager } from './MapManager';
import { CarManager } from './CarManager';
import { AudioManager } from './AudioManager';
import { Constant } from './constant/Constant';
import { UIManager } from './ui/UIManager';
import { CustomEventListener } from './CustomEventListener';
import { PlayerData, RunTimeData } from './constant/RunTimeData';
import { Configuration } from './constant/Configuration';
import { LoadingUI } from './ui/LoadingUI';
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

    @property({
        type: Node
    })
    ground = null;

    @property({
        type: LoadingUI
    })
    loadingUI: LoadingUI = null;

    public onLoad() {
        this.loadingUI.show();
        Configuration.instance().init();
        PlayerData.instance().loadCache();
        CustomEventListener.on(Constant.EventName.GAME_START, this._gameStart, this);
        CustomEventListener.on(Constant.EventName.GAME_OVER, this._gameOver, this);
        CustomEventListener.on(Constant.EventName.NEW_LEVEL, this._newLevel, this);
    }

    public start() {
        this._loadMap(RunTimeData.instance().curLevel);
        this.node.on(Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
        AudioManager.playMusic(Constant.AudioSource.BACKGROUND);

        const collider = this.ground.getComponent(BoxColliderComponent);
        collider.setGroup(Constant.CarGroup.NORMAL);
        collider.setMask(-1);
    }

    private _touchStart(touch: Touch, event: TouchEvent) {
        this.carManager.controlRunning(true);
    } 

    private _touchEnd(touch: Touch, event: TouchEvent) {
        this.carManager.controlRunning(false);
    } 

    private _gameStart() {
        UIManager.hideDialog(Constant.UIPage.mainUI);
        UIManager.showDialog(Constant.UIPage.gameUI);
    }

    private _gameOver() {
        UIManager.hideDialog(Constant.UIPage.gameUI);
        UIManager.showDialog(Constant.UIPage.resultUI);
    }

    private _newLevel() {
        if (RunTimeData.instance().curLevel > Constant.MaxLevel) {
            return;
        }
        UIManager.hideDialog(Constant.UIPage.resultUI);
        UIManager.showDialog(Constant.UIPage.mainUI);
        this.loadingUI.show();
        this.mapManager.recycle();
        this._loadMap(RunTimeData.instance().curLevel);
    }

    private _loadMap(level: number, cb?: Function) {
        let map = `map/map10${level}`;
        loader.loadRes(map, Prefab, (err: any, prefab: Prefab) => {
            if (err) {
                console.error(err);
                return;
            }

            const mapNode = instantiate(prefab) as Node;
            mapNode.setParent(this.mapManager.node);
            if (cb) {
                cb();
            }
            this._reset();
            UIManager.showDialog(Constant.UIPage.mainUI);
            this.loadingUI.hide();
        })
    }

    private _reset() {
        if (this.node.children[2] && this.node.children[2].name === 'resultUI') {
            this.node.children[2].parent = null;
        }
        this.mapManager.resetMap();
        this.carManager.resetCar(this.mapManager.curPath);
        RunTimeData.instance().money = 0;
        RunTimeData.instance().curProgress = 0;
        RunTimeData.instance().maxProgress = this.mapManager.maxProgress;
    }

    update(deltaTime: number) {
        
    }
}


