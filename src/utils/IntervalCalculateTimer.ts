

export class IntervalCalculateTimer {
    private intervalId: NodeJS.Timeout | null = null;

    constructor(private callback: () => void, private interval: number = 5 * 60 * 1000) {}

    start(): void {
        if (this.intervalId) {
            console.log('计时器已经在运行');
            return;
        }
        this.intervalId = setInterval(() => {
            this.stop();
            this.callback();
            this.start();
        }, this.interval);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}