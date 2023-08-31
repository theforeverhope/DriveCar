import { _decorator, Component, Node } from 'cc';
import { GameMap } from './GameMap';
const { ccclass, property } = _decorator;

@ccclass('MapManager')
export class MapManager extends Component {
    public curPath: Node[] = [];
    public maxProgress = 0;

    private _curMap: Node = null; 

    public resetMap() {
        this._curMap = this.node.children[0];
        const curMap = this._curMap.getComponent(GameMap);
        this.curPath = curMap.path;
        this.maxProgress = curMap.maxProgress;
    }

    public recycle() {
        if (this._curMap) {
            this._curMap.destroy();
            this._curMap = null;
        }
    }
}


