import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/db/index.js";
import app from "./app.js";

var port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Application is workig on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("MONGOdb connection failed", error);
  });
