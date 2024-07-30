import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link';
import { authenticateFromLink } from './routes/authenticate-from-link';

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)

app.listen(8080, () => {
  console.log('Server running on port 8080');
})