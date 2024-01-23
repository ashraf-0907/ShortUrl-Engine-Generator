import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10000kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "100000kb" })); // parse the body.req for the data within specififed limit
app.use(express.static("public")); // Serves static files in the public directory

// Routes
import createUrl from "./routes/url.route.js";
import redirector from "./routes/redirector.route.js";
import analytics from "./routes/analytics.route.js";

app.use("/api/v2", createUrl);
app.use("/", redirector);
app.use("/api/v2", analytics);

export default app;
