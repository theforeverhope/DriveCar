import { _decorator, Component, Node, Vec3 } from 'cc';
import { RoadPoint } from './RoadPoint';
import { Constant }  from './constant/Constant';
import { CustomEventListener } from './CustomEventListener';
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

    public setEntry(point: Node, isMain: boolean) {
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
            if (diffX < 0) {
                this.node.eulerAngles = new Vec3(0, 270, 0);
            } else {
                this.node.eulerAngles = new Vec3(0, 90, 0);
            }
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
            this._isRunning = false;
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
        if (_tempVec.length() <= 0.02) {
            this._arrivalStation()
        }
    }

    public startRunning() {
        if (this._curPoint) {
            this._isRunning = true;
            this._curSpeed = 0;
            this._acceleration = 0.2;
        }
    }

    public stopRunning() {
        this._acceleration = -0.3;
        // this._isRunning = false;
    }

    private _arrivalStation() {
        this._pointA.set(this._pointB);
        this._curPoint = this._curPoint.nextStation.getComponent(RoadPoint);
        // console.log(" arrival ----------------", this._curPoint.name, this._curPoint.nextStation.name)

        if (this._curPoint.nextStation) {
            this._pointB.set(this._curPoint.nextStation.worldPosition)

            // Interact with customer
            if (this._isMain) {
                if (this._curPoint.type === RoadPoint.RoadPointType.GREETING) {
                    this._greetingCustomer();
                } else if (this._curPoint.type === RoadPoint.RoadPointType.GOODBYE) {
                    this._goodbyeCustomer();
                }
            }

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
        this._inOrder = true;
        this._curSpeed = 0;
        CustomEventListener.dispatch(EventName.GREETING, this.node.worldPosition, this._curPoint.direction);
    }

    private _goodbyeCustomer() {
        this._inOrder = true;
        this._curSpeed = 0;
        CustomEventListener.dispatch(EventName.GOODBYE, this.node.worldPosition, this._curPoint.direction);
    }

    private _finishOrder() {
        this._inOrder = false;
    }
}


