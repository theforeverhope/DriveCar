import { _decorator, Component, Node, LabelComponent, SpriteComponent, SpriteFrame, loader, sp, AnimationComponent } from 'cc';
import { RunTimeData } from '../constant/RunTimeData';
import { CustomEventListener } from '../CustomEventListener';
import { Constant } from '../constant/Constant';
const { ccclass, property } = _decorator;

@ccclass('gameUI')
export class gameUI extends Component {
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
        type: SpriteComponent,
        displayOrder: 11,
    })
    avatar: SpriteComponent = null;

    @property({
        type: LabelComponent,
        displayOrder: 12,
    })
    talk: LabelComponent = null;

    @property({
        type: Node,
        displayOrder: 13,
    })
    talkNode: Node = null;

    @property({
        type: Node,
        displayOrder: 14,
    })
    guideNode: Node = null;

    private _runtimeData: RunTimeData = null;

    public show() {
        CustomEventListener.on(Constant.EventName.GREETING, this._greeting, this);
        CustomEventListener.on(Constant.EventName.GOODBYE, this._goodbye, this);
        CustomEventListener.on(Constant.EventName.SHOW_TALK, this._talking, this);
        CustomEventListener.on(Constant.EventName.SHOW_GUIDE, this._guiding, this);
    
        this._runtimeData = RunTimeData.instance();
        this._refreshUI();
        this._guiding(true);
    }

    public hide() {
        CustomEventListener.off(Constant.EventName.GREETING, this._greeting, this);
        CustomEventListener.off(Constant.EventName.GOODBYE, this._goodbye, this);
        CustomEventListener.off(Constant.EventName.SHOW_TALK, this._talking, this);
        CustomEventListener.off(Constant.EventName.SHOW_GUIDE, this._guiding, this);
    }

    private _greeting() {
        this.progress[this._runtimeData.maxProgress - 1 - this._runtimeData.curProgress].spriteFrame = this.progress2;
    }

    private _goodbye() {
        this.progress[this._runtimeData.maxProgress - this._runtimeData.curProgress].spriteFrame = this.progress1;
        if (this._runtimeData.maxProgress === this._runtimeData.curProgress) {
            this.targetSp.spriteFrame = this.levelFinished;
        }
    }

    private _talking(customerId: string) {
        const table = Constant.TalkTable;
        const index = Math.floor(Math.random() * table.length);
        const str = table[index];
        this.talk.string = str;
        this.talkNode.active = true;

        const path = `texture/head/head${customerId}/spriteFrame`;
        loader.loadRes(path, SpriteFrame, (err: any, spriteFrame: SpriteFrame) => {
            if (err) {
                console.error(err);
                return;
            }

            if (this.talkNode.active) {
                this.avatar.spriteFrame = spriteFrame;
            }
        })

        this.scheduleOnce(() => {
            this.talkNode.active = false;
        }, 1)
    }

    private _guiding(isShow: boolean) {
        this.guideNode.active = isShow;

        if (isShow) {
            const anim = this.guideNode.getComponent(AnimationComponent);
            anim.play("showGuide");
        }
    }

    private _refreshUI() {
        for (let i=0; i < this.progress.length; i++) {
            const progress = this.progress[i];
            if (i >= this._runtimeData.maxProgress) {
                progress.node.active = false;
            } else {
                progress.node.active = true;
                progress.spriteFrame = this.progress3;
            }
        }

        this.sourceLevel.string = '1';
        this.targetLevel.string = '3';
        this.sourceSp.spriteFrame = this.levelFinished;
        this.targetSp.spriteFrame = this.levelUnFinished;
    }
}


