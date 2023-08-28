import { _decorator, Component, find, instantiate, loader, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    static _dictPanel = new Map<string, Node>();
    
    public static showDialog(name: string, cb?: Function, ...args: any[]) {
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name);
            const canvasNode = find("Canvas");
            panel.setParent(canvasNode);
            const comp = panel.getComponent(name);

            if (comp && comp['show']) {
                comp['show'].apply(comp, args);
            }

            if (cb) {
                cb();
            }

            return;
        }

        const path = `ui/${name}`;
        loader.loadRes(path, Prefab, (err: any, prefeb: Prefab) => {
            if (err) {
                console.error('load ui error ', err);
                return;
            }

            const panel = instantiate(prefeb) as Node;
            this._dictPanel.set(name, panel);
            const canvasNode = find("Canvas");
            panel.setParent(canvasNode);
            const comp = panel.getComponent(name);

            if (comp && comp['show']) {
                comp['show'].apply(comp, args);
            }

            if (cb) {
                cb();
            }
        })
    }

    public static hideDialog(name: string, cb?: Function) {
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name);
            panel.setParent(null);
            const comp = panel.getComponent(name);

            if (comp && comp['hide']) {
                comp['hide'].apply(comp);
            }

            if (cb) {
                cb();
            }
        }
    }
}


