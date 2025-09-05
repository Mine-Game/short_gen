import nodemailer from 'nodemailer'
import { generateToken } from './token'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST!,
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  secure: false,
  auth: { 
    user: process.env.EMAIL_SERVER_USER!, 
    pass: process.env.EMAIL_SERVER_PASSWORD! 
  },
})

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM!, to, subject, html })
}

export async function sendVerificationEmail(email: string) {
  const token = await generateToken()
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const html = `
    <h1>Подтверждение регистрации</h1>
    <p>Для подтверждения вашего email перейдите по ссылке:</p>
    <a href="${verificationUrl}">Подтвердить email</a>
    <p>Ссылка действительна в течение 24 часов.</p>
  `
  
  await sendMail(email, 'Подтверждение регистрации', html)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset?token=${token}`
  
  const html = `
    <h1>Сброс пароля</h1>
    <p>Для сброса пароля перейдите по ссылке:</p>
    <a href="${resetUrl}">Сбросить пароль</a>
    <p>Ссылка действительна в течение 1 часа.</p>
  `
  
  await sendMail(email, 'Сброс пароля', html)
}



