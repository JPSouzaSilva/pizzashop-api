export class AuthLinkExpiredError extends Error {
  constructor() {
    super('Auth link expired, please generate a new one')
  }
}