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
  new Promise((resolve, reject) => { // 非同期通信
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

/** トレーナーの一覧の取得 */
export const findTrainers = async () => {
  // S3バケットからトレーナー一覧を取得する
  const objects = await s3Client.send( // 非同期通信
    new ListObjectsCommand({ Bucket: config.bucketName }),
  );
  return objects.Contents ?? [];
};

/** トレーナーの取得 */
// トレーナーを取得する S3 クライアント処理の実装
export const findTrainer = async (name) => {
  // S3バケットからトレーナーを取得する
  const object = await s3Client.send( // 非同期通信
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: `${name}.json`, // jsonファイルを指定
    }),
  );
  const trainer = JSON.parse(await streamToString(object.Body));
  return trainer;
};

/** トレーナーの追加更新 */
export const upsertTrainer = async (name, trainer) => {
  // S3バケットにトレーナーを追加更新する(衝突可能性あり)
  const result = await s3Client.send( // 非同期通信
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: `${name}.json`, // jsonファイルを指定
      Body: JSON.stringify({ name: "", pokemons: [], ...trainer }), // jsonファ
    }),
  );
  return result;
};

/** トレーナーの削除 */
// TODO: トレーナーを削除する S3 クライアント処理の実装
export const deleteTrainer = async (name) => {
  // S3バケットからトレーナーを削除する
  const result = await s3Client.send( // 非同期通信
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: `${name}.json`, // jsonファイルを指定
    }),
  );
  return result;
};
