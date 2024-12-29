import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { OrderNotFoundError } from "../errors/order-not-found-error";
import { db } from "../../db/connection";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";
import { OrderNotPendingError } from "../errors/order-not-pending-error";

export const approveOrder = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    ORDER_NOT_FOUND: OrderNotFoundError,
    ORDER_NOT_PENDING: OrderNotPendingError
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
      case 'ORDER_NOT_PENDING': {
        set.status = 400
        return { code, message: error.message }
      }
    }
  })
  .use(auth)
  .patch('/orders/:orderId/approve', async ({ getCurrentUser, params }) => {
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

    if (order.status !== 'pending') {
      throw new OrderNotPendingError()
    }

    await db.update(orders).set({ status: 'processing' }).where(eq(orders.id, orderId))

  }, {
    params: t.Object({
      orderId: t.String()
    })
  })