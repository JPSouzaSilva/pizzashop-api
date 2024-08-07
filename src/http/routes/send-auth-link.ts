import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { createId } from "@paralleldrive/cuid2";
import { authLinks } from "../../db/schema";
import { env } from "../../env";
import { UserNotFoundError } from "../errors/user-not-found-error";
import { mail } from "../../lib/mail";
import { emailTemplateHtml } from "../../templates/email-template";

export const sendAuthLink = new Elysia()
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
  .post('/authenticate', async ({ body, set }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new UserNotFoundError()
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirectUrl', env.AUTH_REDIRECT_URL)

    await mail.sendMail({
      from: {
        name: 'Pizza Shop',
        address: 'hi@pizzashop.com'
      },
      to: email,
      subject: 'Authenticate to Pizza Shop',
      html: emailTemplateHtml({
        name: userFromEmail.name,
        link: authLink.toString()
      }),
    })
    
  }, {
    body: t.Object({
      email: t.String({ format: 'email' })
    })
  })