import { _decorator, BoxColliderComponent, Component, loader, Node, Prefab, random, Vec3 } from 'cc';
import { Car } from './Car';
import { RoadPoint } from './RoadPoint';
import { PoolManager } from './constant/PoolManager';
import { CustomEventListener } from './CustomEventListener';
import { Constant } from './constant/Constant';
const { ccclass, property } = _decorator;

@ccclass('CarManager')
export class CarManager extends Component {
    @property({
        type: Car,
    })
    mainCar: Car = null;

    @property({
        type: Node,
    })
    camera = null;

    @property
    cameraPos = new Vec3(0, 2, 2);
    
    @property
    cameraRotation = -45;

    private _curPath: Node[] = [];
    private _aiCars: Car[] = [];

    public start() {
        CustomEventListener.on(Constant.EventName.GAME_OVER, this._gameOver, this);
    }

    public resetCar(points: Node[]) {
        if (points.length <= 0) {
            console.warn("There is no point in this path");
            return;
        }

        this._recycleAllAICar();
        this._curPath = points;
        this._createMainCar(points[0]);
        this._startSchedule();
    }

    public controlRunning(isRunning = true) {
        CustomEventListener.dispatch(Constant.EventName.SHOW_GUIDE, false);
        if (isRunning) {
            this.mainCar.startRunning();
        } else {
            this.mainCar.stopRunning();
        }
    }

    private _createMainCar(point: Node) {
        this.mainCar.setEntry(point, true);
        this.mainCar.setCamera(this.camera, this.cameraPos, this.cameraRotation)
    }

    private _startSchedule() {
        for (let i = 1; i < this._curPath.length; i++) {
            const node = this._curPath[i];
            const road = node.getComponent(RoadPoint);
            road.startSchedule(this._createEnemy.bind(this));
        }
    }

    private _stopSchedule() {
        for (let i = 1; i < this._curPath.length; i++) {
            const node = this._curPath[i];
            const road = node.getComponent(RoadPoint);
            road.stopSchedule();
        }
    }
    

    private _createEnemy(road: RoadPoint, carID: number) {
        const self = this;
        loader.loadRes(`car/car${carID}`, Prefab, (err: Error, prefab: Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            
            const car = PoolManager.getNode(prefab, self.node);
            const carComp = car.getComponent(Car);
            this._aiCars.push(carComp);
            carComp.setEntry(road.node);
            carComp.maxSpeed = road.speed;
            carComp.startRunning();
            carComp.moveAfterFinish(this._recycleAICar.bind(this));
        });
    }

    private _recycleAICar(car: Car) {
        const index = this._aiCars.indexOf(car);
        if (index >= 0) {
            PoolManager.setNode(car.node);
            this._aiCars.splice(index, 1);
        }
    }

    private _recycleAllAICar() {
        for (let i = 0; i < this._aiCars.length; i++) {
            const car = this._aiCars[i];
            PoolManager.setNode(car.node);
        }

        this._aiCars = [];
    }

    private _gameOver() {
        this._stopSchedule();
        this.mainCar._stopImmediately();
        this.camera.setParent(this.node.parent, true);
        for (let i = 0; i < this._aiCars.length; i++) {
            const car = this._aiCars[i];
            car._stopImmediately();
        }
    }
}


