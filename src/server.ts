import app from './app';
import './utils/prisma'; // Initialise Prisma et configure la déconnexion

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Endpoint API: http://localhost:${PORT}/api/results`);
});
