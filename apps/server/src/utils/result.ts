export type Result<T, E> = [T, null] | [null, E];

export function ok<T>(data?: T): Result<T, null> {
  return data ? [data, null] : [null, null];
}

export function err<E>(error: E): Result<null, E> {
  return [null, error];
}
