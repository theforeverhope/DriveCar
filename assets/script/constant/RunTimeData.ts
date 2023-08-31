import { _decorator, Component, Node } from 'cc';
import { Configuration } from './Configuration';
import { Constant } from './Constant';
const { ccclass } = _decorator;

@ccclass('RunTimeData')
export class RunTimeData {
    public playerData: PlayerData = null;
    static _instance: RunTimeData = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new RunTimeData();
        }

        return this._instance;
    }

    constructor() {
        this.playerData = PlayerData.instance();
    }

    public curProgress = 0;
    public maxProgress = 0;
    public isTakeOver = true;
    public money = 0;

    get curLevel() {
        return this.playerData.playerInfo.level;
    }

    get curMoney() {
        return this.playerData.playerInfo.money;
    }
}

interface IPlayerInfo {
    money: number;
    level: number;
}

@ccclass('PlayerData')
export class PlayerData {
    public playerInfo: IPlayerInfo = {
        money: 0,
        level: 1
    };

    static _instance: PlayerData = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new PlayerData();
        }

        return this._instance;
    }

    public loadCache() {
        const info = Configuration.instance().getConfigData(Constant.PlayerConfigID);
        if (info) {
            this.playerInfo = JSON.parse(info);
        }
    }

    public passLevel(money: number) {
        this.playerInfo.money = money;
        this.playerInfo.level++;
        Configuration.instance().setConfigData(Constant.PlayerConfigID, JSON.stringify(this.playerInfo));
    }
}


