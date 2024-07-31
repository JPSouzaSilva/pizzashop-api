export class NotManagerUserError extends Error {
  constructor() {
    super('User is not a manager')
  }
}