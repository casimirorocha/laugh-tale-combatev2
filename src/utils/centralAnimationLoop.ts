type FrameCallback = (deltaTime: number, timestamp: number) => void;

class CentralAnimationLoop {
  private subscribers: Map<string, FrameCallback> = new Map();
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  public subscribe(id: string, callback: FrameCallback): () => void {
    this.subscribers.set(id, callback);
    if (!this.isRunning) {
      this.start();
    }
    return () => this.unsubscribe(id);
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
    if (this.subscribers.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick = this.tick.bind(this);
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Cap delta time at 100ms
    this.lastTime = timestamp;

    this.subscribers.forEach((callback) => {
      try {
        callback(deltaTime, timestamp);
      } catch (err) {
        console.error('Error in central animation loop callback:', err);
      }
    });

    this.animFrameId = requestAnimationFrame(this.tick);
  }
}

export const centralAnimationLoop = new CentralAnimationLoop();
