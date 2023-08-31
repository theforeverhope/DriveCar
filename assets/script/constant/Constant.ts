import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum EventName {
    GREETING = 'greetting',
    GOODBYE = 'goodbye',
    FINISHWALK = 'finish-walk',
    START_BRAKING = 'start-braking',
    END_BRAKING = 'end-braking',
    START_COIN = 'start-coin',
    GAME_START = 'game-start',
    GAME_OVER = 'game-over',
    NEW_LEVEL = 'new-level',
    SHOW_TALK = 'show-talk',
    SHOW_GUIDE = 'show-guide',
    LOADING = 'loading',
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

enum CarGroup {
    NORMAL = 1 << 0,
    MAIN = 1 << 1,
    OTHER = 1 << 2,
}

@ccclass('Constant')
export class Constant {
    public static EventName = EventName;
    public static CustomerState = CustomerState;
    public static AudioSource = AudioSource;
    public static CarGroup = CarGroup;
    public static TalkTable = [
        'Please hurry up. \n I have a plane to catch.',
        'The most beautiful day. \n Is not a rainy day.'
    ]

    public static UIPage = {
        mainUI: 'mainUI',
        gameUI: 'gameUI',
        resultUI: 'resultUI',
        loadingUI: 'loadingUI',
    }

    public static GameConfigID = 'TAXI_GAME_CACHE';
    public static PlayerConfigID = 'PLAYER';
    public static MaxLevel = 2;
}


