import { _decorator, Component, instantiate, Node, ParticleSystemComponent, ParticleUtils, Prefab } from 'cc';
import { CustomEventListener } from './CustomEventListener';
import { Constant }  from './constant/Constant';
import { PoolManager } from './constant/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    @property({
        type: Prefab,
    })
    brake: Prefab = null;
    
    @property({
        type: Prefab,
    })
    coin: Prefab = null;

    private _followTarget: Node = null;
    private _curBraking: Node = null;

    private _coin: ParticleSystemComponent = null;

    public start() {
        CustomEventListener.on(Constant.EventName.START_BRAKING, this._startBraking, this);
        CustomEventListener.on(Constant.EventName.END_BRAKING, this._endBraking, this);
        CustomEventListener.on(Constant.EventName.START_COIN, this._startCoin, this);
    }

    public update(deltaTime: number) {
        if (this._curBraking && this._followTarget) {
            this._curBraking.setWorldPosition(this._followTarget.worldPosition);
        }
    }

    private _startBraking(...args: any[]) {
        const folow = this._followTarget = args[0];
        this._curBraking = PoolManager.getNode(this.brake, this.node);
        this._curBraking.setWorldPosition(folow);
        ParticleUtils.play(this._curBraking); // play all particles animation
    }

    private _endBraking() {
        const curBraking = this._curBraking;
        ParticleUtils.stop(this._curBraking); // stop all particles animation
        this.scheduleOnce(() => {
            PoolManager.setNode(curBraking);
        }, 2);
        this._curBraking = null;
        this._followTarget = null;
    }

    private _startCoin(...args: any[]) {
        const pos = args[0];
        if (!this._coin) {
            const coin = instantiate(this.coin) as Node;
            coin.setParent(this.node);
            this._coin = coin.getComponent(ParticleSystemComponent);
        }

        this._coin.node.setWorldPosition(pos);
        this._coin.play();
    }
}


