import Elysia from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connection";
import { NotManagerUserError } from "../errors/not-manager-user-error";

export const getManagedRestaurant = new Elysia()
  .error({
    NOT_MANAGER_USER: NotManagerUserError
  })
  .onError(({ error, code, set }) => {
    switch(code) {
      case 'NOT_MANAGER_USER': {
        set.status = 400
        return { code, message: error.message}
      }
    }
  })
  .use(auth)
  .get('/managed-restaurant', async ({ getCurrentUser}) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new NotManagerUserError()
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    return managedRestaurant
  })