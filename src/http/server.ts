import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link';
import { authenticateFromLink } from './routes/authenticate-from-link';
import { signOut } from './routes/sign-out';
import { getProfile } from './routes/get-profile';
import { getManagedRestaurant } from './routes/get-managed-restaurant';
import { env } from '../env';
import { getOrderDetails } from './routes/get-order-details';
import { approveOrder } from './routes/approve-order';
import { dispatchOrder } from './routes/dispatch-order';
import { deliveredOrder } from './routes/delivered-order';
import { cancelOrder } from './routes/cancel-order';
import { getOrders } from './routes/get-orders';

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(dispatchOrder)
  .use(deliveredOrder)
  .use(cancelOrder)
  .use(getOrders)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status
        return error.toResponse
      }
      default: {
        console.error(error)

        return new Response(null, { status: 500 })  
      }
    }
  })

app.listen(env.HTTP_PORT, () => {
  console.log(`🚀 Server running on port ${env.HTTP_PORT}`);
})