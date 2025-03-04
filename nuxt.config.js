import { defineNuxtConfig } from "nuxt/config";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  css: ["animate.css"],
  runtimeConfig: {
    region: "ap-southeast-2",
    bucketName: "",
    public: {
      backendOrigin: undefined,
    },
  },
});
