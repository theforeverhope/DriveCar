import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum EventName {
    GREETING = 'greetting',
    GOODBYE = 'goodbye',
    FINISHWALK = 'finish-walk',
    START_BRAKING = 'start-braking',
    END_BRAKING = 'end-braking',
    START_COIN = 'start-coin',
}

enum CustomerState {
    NONE = -1,
    GOODBYE = 0,
    GREETING = 1,
}

enum AudioSource {
    BACKGROUND = 'background',
    CLICK = 'click',
    CRASH = 'crash',
    GET_MONEY = 'getMoney',
    IN_CAR = 'inCar',
    NEW_ORDER = 'newOrder',
    START = 'start',
    STOP = 'stop',
    TOOTING1 = 'tooting1',
    TOOTING2 = 'tooting2',
    WIN = 'win',
}

@ccclass('Constant')
export class Constant {
    public static EventName = EventName;
    public static CustomerState = CustomerState;
    public static AudioSource = AudioSource;
}


