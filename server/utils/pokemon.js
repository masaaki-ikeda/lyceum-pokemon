/** ポケモンの取得 */
export const findPokemon = async (name) => { // 非同期
  //ポケモンAPIを非同期呼び出し
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`); // 非同期
  const pokemon  = await response.json(); // 非同期
  return pokemon;
};
