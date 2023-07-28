import { _decorator, AnimationComponent, Component, Node, Vec3 } from 'cc';
import { CustomEventListener } from './CustomEventListener';
import { Constant }  from './constant/Constant';

const { ccclass, property } = _decorator;
const EventName = Constant.EventName;
const _tempVec = new Vec3();

@ccclass('CustomerManagement')
export class CustomerManagement extends Component {
    @property({
        type: [Node]
    })
    customers: Node[] = [];

    @property
    duration = 2;

    private _curCustomer: Node = null;
    private _starPos = new Vec3();
    private _endPos = new Vec3();
    private _inOrder = false; // for customer walking animation
    private _deltaTime = 0;
    private _state = Constant.CustomerState.NONE;

    public start() {
        CustomEventListener.on(EventName.GREETING, this._greetingCustomer, this);
        CustomEventListener.on(EventName.GOODBYE, this._goodbyeCustomer, this);
    }

    public update(dt: number) {
        if (this._inOrder) {
            this._deltaTime += dt;

            if (this._deltaTime > this.duration) {
                this._deltaTime = 0;
                this._inOrder = false;
                this._curCustomer.active = false;
                if (this._state === Constant.CustomerState.GOODBYE) {
                    this._curCustomer = null;
                }
                CustomEventListener.dispatch(EventName.FINISHWALK);
            } else {
                Vec3.lerp(_tempVec, this._starPos, this._endPos, this._deltaTime / this.duration);
                this._curCustomer.setWorldPosition(_tempVec);
            }
            
        }
    }

    private _greetingCustomer(...args: any[]) {
        this._curCustomer = this.customers[Math.floor(Math.random() * this.customers.length)];
        console.log(this._curCustomer.name);
        this._inOrder = true;
        this._state = Constant.CustomerState.GREETING;

        if (!this._curCustomer) {
            return;
        }
        const carPos = args[0];
        const direction = args[1];
        Vec3.multiplyScalar(this._starPos, direction, 1.4);
        this._starPos.add(carPos);
        Vec3.multiplyScalar(this._endPos, direction, 0.5);
        this._endPos.add(carPos);

        this._curCustomer.setWorldPosition(this._starPos);
        this._curCustomer.active = true;

        // customer towards direction
        if (direction.x !== 0) {
            if (direction.x > 0) {
                this._curCustomer.eulerAngles = new Vec3(0, -90, 0);
            } else {
                this._curCustomer.eulerAngles = new Vec3(0, 90, 0);
            }
        } else if (direction.z !== 0) {
            if (direction.z > 0) {
                this._curCustomer.eulerAngles = new Vec3(0, 0, 0);
            } else {
                this._curCustomer.eulerAngles = new Vec3(0, 180, 0);
            } 
        }

        const aniComp = this._curCustomer.getComponent(AnimationComponent);
        aniComp.play('walk');
    }

    private _goodbyeCustomer(...args: any[]) {
        this._inOrder = true;
        this._state = Constant.CustomerState.GOODBYE;

        if (!this._curCustomer) {
            return;
        }
        const carPos = args[0];
        const direction = args[1];
        Vec3.multiplyScalar(this._starPos, direction, 0.5);
        this._starPos.add(carPos);
        Vec3.multiplyScalar(this._endPos, direction, 1.4);
        this._endPos.add(carPos);

        this._curCustomer.setWorldPosition(this._starPos);
        this._curCustomer.active = true;

        // customer towards direction
        console.log(direction)
        if (direction.x !== 0) {
            if (direction.x > 0) {
                this._curCustomer.eulerAngles = new Vec3(0, 90, 0);
            } else {
                this._curCustomer.eulerAngles = new Vec3(0, -90, 0);
            }
        } else if (direction.z !== 0) {
            if (direction.z > 0) {
                this._curCustomer.eulerAngles = new Vec3(0, 0, 0);
            } else {
                this._curCustomer.eulerAngles = new Vec3(0, 180, 0);
            } 
        }
        
        const aniComp = this._curCustomer.getComponent(AnimationComponent);
        aniComp.play('walk');
    }
}


