export type Result<T, E> = [T, null] | [null, E];

export function ok<T>(data?: T): Result<T, any> {
  return data ? [data, null] : [null, null];
}

export function err<E>(error: E): Result<any, E> {
  return [null, error];
}
