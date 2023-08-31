import { _decorator, sys } from 'cc';
import { Constant } from './Constant';
const { ccclass } = _decorator;

@ccclass('Configuration')
export class Configuration {
    private _jsonData = {};
    private _markSave = false;
    static _instance: Configuration = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new Configuration();
        }

        return this._instance;
    }

    public init() {
        const localStorage = sys.localStorage.getItem(Constant.GameConfigID);
        if (localStorage) {
            this._jsonData = JSON.parse(localStorage);
        }

        setInterval(this._scheduleSave, 500);
    }

    public getConfigData(key: string) {
        const data = this._jsonData[key];
        return data || '';
    }

    public setConfigData(key: string, value: string) {
        this._jsonData[key] = value;
        this._markSave = true;
    }

    private _scheduleSave() {
        if (!this._markSave) {
            return;
        }
        const data = JSON.stringify(this._jsonData);
        sys.localStorage.setItem(Constant.GameConfigID, data);
        this._markSave = false;
    }
}


