import { _decorator, resources, AudioClip, AudioSource, Node, assetManager, loader } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager {
    public static playMusic(name: string) {
        const path = `audio/music/${name}`;
        loader.loadRes(path, AudioClip, (err: any, source: AudioClip) => {
            if (err) {
                console.warn(err);
                return;
            }

            source.setLoop(true);
            source.play();
        });
    }

    public static playSound(name: string) {
        const path = `audio/sound/${name}`;
        loader.loadRes(path, AudioClip, (err: any, source: AudioClip) => {
            if (err) {
                console.warn(err);
                return;
            }

            source.play();
        });
    }
}


