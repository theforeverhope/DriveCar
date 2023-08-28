import { _decorator, BoxCollider, BoxColliderComponent, Component, ICollisionEvent, Node, ParticleSystemComponent, RigidBody, RigidBodyComponent, Vec3 } from 'cc';
import { RoadPoint } from './RoadPoint';
import { Constant }  from './constant/Constant';
import { CustomEventListener } from './CustomEventListener';
import { AudioManager } from './AudioManager';
import { RunTimeData } from './constant/RunTimeData';
const { ccclass, property } = _decorator;

const _tempVec = new Vec3;
const EventName = Constant.EventName;

@ccclass('Car')
export class Car extends Component {
    @property
    maxSpeed = 0.08;

    private _isMain = false; // separete AI cars from main car

    private _curPoint: RoadPoint = null;
    private _pointA = new Vec3();
    private _pointB = new Vec3();
    private _curSpeed = 0.03;
    private _isRunning = false;
    private _offset = new Vec3();

    private _originRotation = 0;
    private _targetRotation = 0;
    private _centerPoint = new Vec3();
    private _rotationAngleUnit = 0;

    private _acceleration = 0.2;
    private _inOrder = false;
    private _isBraking = false;
    private _gas: ParticleSystemComponent = null;

    private _overCD: Function = null;
    private _camera: Node = null;

    public setEntry(point: Node, isMain: boolean = false) {
        this._resetPhysical();
        this.node.setWorldPosition(point.worldPosition);
        this._curPoint = point.getComponent(RoadPoint);
        this._isMain = isMain;

        if (!this._curPoint) {
            console.warn("There is no road point in " + point.name);
        }

        this._pointA.set(point.worldPosition);
        this._pointB.set(this._curPoint.nextStation.worldPosition);

        const diffZ =  this._pointB.z - this._pointA.z;
        const diffX =  this._pointB.x - this._pointA.x;
        if (diffZ !== 0) {
            if (diffZ < 0) {
                this.node.eulerAngles = new Vec3();
            } else {
                this.node.eulerAngles = new Vec3(0, 180, 0);
            }
        } else if (diffX !== 0) {
            if (this._isMain) {
                if (diffX < 0) {
                    this.node.eulerAngles = new Vec3(0, 270, 0);
                } else {
                    this.node.eulerAngles = new Vec3(0, 90, 0);
                }
            } else {
                if (diffX < 0) {
                    this.node.eulerAngles = new Vec3(0, 90, 0);
                } else {
                    this.node.eulerAngles = new Vec3(0, 270, 0);
                }
            }
        }

        const collider = this.node.getComponent(BoxColliderComponent);
        const rigidBody = this.node.getComponent(RigidBody);
        
        if (this._isMain) {
            const gasNode = this.node.getChildByName('gas');
            this._gas = gasNode.getComponent(ParticleSystemComponent);
            this._gas.play();
           
            collider.on('onCollisionEnter', this._onCollisionEnter, this);
            collider.setGroup(Constant.CarGroup.MAIN);
            collider.setMask(Constant.CarGroup.OTHER);
        } else {
            collider.setGroup(Constant.CarGroup.OTHER);
            collider.setMask(-1);
            rigidBody.useGravity = true;
        }
    }

    public start() {
        CustomEventListener.on(EventName.FINISHWALK, this._finishOrder, this);
    }

