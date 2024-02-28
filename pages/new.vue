<script setup>
const router = useRouter();
const config = useRuntimeConfig();
const trainerName = ref("");
const safeTrainerName = computed(() => trimAvoidCharacters(trainerName.value));
const valid = computed(() => safeTrainerName.value.length > 0);

// いいえボタンを押したときに表示を戻す処理
function setDefault() {
  document.getElementById("dialog1").style.display = "";
  document.getElementById("dialog2").style.display = "none";
}

// はいボタンを押したときの処理
const onSubmit = async () => {
  //非同期
  const response = await $fetch("/api/trainer", {
    baseURL: config.public.backendOrigin,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: safeTrainerName.value,
    }),
  }).catch((e) => e);
  if (response instanceof Error){
    if (response.status==409){
      document.getElementById("dialog1").style.display = "none";
      document.getElementById("dialog2").style.display = "";
      return;
    }
    return;
  }
  document.getElementById("dialog1").style.display = "";
  document.getElementById("dialog2").style.display = "none";
  router.push(`/trainer/${safeTrainerName.value}`);
}

const { dialog, onOpen, onClose } = useDialog();
</script>

<!-- 「あたらしくはじめる」画面を実装し、トレーナーの新規登録ができた
「つづきからはじめる」画面を実装し、トレーナー一覧を表示できた
「トレーナー情報」画面を実装し、トレーナーの情報を一部でも表示できた（情報の表示方法は問わない）
「トレーナー情報」画面を実装し、トレーナーの保有ポケモンリストを画像付きで表示できた
「ポケモンをつかまえる」画面を実装し、ポケモンゲットだぜ！できた -->
<template>
  <div>
    <h1>あたらしくはじめる</h1>
    <p>では　はじめに　きみの　なまえを　おしえて　もらおう！</p>
    <form @submit.prevent>
      <div class="item">
        <label for="name">なまえ</label>
        <span id="name-description"
          >とくていの　もじは　とりのぞかれるぞ！
        </span>
        <input
          id="name"
          v-model="trainerName"
          aria-describedby="name-description"
          @keydown.enter="valid && onOpen(true)"
        />
      </div>
      <GamifyButton type="button" :disabled="!valid" @click="onOpen(true)"
        >けってい
      </GamifyButton>
    </form>
    <div id="dialog1" style="display: '';">
      <GamifyDialog
      v-if="dialog"
      id="confirm-submit"
      title="かくにん"
      :description="`ふむ・・・　きみは　${safeTrainerName}　と　いうんだな！`"
      @close="onClose"
    >
    <GamifyList :border="false" direction="horizon">
        <GamifyItem>
          <GamifyButton @click="onClose(); setDefault();">いいえ</GamifyButton>
        </GamifyItem>
        <GamifyItem>
          <GamifyButton @click="onSubmit">はい</GamifyButton>
        </GamifyItem>
      </GamifyList>
    </GamifyDialog>
    </div>
    <div id="dialog2" style="display: none;">
      <GamifyDialog
      v-if="dialog"
      id="confirm-submit"
      title="ようかくにん"
      :description="`　${safeTrainerName}　は　もう　つかわれているぞ！`"
      @close="onClose"
    >
      <GamifyList :border="false" direction="horizon">
        <GamifyItem>
          <GamifyButton @click="onClose(); setDefault();">いいえ</GamifyButton>
        </GamifyItem>
        <GamifyItem>
          <GamifyButton @click="onSubmit">それでもいい</GamifyButton>
        </GamifyItem>
      </GamifyList>
    </GamifyDialog>
    </div>
  </div>
</template>

<style scoped>
form {
  border-radius: 0.5rem;
  border: solid 4px #555;
  padding: 1.5rem 3rem;
}

form > :not(:last-child) {
  display: block;
  margin-bottom: 1rem;
}

.item > label,
.item > span {
  display: block;
  margin-bottom: 0.25rem;
}
.item > span {
  font-size: 0.875rem;
}
</style>
