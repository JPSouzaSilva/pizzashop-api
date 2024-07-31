import nodemailer from 'nodemailer'
import { env } from '../env'

export const mail = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  auth: {
    user: env.MAIL_USERNAME,
    pass: env.MAIL_PASSWORD
  }
})