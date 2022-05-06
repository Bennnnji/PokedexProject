var pokemons = [];

suite("Test pour la fonction getPokemonList", function () {
  // Test de non perte
  test("On vérifie que le nombre de pokemon renvoyé est bon", async function () {
    pokemons = await getPokemonList();
    chai.assert.equal(pokemons.length, 801);
  });
});

suite(
  "Tests pour la fonction getTypeOrdreTri",
  //On regarde si la fonction getTypeOrdreTri renvoie bien les bonnes valeurs pour chaque cas
  function () {
    //Test a vide
    test("#1 Si rien n'est defini dans l'étatCourant", function () {
      const { tri, order } = getTypeOrdreTri({});
      chai.assert.equal(tri, "id");
      chai.assert.equal(order, true);
    });
    test("#2 si tri et order son définis", function () {
      const etatCourant = { sortType: "Abilities", sortOrder: false };
      const { tri, order } = getTypeOrdreTri(etatCourant);
      chai.assert.equal(tri, etatCourant.sortType);
      chai.assert.equal(order, etatCourant.sortOrder);
    });
  }
);

suite("Tests pour la fonction getNbPokemonAAffiche", function () {
  test("#1 Si il n'y a pas de valeurs dans le champs de recherche", function () {
    const etatCourant = { pokemons: pokemons, tri: "id", order: true };
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 10); //10 car la fonction permet de renvoyer le nombre de pokemon à afficher sur la page initial soit 10
  });

  test("#2 Ont veut ensuite afficher 20 pokemons -> en cliquant sur le bouton show +", function () {
    const etatCourant = { pokemons: pokemons, nbPokemonsAffiches: 20 };
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 20);
  });

  test("#3 On veut ensuite enlever 10 pokemons de l'affichage en cliquant sur le bouton show - , alors qu'il y a 12 pokemons dans la liste", function () {
    const etatCourant = { pokemons: pokemons, nbPokemonsAffiches: 2 }; //12 - 10
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 10); //Il y'a bien 10 pokemons minimum affichés
  });

  test("#4 On appuie sur le bouton show + alors qu'il y a tout les pokemons d'affichés : 801", function () {
    const etatCourant = { pokemons: pokemons, nbPokemonsAffiches: 811 }; //801 + 10
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 801);
  });

  test("#5 Si il y a une valeur précise dans le champs de recherche", function () {
    const etatCourant = { pokemons: pokemons, search: "Ivysaur" };
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 1); //1 car il n'ya pas 2 pokemon avec ce nom
  });
  test("#6 Si la recherche est plus large ex: search = ' Iv ' ", function () {
    const etatCourant = { pokemons: pokemons, search: "Iv" };
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 6);
  });

  test("#7 Si la recherche est introuvale => valeur inexistante dans le table de pokemons", function () {
    const etatCourant = { pokemons: pokemons, search: "rezer" };
    const PokeToShow = getNbPokemonAAffiche(etatCourant);
    chai.assert.equal(PokeToShow, 0);
  });
});

suite("Tests pour la fonction PokemonToShow", function () {
  test("#1 Si il n'y a pas de valeurs dans le champs de recherche", function () {
    const etatCourant = { pokemons: pokemons };
    const pokeToShow = PokemonToShow(etatCourant);
    chai.assert.equal(pokeToShow.length, 801);
  });

  test("#2 Si il y'a une valeur précise dans le champs de recherche", function () {
    const etatCourant = { pokemons: pokemons, search: "Charmander" };
    const pokeToShow = PokemonToShow(etatCourant);
    chai.assert.equal(pokeToShow.length, 1);
    //Verification plus approfondit
    chai.assert.equal(
      pokeToShow.map((pokemon) => pokemon.Name),
      "Charmander"
    );
    chai.assert.equal(
      pokeToShow.map((pokemon) => pokemon.JapaneseName),
      "Hitokageヒトカゲ"
    );
  });
  test("#3 Si la recherche est plus large", function () {
    const etatCourant = { pokemons: pokemons, search: "Char" };
    const pokeToShow = PokemonToShow(etatCourant);
    chai.assert.equal(pokeToShow.length, 5);
    //Verification plus approfondit
    const Verif = [
      "Charmander",
      "Charmeleon",
      "Charizard",
      "Chimchar",
      "Charjabug",
    ];
    chai.assert.deepEqual(
      pokeToShow.map((pokemon) => pokemon.Name),
      Verif
    );
  });
  test("#4 Si la recherche est introuvale => valeur inexistante dans le table de pokemons", function () {
    const etatCourant = { pokemons: pokemons, search: "erzerz" };
    const pokeToShow = PokemonToShow(etatCourant);
    chai.assert.equal(pokeToShow.length, 0);
  });
});

suite;
