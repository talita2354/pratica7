const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const SECRET_KEY = 'minha_chave_secreta';
const PORT = 3000;

// Middleware para fazer o parsing do body em JSON
app.use(bodyParser.json());

// Simulação de credenciais válidas
const validUser = {
  username: 'admin',
  password: '12345'
};

// Função para gerar token JWT
const generateToken = (user) => {
  const issuedAt = Math.floor(Date.now() / 1000); // Data de criação (em segundos)
  const expiresAt = issuedAt + 60 * 60; // Expiração em 1 hora (em segundos)

  const token = jwt.sign(
    {
      user: user.username,
      iat: issuedAt,
      exp: expiresAt
    },
    SECRET_KEY
  );

  return {
    token_id: token,
    iat: new Date(issuedAt * 1000).toISOString().replace(/[-:.]/g, ''), // Formatação
    exp: new Date(expiresAt * 1000).toISOString().replace(/[-:.]/g, '') // Formatação
  };
};

// 1. Endpoint de autenticação (/jwt/auth)
app.post('/jwt/auth', (req, res) => {
  const { username, password } = req.body;

  // Verificação das credenciais
  if (username === validUser.username && password === validUser.password) {
    const tokenData = generateToken({ username });

    // Resposta JSON com token, data de criação e expiração
    res.json(tokenData);
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Middleware para verificar se o JWT é válido
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Token inválido
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Token não fornecido
  }
};

// 2. Endpoint protegido (/jwt/produtos)
app.get('/jwt/produtos', authenticateJWT, (req, res) => {
  // Lista de produtos fictícios
  const produtos = [
    { id: 1, nome: 'Produto A' },
    { id: 2, nome: 'Produto B' },
    { id: 3, nome: 'Produto C' }
  ];

  res.json(produtos);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
