import Elysia from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connection";
import { UserNotFoundError } from "../errors/user-not-found-error";

export const getProfile = new Elysia()
  .error({
    USER_NOT_FOUND: UserNotFoundError
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case "USER_NOT_FOUND": {
        set.status = 404
        return { code, message: error.message }
      }
    }
  })
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)   
      },
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  })