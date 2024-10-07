import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { routes } from "./features/routes";

dotenv.config();
 
if (!process.env.PORT) {
  throw new Error("Missing required environment variables");
}

const PORT = parseInt(process.env.PORT, 10);
const app = express();

app.use(express.json());
const corsOptions = {
  origin: 'https://potential-palm-tree-vxpww5vr675fp9xg-5173.app.github.dev',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// register routes
app.use("/", routes);


// register middleware
app.use(express.static("public"));
app.use(errorHandler);
app.use(notFoundHandler);

// start server
app.listen(PORT, () =>
  console.log(`Server ready at: http://localhost:${PORT}`)
);


