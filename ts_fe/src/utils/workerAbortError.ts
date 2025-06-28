export class WorkerAbortError extends Error {
  constructor() {
    super('Worker Aborted');
    this.name = 'WorkerAbortError';
  }
}
