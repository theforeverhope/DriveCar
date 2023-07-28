import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum EventName {
    GREETING = 'greetting',
    GOODBYE = 'goodbye',
    FINISHWALK = 'finish-walk',
}

enum CustomerState {
    NONE = -1,
    GOODBYE = 0,
    GREETING = 1,
}

@ccclass('Constant')
export class Constant {
    public static EventName = EventName;
    public static CustomerState = CustomerState;
}


