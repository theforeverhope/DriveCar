import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('RunTimeData')
export class RunTimeData {
    static _instance: RunTimeData = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new RunTimeData();
        }

        return this._instance;
    }

    public curProgress = 0;
    public maxProgress = 0;
    public isTakeOver = true;
    public money = 0;
}


