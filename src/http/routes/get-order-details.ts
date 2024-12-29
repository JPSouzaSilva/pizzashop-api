import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { db } from "../../db/connection";
import { OrderNotFoundError } from "../errors/order-not-found-error";

export const getOrderDetails = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    ORDER_NOT_FOUND: OrderNotFoundError
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
      case 'ORDER_NOT_FOUND': {
        set.status = 400
        return { code, message: error.message }
      }
    }
  })
  .use(auth)
  .get('/order/:orderId', async ({ getCurrentUser, params }) => {
    const { orderId } = params

    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true
          }
        }, // por isso a parte de relations no schema
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true
          },
          with: {
            product: {
              columns: {
                name: true
              }
            }
          }
        }
      },
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      throw new OrderNotFoundError()
    }

    return order

  }, {
    params: t.Object({
      orderId: t.String()
    })
  })