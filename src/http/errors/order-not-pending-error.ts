export class OrderNotPendingError extends Error {
  constructor() {
    super('Order is not pending')
  }
}