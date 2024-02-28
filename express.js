// CORSミドルウェアの利用
import cors from "cors";
import app from "~/server/utils/app";
import router from "~/server/utils/router";

//以下の設定でCORSを許可する
app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000" }),
);
app.use("/api", router);

app.listen(process.env.BACKEND_PORT ?? 4000);
