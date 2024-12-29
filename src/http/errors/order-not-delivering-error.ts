export class OrderNotDeliveringError extends Error {
  constructor() {
    super('Order is not delivering')
  }
}