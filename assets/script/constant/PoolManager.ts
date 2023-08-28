import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
    public static handle = new Map<string, Node[]>();

    start() {

    }

    update(deltaTime: number) {
        
    }

    public static getNode(prefab: Prefab, parent: Node) {
        const name = prefab.name;
        let node: Node = null;
        if (this.handle.has(name) && this.handle.get(name).length > 0) {
            node = this.handle.get(name).pop();
        } else {
            node = instantiate(prefab) as Node;
        }

        node.setParent(parent);
        return node;
    }

    public static setNode(target: Node) {
        const name = target.name;
        target.setParent(null);

        if (this.handle.has(name)) {
            this.handle.get(name).push(target);
        } else {
            this.handle.set(name, [target]);
        }
    }
}


