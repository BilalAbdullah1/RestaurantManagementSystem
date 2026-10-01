type LoadingListener = (isLoading: boolean, activeRequests: number) => void;

class LoadingManager {
  private activeRequests = 0;
  private listeners: Set<LoadingListener> = new Set();

  public subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener(this.activeRequests > 0, this.activeRequests);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public startLoading(): void {
    this.activeRequests++;
    this.notify();
  }

  public stopLoading(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    this.notify();
  }

  public resetLoading(): void {
    this.activeRequests = 0;
    this.notify();
  }

  public get isLoading(): boolean {
    return this.activeRequests > 0;
  }

  public get count(): number {
    return this.activeRequests;
  }

  private notify(): void {
    const isLoad = this.activeRequests > 0;
    this.listeners.forEach((listener) => listener(isLoad, this.activeRequests));
  }
}

export const loadingManager = new LoadingManager();
