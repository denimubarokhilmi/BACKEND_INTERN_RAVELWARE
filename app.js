import express from "express";
import router from "./router/router.js";
const app = express();

const PORT = process.env.PORT_APP || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Content-Encoding", "gzip,brotli");
  res.setHeader("Connection", "Keep-Alive");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Keep-Alive", "timeout=10, max=200");
  next();
});

app.use(router);

app.listen(PORT, () => {
  console.log(`server is running in port ${PORT}`);
});
