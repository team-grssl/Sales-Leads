const app = require('./app');
const { port } = require('./utils/config');
const { ensureSchema } = require('./db');

async function start() {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`Grassroots backend running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Database bootstrap failed:', error.message);
  process.exit(1);
});