    public update(dt: number) {
        if (!this._isRunning || this._inOrder) {
            return;
        }
        
        this._offset.set(this.node.worldPosition);
        this._curSpeed += this._acceleration * dt;
        if (this._curSpeed > this.maxSpeed) {
            this._curSpeed = this.maxSpeed;
        }

        if (this._curSpeed <= 0.0001) {
            AudioManager.playSound(Constant.AudioSource.STOP);
            this._isRunning = false;
            if (this._isBraking) {
                this._isBraking = false;
                CustomEventListener.dispatch(EventName.END_BRAKING);
            }
        }

        switch(this._curPoint.moveType) {
            case RoadPoint.RoadMoveType.CURVE:
                // console.log("CURVE -----------------", this.node.worldPosition.z, this._pointB.z)
                const offsetRotation = this._targetRotation - this._originRotation;
                const curRotation = this._conversion(this.node.eulerAngles.y);
                let nextStation = (curRotation - this._originRotation) + (this._curSpeed * this._rotationAngleUnit * (this._targetRotation > this._originRotation ? 1 : -1));
                
                if (Math.abs(nextStation) > Math.abs(offsetRotation)) {
                    nextStation = offsetRotation;
                }

                const target = nextStation + this._originRotation;
                _tempVec.set(0, target, 0);
                this.node.eulerAngles = _tempVec; // car rotation angle

                // const cos = Math.cos(nextStation * Math.PI / 180); // radian
                // const sin = Math.sin(nextStation * Math.PI / 180); // radian
                // const xLength = this._pointA.x - this._centerPoint.x;
                // const zLength = this._pointA.z - this._centerPoint.z;
                // const xPos = xLength * cos + zLength * sin + this._centerPoint.x;
                // const zPos = -xLength * sin + zLength * cos + this._centerPoint.z;
                // this._offset.set(xPos, 0 , zPos);
                Vec3.rotateY(this._offset, this._pointA, this._centerPoint, nextStation * Math.PI / 180);

                break;
            default:
                const diffZ = this._pointB.z - this._pointA.z;
                const diffX = this._pointB.x - this._pointA.x;

                if (Math.round(diffZ) !== 0) {
                    if (diffZ < 0) {
                        this._offset.z -= this._curSpeed;
                        if (this._offset.z < this._pointB.z) {
                            this._offset.z = this._pointB.z;
                        }
                    } else {
                        this._offset.z += this._curSpeed;
                        if (this._offset.z > this._pointB.z) {
                            this._offset.z = this._pointB.z;
                        }
                    }
                } else if (Math.round(diffX) !== 0) {
                    if (diffX < 0) {
                        this._offset.x -= this._curSpeed;
                        if (this._offset.x < this._pointB.x) {
                            this._offset.x = this._pointB.x;
                        }
                    } else {
                        this._offset.x += this._curSpeed;
                        if (this._offset.x > this._pointB.x) {
                            this._offset.x = this._pointB.x;
                        }
                    }
                }
                break;

        }

        this.node.setWorldPosition(this._offset);

        // arrival judgement
        Vec3.subtract(_tempVec, this._pointB, this._offset);
        if (_tempVec.length() <= 0.02 || (!this._isMain && _tempVec.length() < 1)) {
            this._arrivalStation()
        }
    }

    public startRunning() {
        if (this._curPoint) {
            this._isRunning = true;
            this._curSpeed = 0;
            this._acceleration = 0.2;
        }

        if (this._isBraking) {
            CustomEventListener.dispatch(Constant.EventName.END_BRAKING);
            this._isBraking = false;
        }
    }

    public stopRunning() {
        this._acceleration = -0.3;
        // this._isRunning = false;
        CustomEventListener.dispatch(EventName.START_BRAKING, this.node);
        this._isBraking = true;
        AudioManager.playSound(Constant.AudioSource.STOP);
        this._gas.stop();
    }

    public moveAfterFinish(cd: Function) {
        this._overCD = cd;
    }

    public _stopImmediately() {
        this._isRunning = false;
        this._curSpeed = 0;
    }

    public setCamera(camera: Node, pos: Vec3, rotation: number) {
        if (this._isMain) {
            this._camera = camera;
            this._camera.setParent(this.node);
            this._camera.setPosition(pos)
            this._camera.eulerAngles = new Vec3(rotation, 0, 0);
        }
    }

