export class AuthLinkNotFoundError extends Error {
  constructor() {
    super('Auth Link not found')
  }
}