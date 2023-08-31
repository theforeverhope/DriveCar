import { _decorator, Component, LabelComponent, SpriteComponent, SpriteFrame } from 'cc';
import { PlayerData, RunTimeData } from '../constant/RunTimeData';
import { CustomEventListener } from '../CustomEventListener';
import { Constant } from '../constant/Constant';
const { ccclass, property } = _decorator;

@ccclass('resultUI')
export class resultUI extends Component {
    @property({
        type: LabelComponent,
        displayOrder: 1,
    })
    targetLevel: LabelComponent = null;

    @property({
        type: LabelComponent,
        displayOrder: 2,
    })
    sourceLevel: LabelComponent = null;

    @property({
        type: SpriteComponent,
        displayOrder: 3,
    })
    targetSp: SpriteComponent = null;

    @property({
        type: SpriteComponent,
        displayOrder: 4,
    })
    sourceSp: SpriteComponent = null;

    @property({
        type: SpriteFrame,
        displayOrder: 5,
    })
    levelFinished: SpriteFrame = null;

    @property({
        type: SpriteFrame,
        displayOrder: 6,
    })
    levelUnFinished: SpriteFrame = null;

    @property({
        type: [SpriteComponent],
        displayOrder: 7,
    })
    progress: SpriteComponent[] = [];

    @property({
        type: SpriteFrame,
        displayOrder: 8,
    })
    progress1: SpriteFrame = null;

    @property({
        type: SpriteFrame,
        displayOrder: 9,
    })
    progress2: SpriteFrame = null;

    @property({
        type: SpriteFrame,
        displayOrder: 10,
    })
    progress3: SpriteFrame = null;

    @property({
        type: LabelComponent,
        displayOrder: 11,
    })
    progressLabel: LabelComponent = null;

    @property({
        type: LabelComponent,
        displayOrder: 12,
    })
    moneyLabel: LabelComponent = null;

    public show() {
        const runtimeData = RunTimeData.instance();
        const maxProgress = runtimeData.maxProgress;
        const curProgress = runtimeData.curProgress;
        const money = runtimeData.money;
        let index = 0;

        for (let i = 0; i < this.progress.length; i++) {
            const progress = this.progress[i];

            if (i >= maxProgress) {
                progress.node.active = false;
            } else {
                progress.node.active = true;
                index = maxProgress - 1 - i;
                if (index >= curProgress) {
                    progress.spriteFrame = (index === curProgress && !runtimeData.isTakeOver) ? this.progress2 : this.progress3;
                } else {
                    progress.spriteFrame = this.progress1;
                }
            }
        }

        const level = runtimeData.curLevel;
        this.sourceLevel.string = `${level}`;
        this.targetLevel.string = `${level+1}`;
        this.sourceSp.spriteFrame = this.levelFinished;
        this.targetSp.spriteFrame = curProgress === maxProgress ? this.levelFinished : this.levelUnFinished;
        this.progressLabel.string = `你完成了 ${curProgress} 个订单`;
        this.moneyLabel.string = `${money}`;
    }

    public hide() {
    //     console.log(this.node, this.node.parent)
    //     this.node.active = false;
    }

    public getBtnNormal() {
        const runtimeData = RunTimeData.instance();
        if (runtimeData.curProgress === runtimeData.maxProgress) {
            PlayerData.instance().passLevel(RunTimeData.instance().money);
        }
        CustomEventListener.dispatch(Constant.EventName.NEW_LEVEL);
    }
}
