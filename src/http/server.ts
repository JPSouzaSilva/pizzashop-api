import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link';
import { authenticateFromLink } from './routes/authenticate-from-link';
import { signOut } from './routes/sign-out';
import { getProfile } from './routes/get-profile';
import { getManagedRestaurant } from './routes/get-managed-restaurant';
import { env } from '../env';

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
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
  console.log(`Server running on port ${env.HTTP_PORT}`);
})