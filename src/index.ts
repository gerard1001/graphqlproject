import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

import { schema } from "./schema";
import { context } from "./context";

export const server = new ApolloServer({
  schema,
  context,
  introspection: true, // 1
  plugins: [ApolloServerPluginLandingPageLocalDefault()], // 2
});

const port = process.env.PORT || 3000; // 3

server.listen({ port }).then(({ url }) => {
  console.log(`🚀  Server  ready at ${url}`);
});
