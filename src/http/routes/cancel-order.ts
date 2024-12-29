import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { OrderNotFoundError } from "../errors/order-not-found-error";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";
import { OrderCancelingError } from "../errors/order-canceling-error";

export const cancelOrder = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    ORDER_NOT_FOUND: OrderNotFoundError,
    ORDER_CANCELING: OrderCancelingError
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
      case 'ORDER_NOT_FOUND': {
        set.status = 400
        return { code, message: error.message }
      }
      case 'ORDER_CANCELING': {
        set.status = 400
        return { code, message: error.message }
      }
    }
  })
  .use(auth)
  .patch('/orders/:orderId/cancel', async ({ getCurrentUser, params }) => {
    const { orderId } = params

    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      throw new OrderNotFoundError()
    }

    if (order.status === 'delivering' || order.status === 'delivered') {
      throw new OrderCancelingError()
    }

    await db.update(orders).set({ status: 'canceled' }).where(eq(orders.id, orderId))

  }, {
    params: t.Object({
      orderId: t.String()
    })
  })