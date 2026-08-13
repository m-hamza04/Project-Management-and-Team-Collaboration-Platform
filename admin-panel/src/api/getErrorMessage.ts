import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
