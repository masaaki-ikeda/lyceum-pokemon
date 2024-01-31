export const useRuntimeConfig = () => ({
  region: process.env.NUXT_REGION ?? "",
  bucketName: process.env.NUXT_BUCKET_NAME ?? "",
});
