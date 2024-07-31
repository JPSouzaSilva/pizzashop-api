import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import dayjs from "dayjs";
import { auth } from "../auth";
import { authLinks } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AuthLinkNotFoundError } from "../errors/auth-link-not-found";
import { AuthLinkExpiredError } from "../errors/auth-link-expired-error";

export const authenticateFromLink = new Elysia()
  .error({
    AUTH_LINK_NOT_FOUND: AuthLinkNotFoundError,
    AUTH_LINK_EXPIRED: AuthLinkExpiredError
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'AUTH_LINK_NOT_FOUND': {
        set.status = 400
        return { code, message: error.message }
      }
      case 'AUTH_LINK_EXPIRED': {
        set.status = 400
        return { code, message: error.message }
      }

    }
  })
  .use(auth)
  .get('/auth-links/authenticate', async ({ query, signUser, redirect }) => {
    const { code, redirectUrl } = query

    const authLinksFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
          return eq(fields.code, code)
      },
    })

    if (!authLinksFromCode) {
      throw new AuthLinkNotFoundError()
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(authLinksFromCode.createdAt, 'days')

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new AuthLinkExpiredError()
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinksFromCode.userId)
      },
    })

    await signUser({
      sub: authLinksFromCode.userId,
      restaurantId: managedRestaurant?.id
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    // return redirect(redirectUrl)

  }, {
    query: t.Object({
      code: t.String(),
      redirectUrl: t.String()
    })
  })