import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import dayjs from "dayjs";
import { auth } from "../auth";
import { authLinks } from "../../db/schema";
import { eq } from "drizzle-orm";

export const authenticateFromLink = new Elysia()
  .use(auth)
  .get('/auth-links/authenticate', async ({ query, signUser, redirect }) => {
    const { code, redirectUrl } = query

    const authLinksFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
          return eq(fields.code, code)
      },
    })

    if (!authLinksFromCode) {
      throw new Error('Auth link not found!')
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(authLinksFromCode.createdAt, 'days')

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error('Auth link expired, please generate a new one.')
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

    return redirect(redirectUrl)

  }, {
    query: t.Object({
      code: t.String(),
      redirectUrl: t.String()
    })
  })