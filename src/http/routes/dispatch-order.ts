import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { OrderNotFoundError } from "../errors/order-not-found-error";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";
import { OrderNotProcessingError } from "../errors/order-not-processing-error";

export const dispatchOrder = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    ORDER_NOT_FOUND: OrderNotFoundError,
    ORDER_NOT_PROCESSING: OrderNotProcessingError
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
      case 'ORDER_NOT_PROCESSING': {
        set.status = 400
        return { code, message: error.message }
      }
    }
  })
  .use(auth)
  .patch('/orders/:orderId/dispatch', async ({ getCurrentUser, params }) => {
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

    if (order.status !== 'processing') {
      throw new OrderNotProcessingError()
    }

    await db.update(orders).set({ status: 'delivering' }).where(eq(orders.id, orderId))

  }, {
    params: t.Object({
      orderId: t.String()
    })
  })