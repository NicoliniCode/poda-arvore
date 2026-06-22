import cors from 'cors';
import type { CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import authRoutes from './modules/auth/auth.routes';
import solicitacoesRoutes from './modules/solicitacoes/solicitacoes.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origem CORS nao permitida: ${origin}`));
  }
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', (_req, res, next) => {
  // Permite que o frontend carregue imagens e arquivos cross-origin via <img>/<iframe>
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(env.uploadDir)));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend do sistema de poda de arvores funcionando.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
});
