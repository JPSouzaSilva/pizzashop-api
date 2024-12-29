export class OrderCancelingError extends Error {
  constructor() {
    super('Order is delivering or delivered')
  }
}