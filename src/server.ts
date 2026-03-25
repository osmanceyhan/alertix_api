import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";
import { initFirebase } from "./config/firebase";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  initFirebase();

  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
};

start();
