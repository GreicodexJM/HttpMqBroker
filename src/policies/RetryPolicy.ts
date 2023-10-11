export interface BackoffStrategy {
    type: "linear" | "exponential";
    initialDelay: number;
    maxDelay?: number;
  }
export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy?: BackoffStrategy;
  }