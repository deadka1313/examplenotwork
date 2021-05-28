import { notification } from 'antd';

export class RestException extends Error {
  public http: { status: number; detail: string };
  public data: Record<string, never>;

  constructor(
    error: { status: number; data: Record<string, never> },
    detail: string = undefined,
    ...args
  ) {
    super(...args);
    this.http = { status: error.status, detail: detail };
    this.data = error.data;
    this.errorHandler();
  }

  private errorHandler(): void {
    this.notifyError(this.data);
  }

  private notifyError(data): void {
    data.errors.forEach((error) => {
      if (error.title || error.error) {
        notification.error({
          description: error.detail,
          message: error.title || error.error,
        });
      }
    });
  }
}
