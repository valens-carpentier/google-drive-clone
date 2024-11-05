const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

module.exports = (app) => {
  app.use(
    expressSession({
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      },
      secret: process.env.SESSION_SECRET || 'a santa at nasa',
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(
        new PrismaClient(),
        {
          checkPeriod: 2 * 60 * 1000,  // 2 minutes in milliseconds
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }
      )
    })
  );
}; 