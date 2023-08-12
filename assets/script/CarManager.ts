import { _decorator, BoxColliderComponent, Component, loader, Node, Prefab, random } from 'cc';
import { Car } from './Car';
import { RoadPoint } from './RoadPoint';
import { PoolManager } from './constant/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('CarManager')
export class CarManager extends Component {
    @property({
        type: Car,
    })
    mainCar: Car = null;

    private _curPath: Node[] = [];
    private _aiCars: Car[] = [];

    public resetCar(points: Node[]) {
        if (points.length <= 0) {
            console.warn("There is no point in this path");
            return;
        }

        this._curPath = points;
        this._createMainCar(points[0]);
        this._startSchedule();
    }

    public controlRunning(isRunning = true) {
        if (isRunning) {
            this.mainCar.startRunning();
        } else {
            this.mainCar.stopRunning();
        }
    }

    private _createMainCar(point: Node) {
        this.mainCar.setEntry(point, true);
    }

    private _startSchedule() {
        for (let i = 1; i < this._curPath.length; i++) {
            const node = this._curPath[i];
            const road = node.getComponent(RoadPoint);
            road.startSchedule(this._createEnemy.bind(this));
        }
    }

    private _stopSchedule() {}
    

    private _createEnemy(road: RoadPoint, carID: number) {
        const self = this;
        loader.loadRes(`car/car${carID}`, Prefab, (err: Error, prefab: Prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            
            prefab.onLoaded();
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
}


