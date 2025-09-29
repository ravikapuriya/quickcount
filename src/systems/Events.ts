type EventName =
    | 'gameStart'
    | 'gameOver'
    | 'score'
    | 'powerupUsed'
    | 'coins';

type ScoreListener = (score: number, best: number) => void;

export class EventsBus {
    private listeners = new Map<EventName, Set<Function>>();
    private started = false;
    private lastNextValue = 2;

    on(name: EventName, fn: Function) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name)!.add(fn);
    }

    off(name: EventName, fn: Function) {
        this.listeners.get(name)?.delete(fn);
    }

    emit(name: EventName, ...args: any[]) {
        this.listeners.get(name)?.forEach(fn => fn(...args));
    }

    gameStartOnce() {
        if (!this.started) {
            this.started = true;
            this.emit('gameStart');
        }
    }

    gameOver() { this.emit('gameOver'); }

    emitScore(score: number, best: number) {
        (this.listeners.get('score') as Set<ScoreListener> | undefined)?.forEach(fn => fn(score, best));
    }

    getLastNextValue(): number {
        return this.lastNextValue;
    }

    powerupUsed(name: string) {
        this.emit('powerupUsed', name);
    }
}
