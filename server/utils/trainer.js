import {
  ListObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import s3Client from "./s3Client";

//トレーナー設定
const config = useRuntimeConfig();

const streamToString = (stream) =>
  // 非同期通信
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

/** トレーナーの一覧の取得 */
export const findTrainers = async () => {
  // S3バケットからトレーナー一覧を取得する
   // 非同期通信
  const objects = await s3Client.send(
    // AWS S3 のバケットを用意し今回のサンプルシステムのコードからアクセスできた
    // App Runner にデプロイして動作させられた（全機能実装完了しているかどうかは問わない）
    // 要件を満たしたサーバ機能 (削除機能は含めなくて良い) 一式を実装できた
    new ListObjectsCommand({ Bucket: config.bucketName }),
  );
  return objects.Contents ?? [];
};

/** トレーナーの取得 */
// トレーナーを取得する S3 クライアント処理の実装
export const findTrainer = async (name) => {
  // S3バケットからトレーナーを取得する
  // 非同期通信
  const object = await s3Client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      // jsonファイルを指定
      Key: `${name}.json`,
    }),
  );
  //バケットの内容をテキスト化して送信
  const trainer = JSON.parse(await streamToString(object.Body));
  return trainer;
};

/** トレーナーの追加更新 */
export const upsertTrainer = async (name, trainer) => {
  // S3バケットにトレーナーを追加更新する(衝突可能性あり)
  // 非同期通信
  const result = await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      // jsonファイルを指定
      Key: `${name}.json`,
       // jsonファイルをテキスト化して送信
      Body: JSON.stringify({ name: "", pokemons: [], ...trainer }),
    }),
  );
  return result;
};

/** トレーナーの削除 */
// TODO: トレーナーを削除する S3 クライアント処理の実装
export const deleteTrainer = async (name) => {
  // S3バケットからトレーナーを削除する
  // 非同期通信
  const result = await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      // jsonファイルを指定
      Key: `${name}.json`, 
    }),
  );
  return result;
};
