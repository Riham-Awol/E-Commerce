import { createApp } from "./app";
import { env } from "./config/env";
import { assertDbConnection } from "./config/db";

async function bootstrap() {
  const app = createApp();

  try {
    await assertDbConnection();
    // eslint-disable-next-line no-console
    console.log("✔ Connected to MySQL");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("⚠ Could not connect to MySQL — API will start but DB routes will fail.", (err as Error).message);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`✔ BevSupply API listening on http://localhost:${env.port}`);
  });
}

bootstrap();
