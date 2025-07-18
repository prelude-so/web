export class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenericError";
    Object.setPrototypeOf(this, GenericError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export const normalizeError = (message: string, e: unknown): Error => {
  if (e instanceof Error) {
    return e;
  } else {
    return new Error(message);
  }
};
