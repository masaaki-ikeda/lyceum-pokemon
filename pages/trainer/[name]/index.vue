<script setup>
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { data: trainer, refresh } = await useFetch(
  () => `/api/trainer/${route.params.name}`,
  {
    default: () => [],
    // #147: トレーナー画面で再読み込みしたあとのトレーナー取得について修正
    server: false,
    baseUrl: config.public.backendOrigin,
  },
);
const onDelete = async () => {
  //非同期通信
  const response = await $fetch(`/api/trainer/${route.params.name}`, {
    baseURL: config.public.backendOrigin,
    method: "DELETE",
  }).catch((e) => e);
  if (response instanceof Error) return;
  router.push("/");
};
const nickname = ref("");
const onNickname = async (pokemon) => {
  const newTrainer = trainer.value;
  const index = newTrainer.pokemons.findIndex(({ id }) => id === pokemon.id);
  newTrainer.pokemons[index].nickname = trimAvoidCharacters(nickname.value);
  nickname.value = "";
  //非同期通信
  const response = await $fetch(`/api/trainer/${route.params.name}`, {
    baseURL: config.public.backendOrigin,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTrainer),
  }).catch((e) => e);
  if (response instanceof Error) return;
  await refresh();
  onCloseNickname();
};
const onRelease = async (pokemonId) => {
  //非同期通信
  const response = await fetch(
    `/api/trainer/${route.params.name}/pokemon/${pokemonId}`,
    {
      baseURL: config.public.backendOrigin,
      method: "DELETE",
    },
  ).catch((e) => e);
  if (response instanceof Error) return;
  await refresh();
  onCloseRelease();
};
const {
  dialog: deleteDialog,
  onOpen: onOpenDelete,
  onClose: onCloseDelete,
} = useDialog();
const {
  dialog: nicknameDialog,
  onOpen: onOpenNickname,
  onClose: onCloseNickname,
} = useDialog();
const {
  dialog: releaseDialog,
  onOpen: onOpenRelease,
  onClose: onCloseRelease,
} = useDialog();
</script>

<template>
  <div>
    <h1>トレーナー情報</h1>
    <div class="trainer-info">
      <img src="/avatar.png" />
      <span>{{ trainer.name }}</span>
    </div>
    <GamifyButton @click="onOpenDelete(true)"
      >マサラタウンにかえる
    </GamifyButton>
    <h2>てもちポケモン</h2>
    <CatchButton :to="`/trainer/${route.params.name}/catch`"
      >ポケモンをつかまえる
    </CatchButton>
    <GamifyList>
      <GamifyItem v-for="pokemon in trainer.pokemons" :key="pokemon.id">
        <!-- スプライト -->
        <img :src="pokemon.sprites.front_default" />
        <!-- 名前 -->
        <span class="pokemon-name">{{ pokemon.nickname || pokemon.name }}</span>

        <GamifyButton @click="onOpenNickname(pokemon)"
          >ニックネームをつける
        </GamifyButton>
        <GamifyButton @click="onOpenRelease(pokemon)"
          >はかせにおくる
        </GamifyButton>
        <!-- 種族値 -->
        <div class="table-stats">
          <table>
            <thead>
              <tr>
                <th>Height</th>
                <th>Weight</th>
                <th>Type</th>
                <th>Abilities</th>
                <th v-for='item in pokemon.stats'>{{item.stat.name}}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ pokemon.height }}</td>
                <td>{{ pokemon.weight }}</td>
                <td>
                  <template v-for='item in pokemon.types'>
                    {{item.type.name }},
                  </template> 
                </td>
                <td>
                  <template v-for='item in pokemon.abilities'>
                    {{item.ability.name }},
                  </template> 
                </td>
                <td v-for='item in pokemon.stats'>{{item.base_stat}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GamifyItem>
    </GamifyList>
    <GamifyDialog
      v-if="deleteDialog"
      id="confirm-delete"
      title="かくにん"
      description="ほんとうに　マサラタウンに　かえるんだな！　この　そうさは　とりけせないぞ！"
      @close="onCloseDelete"
    >
      <GamifyList :border="false" direction="horizon">
        <GamifyItem>
          <GamifyButton @click="onCloseDelete">いいえ</GamifyButton>
        </GamifyItem>
        <GamifyItem>
          <GamifyButton @click="onDelete">はい</GamifyButton>
        </GamifyItem>
      </GamifyList>
    </GamifyDialog>
    <GamifyDialog
      v-if="nicknameDialog"
      id="confirm-nickname"
      title="ニックネーム"
      :description="`${nicknameDialog.name}　の　ニックネームは？`"
      @close="onCloseNickname"
    >
      <div class="item">
        <label for="name">ニックネーム</label>
        <input
          id="name"
          v-model="nickname"
          @keydown.enter="onNickname(nicknameDialog)"
        />
      </div>
      <GamifyList :border="false" direction="horizon">
        <GamifyItem>
          <GamifyButton @click="onCloseNickname">キャンセル</GamifyButton>
        </GamifyItem>
        <GamifyItem>
          <GamifyButton @click="onNickname(nicknameDialog)"
            >けってい
          </GamifyButton>
        </GamifyItem>
      </GamifyList>
    </GamifyDialog>
    <GamifyDialog
      v-if="releaseDialog"
      id="confirm-release"
      title="かくにん"
      :description="`ほんとうに　${
        releaseDialog.nickname || releaseDialog.name
      }　を　はかせに　おくるんだな！　この　そうさは　とりけせないぞ！`"
      @close="onCloseRelease"
    >
      <GamifyList :border="false" direction="horizon">
        <GamifyItem>
          <GamifyButton @click="onCloseRelease">いいえ</GamifyButton>
        </GamifyItem>
        <GamifyItem>
          <GamifyButton @click="onRelease(releaseDialog.id)">はい</GamifyButton>
        </GamifyItem>
      </GamifyList>
    </GamifyDialog>
  </div>
</template>

<style scoped>
.item > label {
  display: block;
  margin-bottom: 0.25rem;
}

.gamify-item:hover img {
  animation: bounce;
  animation-duration: 0.8s;
  animation-iteration-count: infinite;
}

.trainer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.trainer-info > img {
  width: 3rem;
  height: 3rem;
}

.table-stats * {
  border-collapse: collapse;
  border: solid 2px #000000;
  padding: 0.5rem;
}

.table-stats > table > thead > tr > th {
  text-align: center;
}

.table-stats > table > tbody > tr > td {
  text-align: right;
}

</style>
