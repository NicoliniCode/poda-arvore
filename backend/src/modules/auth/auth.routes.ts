import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { asyncHandler, AppError } from '../../utils/http';
import {
  findLoginUserByEmail,
  recordLoginAttempt,
  updateLastLogin
} from './auth.repository';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  senha: z.string().min(1)
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const credentials = loginSchema.parse(req.body);
    const loginUser = await findLoginUserByEmail(credentials.email);
    const passwordMatches = loginUser
      ? await bcrypt.compare(credentials.senha, loginUser.senhaHash)
      : false;

    await recordLoginAttempt({
      idUsuario: loginUser?.id,
      email: credentials.email,
      sucesso: passwordMatches,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      mensagem: passwordMatches ? 'Login realizado.' : 'Credenciais invalidas.'
    });

    if (!loginUser || !passwordMatches) {
      throw new AppError(401, 'Email ou senha invalidos.');
    }

    await updateLastLogin(loginUser.id);

    const { senhaHash: _senhaHash, ...user } = loginUser;
    const token = jwt.sign(
      {
        perfil: user.perfil
      },
      env.jwtSecret,
      {
        subject: String(user.id),
        expiresIn: '8h'
      }
    );

    res.json({ token, user });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
