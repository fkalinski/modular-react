import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true, // Enable introspection for GraphQL Playground
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:8080',
      ],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        // Add context here (e.g., user authentication)
        headers: req.headers,
      }),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start HTTP server
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphQL Playground available at http://localhost:${PORT}/graphql`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
  console.log('\nExample queries:');
  console.log('  - Query all files: { files { id name size mimeType } }');
  console.log('  - Query hubs: { hubs { id name description memberCount } }');
  console.log('  - Search: { search(query: "proposal") { totalResults files { name } } }');
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
