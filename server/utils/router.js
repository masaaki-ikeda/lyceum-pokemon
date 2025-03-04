import { Router } from "express";
import {
  findTrainers,
  findTrainer,
  upsertTrainer,
  deleteTrainer,
} from "~/server/utils/trainer";
import { findPokemon } from "~/server/utils/pokemon";

// ルーティング設定
// https://qiita.com/jinto/items/c953ab25253d8ec82e30
const router = Router();

/** トレーナー名の一覧の取得 */
// GET /api/trainers
// トレーナー名の一覧の取得
// パラメーター: なし
// レスポンス: 200: ["コジロウ", "サトシ", "ムサシ", "レッド"]
// GET /api/trainers でトレーナー一覧を JSON で返す API を実装できた
router.get("/trainers", async (_req, res, next) => {
  try {
    const trainers = await findTrainers();
    const trainerNames = trainers.map(({ Key }) => Key.replace(/\.json$/, ""));
    res.send(trainerNames);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの追加 */
// POST /api/trainer
// パラメーター: なし
// リクエストボディ
// name: トレーナー名（必須）
// pokemons: 手持ちポケモン（任意）
// レスポンス
// 200: PutObjectCommandOutput
// 400: 空（リクエストボディに必要なプロパティが含まれていない場合に返される）
// 409: 空（すでにトレーナーが存在する場合に返される）
router.post("/trainer", async (req, res, next) => {
  // 名前をトレーナーをキーとする
  // 衝突するかも
  try {
    // TODO: リクエストボディにトレーナー名が含まれていなければ400を返す
    if (!("name" in req.body && req.body.name.length > 0)){
      return res.sendStatus(400);
    }
    // TODO: すでにトレーナー（S3 オブジェクト）が存在していれば409を返す
    const trainers = await findTrainers();
    if (trainers.some(({ Key }) => Key === `${req.body.name}.json`)){
      return res.sendStatus(409);
    }
    // 非同期通信
    const result = await upsertTrainer(req.body.name, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの取得 */
// トレーナーを取得する API エンドポイントの実装
// パラメーター: trainerName: トレーナー名
// レスポンス: 200: { "name": "satoshi", "pokemons": [] }
// GET /trainer/:trainerName で指定トレーナーの情報を JSON で返す API を実装できた
router.get("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // 非同期通信
    const trainer = await findTrainer(trainerName);
    res.send(trainer);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの更新 */
// * 削除系 API エンドポイントを利用しないかぎりポケモンは保持する差分
// パラメーター: trainerName: トレーナー名
// リクエストボディ
// name: トレーナー名（必須）
// pokemons: 手持ちポケモン（任意）
// { "name": "satoshi" }
// レスポンス
// 200: PutObjectCommandOutput
// 404:  空（トレーナーが存在しない場合に返される）
// POST /api/trainer でトレーナーを追加する API を実装できた
router.post("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // 先にトレーナーを取得しておく
    const trainers = await findTrainers();
    // トレーナーが存在していなければ404を返す
    if (!trainers.some(({ Key }) => Key === `${trainerName}.json`))
      return res.sendStatus(404);
    // 非同期通信
    const result = await upsertTrainer(trainerName, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの削除 */
// トレーナーを削除する API エンドポイントの実装
// パラメーター: trainerName: トレーナー名
// レスポンス: 204: DeleteObjectCommandOutput
router.delete("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // 非同期通信
    const result = await deleteTrainer(trainerName);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** ポケモンの追加 */
// パラメーター
// trainerName: トレーナー名
// リクエストボディ: name: ポケモン名（必須）
// レスポンス: 200: PutObjectCommandOutput
// PUT->POST /api/trainer/:trainerName/pokemon/:pokemonName でトレーナーの持つポケモンを追加登録する API を実装できた
router.post("/trainer/:trainerName/pokemon", async (req, res, next) => {
  // ポケモンについてはIDをキーとする
  try {
    const { trainerName } = req.params;
    const trainer = await findTrainer(trainerName);
    if (!("name" in req.body && req.body.name.length > 0))
      return res.sendStatus(400);
    // APIを使い、名前からポケモン情報を取得する
    // PokeAPI を使ってポケモンの定義情報 (名前や画像など)を取得する処理を実装できた
    // 非同期通信
    const pokemon = await findPokemon(req.body.name);
    const {
      order,
      name,
      height,
      weight,
      abilities,
      types,
      stats,
      // ポケモンAPIの画像URL
      sprites: { front_default },
    } = pokemon;
    // トレーナーにポケモンを追加する
    trainer.pokemons.push({
      //トレーナーごとにIDを自動生成
      id: (trainer.pokemons[trainer.pokemons.length - 1]?.id ?? 0) + 1,
       // ニックネームの初期値は空とする
      nickname: "",
      order,
      name,
      height,
      weight,
      abilities,
      types,
      stats,
      // ポケモンAPIの画像URL
      sprites: { front_default },
    });
    // 非同期通信
    const result = await upsertTrainer(trainerName, trainer);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** ポケモンの削除 */
// ポケモンを削除する API エンドポイントの実装
// パラメーター
// trainerName: トレーナー名
// pokemonId: 手持ちポケモン識別子
// レスポンス: 200: DeleteObjectCommandOutput
router.delete(
  "/trainer/:trainerName/pokemon/:pokemonId",
  //非同期通信
  async (req, res, next) => {
    // ポケモンについてはIDをキーとする
    try {
      const { trainerName, pokemonId } = req.params;
      // 非同期通信
      const trainer = await findTrainer(trainerName);
      const index = trainer.pokemons.findIndex(
        (pokemon) => String(pokemon.id) === pokemonId,
      );
      trainer.pokemons.splice(index, 1);
      // 非同期通信
      const result = await upsertTrainer(trainerName, trainer);
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
