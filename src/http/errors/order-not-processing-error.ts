export class OrderNotProcessingError extends Error {
  constructor() {
    super('Order is not processing')
  }
}