    private _arrivalStation() {
        this._pointA.set(this._pointB);
        this._curPoint = this._curPoint?.nextStation.getComponent(RoadPoint);

        // Interact with customer
        if (this._isMain) {
            if (this._isBraking) {
                this._isBraking = false;
                CustomEventListener.dispatch(EventName.END_BRAKING);
            }

            console.log('arrivalStation ======= ', this._curPoint.type, this._curPoint.name)
            if (this._curPoint.type === RoadPoint.RoadPointType.GREETING) {
                this._greetingCustomer();
            } else if (this._curPoint.type === RoadPoint.RoadPointType.GOODBYE) {
                this._goodbyeCustomer();
            } else if (this._curPoint.type === RoadPoint.RoadPointType.END) {
                AudioManager.playSound(Constant.AudioSource.WIN);
                this._gameOver();
                CustomEventListener.dispatch(Constant.EventName.GAME_OVER);
            }
        }

        if (this._curPoint.nextStation) {
            this._pointB.set(this._curPoint.nextStation.worldPosition)

            if (this._curPoint.moveType === RoadPoint.RoadMoveType.CURVE) {
                if (this._curPoint.clockwise) {
                    this._originRotation = this._conversion(this.node.eulerAngles.y);
                    this._targetRotation = this._originRotation - 90;

                    if ((this._pointB.z < this._pointA.z && this._pointB.x > this._pointA.x) || (this._pointB.z > this._pointA.z && this._pointB.x < this._pointA.x)) {
                        this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                    } else {
                        this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                    }
                } else {
                    this._originRotation = this._conversion(this.node.eulerAngles.y);
                    this._targetRotation = this._originRotation + 90;

                    if ((this._pointB.z > this._pointA.z && this._pointB.x > this._pointA.x) || (this._pointB.z < this._pointA.z && this._pointB.x < this._pointA.x)) {
                        this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                    } else {
                        this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                    }
                }

                Vec3.subtract(_tempVec, this._pointA, this._centerPoint);
                const r = _tempVec.length();
                this._rotationAngleUnit = 90 / (Math.PI * r / 2);
            }
        } else {
            this._isRunning = false;
            this._curPoint = null;
            if (this._overCD) {
                this._overCD(this);
                this._overCD = null;
            } 
        }
    }

    private _conversion(value: number) {
        let a = value;
        if (a <= 0) {
            a += 360;
        }

        return a;
    }

    private _greetingCustomer() {
        const runtimeData = RunTimeData.instance();
        runtimeData.isTakeOver = false;
        this._inOrder = true;
        this._curSpeed = 0;
        CustomEventListener.dispatch(EventName.GREETING, this.node.worldPosition, this._curPoint.direction);
        this._gas.stop();
    }

    private _goodbyeCustomer() {
        const runtimeData = RunTimeData.instance();
        runtimeData.isTakeOver = true;
        runtimeData.curProgress++;
        runtimeData.money += 100;
        this._inOrder = true;
        this._curSpeed = 0;
        CustomEventListener.dispatch(EventName.GOODBYE, this.node.worldPosition, this._curPoint.direction);
        this._gas.stop();
        CustomEventListener.dispatch(EventName.START_COIN, this.node.worldPosition);
        AudioManager.playSound(Constant.AudioSource.STOP);
    }

    private _finishOrder() {
        if (this._isMain) {
            this._inOrder = false;
            this._gas.play();
        }
    }

    private _onCollisionEnter(event: ICollisionEvent) {
        const otherCollider = event.otherCollider;
        if (otherCollider.node.name === 'ground') {
            return;
        }
        const otherRigidBody = otherCollider.node.getComponent(RigidBodyComponent);
        otherRigidBody.useGravity = true;
        otherRigidBody.applyForce(new Vec3(0, 300, -150), new Vec3(0, 0.5, 0));

        const collider = event.selfCollider;
        collider.addMask(Constant.CarGroup.NORMAL);
        const rigidBody = this.node.getComponent(RigidBodyComponent);
        rigidBody.useGravity = true;
        this._gameOver();

        AudioManager.playSound(Constant.AudioSource.CRASH);
        CustomEventListener.dispatch(Constant.EventName.GAME_OVER);
    }

    private _gameOver() {
        this._isRunning = false;
        this._curSpeed = 0;
        CustomEventListener.dispatch(EventName.GAME_OVER);
    }

    private _resetPhysical() {
        const rigidBody = this.node.getComponent(RigidBodyComponent);
        rigidBody.useGravity = false;
        rigidBody.sleep();
        rigidBody.wakeUp();
    }
}


