import { _decorator, Component, Enum, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

enum ROAD_POINT_TYPE {
    NORMAL = 1,
    START,
    GREETING,
    GOODBYE,
    END,
    AI_START,
}

Enum(ROAD_POINT_TYPE);

enum ROAD_MOVE_TYPE {
    LINE = 1,
    CURVE,
}

Enum(ROAD_MOVE_TYPE);

@ccclass('RoadPoint')
export class RoadPoint extends Component {
    public static RoadPointType = ROAD_POINT_TYPE;
    public static RoadMoveType = ROAD_MOVE_TYPE;

    @property({
        type: ROAD_POINT_TYPE,
        displayOrder: 1,
    })
    type = ROAD_POINT_TYPE.NORMAL;

    @property({
        type: Node,
        displayOrder: 2,
        visible: function (this: RoadPoint) {
            return this.type !== ROAD_POINT_TYPE.END;
        }
    })
    nextStation : Node = null;

    @property({
        type: ROAD_MOVE_TYPE,
        displayOrder: 3,
    })
    moveType = ROAD_MOVE_TYPE.LINE;

    @property({
        displayOrder: 4,
        visible: function (this: RoadPoint) {
            return this.type !== ROAD_POINT_TYPE.END && this.moveType === ROAD_MOVE_TYPE.CURVE;
        }
    })
    clockwise = true;

    @property({
        type: Vec3,
        displayOrder: 5,
        visible: function (this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.GREETING || this.type === ROAD_POINT_TYPE.GOODBYE;
        }
    })
    direction = new Vec3(1, 0, 0);

    // AI car creating interval
    @property({
        displayOrder: 6,
        visible: function (this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START;
        }
    })
    interval = 3;

    @property({
        displayOrder: 7,
        visible: function (this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START;
        }
    })
    delayTime = 0;

    @property({
        displayOrder: 8,
        visible: function (this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START;
        }
    })
    speed = 0.05;

    @property({
        displayOrder: 9,
        visible: function (this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START;
        }
    })
    cars = '201'

    start() {

    }

    update(deltaTime: number) {
        
    }
}


