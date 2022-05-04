/*
    Configuration de ESLint pour le projet
        -> https://eslint.org/demo 
*/

/*global console, fetch, clearTimeout, setTimeout, document*/
/*eslint no-undef: "error"*/
/*exported apiKey, serverUrl*/
/*eslint no-unused-vars: "error"*/
/*eslint max-len: ["error", { "code": 80, "ignoreComments": true, "ignoreTemplateLiterals": true, "ignoreStrings": true}]*/
/*eslint max-lines-per-function: ["error", {"max": 21, "skipComments": true, "skipBlankLines" : true}]*/ 


/* ******************************************************************
 * Constantes de configuration
 * ****************************************************************** */
const apiKey = "49ed5561-ddb3-433e-8a69-45ab8c1e120b"; // Clé du serveur
const serverUrl = "https://lifap5.univ-lyon1.fr"; // Url du serveur



/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
function fetchWhoami(apiKey) {
    return fetch(serverUrl + "/whoami", { headers: { "Api-Key": apiKey} })
    
}

/**
 * Fait une requête sur le serveur et insère le login dans la modale d'affichage
 * de l'utilisateur puis déclenche l'affichage de cette modale.
 *
 * @param {Etat} etatCourant l'état courant
 * @returns Une promesse de mise à jour
 */

function lanceWhoamiEtInsereLogin(etatCourant, apiKey) {
      return fetchWhoami(apiKey).then((data) => {

      if(data.status == 401) return data.json().then((response) => 
      {
        majEtatEtPage(etatCourant, {
          login: undefined, // qui vaut undefined en cas d'erreur
          errLogin: response.message, // qui vaut undefined si tout va bien
          apiKey : apiKey,

        });
      });
      return data.json().then((data) => 
      {
        majEtatEtPage(etatCourant, {
          login : data.user,
          errLogin: undefined,
          apiKey : apiKey,
        });
      })
})
}

/**
 * Génère le code HTML du corps de la modale de login. On renvoie en plus un
 * objet callbacks vide pour faire comme les autres fonctions de génération,
 * mais ce n'est pas obligatoire ici.
 * Affiche nottament les erreurs lors de la validation de la clé API
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et un objet vide
 * dans le champ callbacks
 */
function genereModaleLoginBody(etatCourant) {
  const erreurs = etatCourant.errLogin ? etatCourant.errLogin : "";
  const login = etatCourant.login ? etatCourant.login : "";
  const content = `<div class="field">
                        ${login ? `<p>Connexion en tant que : <strong>${login}</strong></p>` : `
                        <label class="label">API Key</label>
                        <input id="modal-login-input" class="input" value="${etatCourant.apiKey ? etatCourant.apiKey : ''}">`}
                    </div>`
    return {
        html:`<section class="modal-card-body">${content}${erreurs}</section>`,
        callbacks: {},
    };
}

/**
 * Génère le code HTML du titre de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginHeader(etatCourant) {
    return {
        html: `
              <header class="modal-card-head  is-back">
                <p class="modal-card-title">Utilisateur</p>
                <button id="btn-close-login-modal1" class="delete" aria-label="close"></button>
              </header>`,
        callbacks: {
            "btn-close-login-modal1": {
                onclick:() => majEtatEtPage(etatCourant, { loginModal:false }),
                
            },
        },
    };
}

/**
 * Genere le code html des boutons du footer de la modalde de login
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML
 */
function genereHTMLModaleLoginFooter(etatCourant)
{
  const BoutonValider = etatCourant.login ? "" : `<button id="ValiderB" tab-index="0" class="is-success button">Valider</button>`;
  const BoutonFermer = `<button id="closeB" tab-index="0" class="button">Fermer</button>`
    return {
        html: `
        <footer class="modal-card-foot" style="justify-content: flex-end">
        ${BoutonValider}
        ${BoutonFermer}
        </footer>
        `,
        callbacks:{}
    }
}

/**
 * Génère le code HTML du bas de page de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginFooter(etatCourant) {
  const FooterHTML = genereHTMLModaleLoginFooter(etatCourant);
    return {
        html: FooterHTML.html,
        callbacks: {
            "closeB": {
                onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
            },
            "ValiderB":{
              onclick: () => {const apiKey = document.getElementById("modal-login-input").value;
                             lanceWhoamiEtInsereLogin(etatCourant, apiKey)}
            },
        },
    };
}

/**
 * Génère le code HTML de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLogin(etatCourant) {
    const header = genereModaleLoginHeader(etatCourant);
    const footer = genereModaleLoginFooter(etatCourant);
    const body = genereModaleLoginBody(etatCourant);
    const activeClass = etatCourant.loginModal ? "is-active" : "is-inactive";
    return {
        html: `
      <div id="mdl-login" class="modal ${activeClass}">
        <div class="modal-background"></div>
        <div class="modal-card">
          ${header.html}
          ${body.html}
          ${footer.html}
        </div>
      </div>`,
        callbacks: {...header.callbacks, ...footer.callbacks, ...body.callbacks },
    };
}

/* ************************************************************************
 * Gestion de barre de navigation contenant en particulier les bouton Pokedex,
 * Combat et Connexion.
 * ****************************************************************** */

/**
 * Déclenche la mise à jour de la page en changeant l'état courant pour que la
 * modale de login soit affichée
 * @param {Etat} etatCourant
 */
function afficheModaleConnexion(etatCourant) {
   return majEtatEtPage(etatCourant, {loginModal : true});
}

/**
 * Génère le code HTML et les callbacks pour la partie droite de la barre de
 * navigation qui contient le bouton de login.
 * Change en fonction de si l'utilisateur est connecté ou non
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBoutonConnexion(etatCourant) {
    const html = ` ${etatCourant.login != undefined ? `<span class="navbar-item">${etatCourant.login}</span>` : ''}
  <div class="navbar-end">
    <div class="navbar-item">
    ${etatCourant.login == undefined ? `<a id="btnConnexion" class="button is-light"> Connexion </a>` : '<a id="btnDeconnexion" class="button is-danger"> Deconnexion </a>'}
    </div>
  </div>`;
    return {
        html: html,
        callbacks: {
            "btnConnexion": {
                onclick: () => afficheModaleConnexion(etatCourant),
            },
            "btnDeconnexion": {
              onclick: () => majEtatEtPage(etatCourant, {login : undefined}),
          },
        },
    };
}

/**
 * Génère le code HTML de la barre de navigation et les callbacks associés.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBarreNavigation(etatCourant) {
    const connexion = genereBoutonConnexion(etatCourant);
    return {
      html:`
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-start">
          <div class="navbar-item">
              <a id="btn-pokedex" class="button is-light"> Pokedex </a>
              <a id="btn-combat" class="button is-light"> Combat </a>
          </div>
        </div>
        <div class="navbar-end">
          ${connexion.html}
        </div>
      </nav>`,
      callbacks: connexion.callbacks
    };
}

/**
 * Récupèrer le type et l'ordre de tri dans le tableau de pokemons
 * @param {Etat} etatCourant
 * @returns un objet contenant le type et l'ordre de tri
 */
function getTypeOrdreTri(etatCourant) {
  const sortType = etatCourant.sortType ? etatCourant.sortType : "id";
  const sortOrder = etatCourant.sortOrder!=undefined?etatCourant.sortOrder:true;
  return {
    tri: sortType,
    order: sortOrder,
  }
}

/**
 * Genere le header du tableau de pokemons avec des angles orientées en haut ou en bas selon l'ordre de tri que l'on souhaite
 * (si l'on clique sur un titre pour trié, le tri va se faire dans l'ordre croissant tout d'abord, et le deuxieème clique
 * inversera cette ordre etc.)
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML
 */
function GenereHTMLHeaderListPokemon(etatCourant){
  const {tri, order} = getTypeOrdreTri(etatCourant); // On récupère le tri et l'ordreb
  return {
    html: 
    `<thead>
      <tr>
        <th>Image</th>
        <th id="idSort">#<i class="${tri == "id" ? order ? "fas fa-angle-up" : "fas fa-angle-down" : ""}"></i></th>
        <th id="NameSort">Name<i class="${tri == "Name" ? order ? "fas fa-angle-up" : "fas fa-angle-down" : ""}"></i></th>
        <th id="AbilitiesSort">Abilities<i class="${tri == "Abilities" ? order ? "fas fa-angle-up" : "fas fa-angle-down" : ""}"></i></th>
        <th id="TypesSort">Types<i class="${tri == "Types" ? order ? "fas fa-angle-up" : "fas fa-angle-down" : ""}"></i></th>
      </tr>
    </thead>`,

    callbacks:{}
  }
}

/**
 * Genere le header du tableau de pokemons, avec des callbacks sur les titres de chaques colonnes pour 
 * pouvoir trier selon nos choix
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML et les callbacks
 */

function GenereHeaderListPokemon(etatCourant){
  const {tri, order} = getTypeOrdreTri(etatCourant); // On récupère le tri et l'ordreb
  const HeaderHTML = GenereHTMLHeaderListPokemon(etatCourant);
  return {
      html: HeaderHTML.html,
      callbacks: { 
      "idSort" : {onclick : () => majEtatEtPage(etatCourant, {sortType : "id", sortOrder : tri != "id" ? true : !order})},
      "NameSort": {onclick : () => majEtatEtPage(etatCourant, {sortType : "Name", sortOrder : tri != "Name" ? true : !order})},
      "AbilitiesSort" : {onclick : () => majEtatEtPage(etatCourant, {sortType : "Abilities", sortOrder : tri != "Abilities" ? true : !order}) },
      "TypesSort" : {onclick : () => majEtatEtPage(etatCourant, {sortType : "Types", sortOrder : tri != "Types" ? true : !order})},
    }
  }
}

/**
* Détermine le nombre de pokémons afficher sur la page.
* @param {Etat} etatCourant
* @returns {number} un nombre de pokémons à afficher
*/
function getNbPokemonAAffiche(etatCourant) {
  const nbPokemons = etatCourant.pokemons.filter(x => x.Name.toLowerCase().includes(etatCourant.search ? etatCourant.search.toLowerCase() : "")).length;
  const nbPokemonsAffiches = etatCourant.nbPokemonsAffiches?etatCourant.nbPokemonsAffiches:10;
  if (nbPokemonsAffiches > nbPokemons) return nbPokemons;
  if (nbPokemonsAffiches < nbPokemons && nbPokemons < 10) return nbPokemons;
  if (nbPokemonsAffiches < 10 && nbPokemons > 10) return 10;
  return nbPokemonsAffiches;
}

/**
 * Tri la liste de pokemon selon le type de tri (trié soit par : nom, id, abilitées, types) et si on a fait une recherche dans la barre de recherche
 * @param {Etat} etatCourant 
 * @returns une liste de pokemon trié et filtré
 */

function PokemonToShow(etatCourant)
{
  const {tri, order} = getTypeOrdreTri(etatCourant); // On récupère le tri et l'ordre
  const pokemons = etatCourant.pokemons
  const OrderedListePoke = pokemons.sort((a,b) => {
    if(tri == "id") return order ? a.PokedexNumber - b.PokedexNumber : b.PokedexNumber - a.PokedexNumber
    else if(tri == "Name") return order ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name);
    else if(tri == "Abilities") return order? a.Abilities.join("\n").localeCompare(b.Abilities.join("\n")) : b.Abilities.join("\n").localeCompare(a.Abilities.join("\n"));
    else if(tri == "Types") return order? a.Types.join("\n").localeCompare(b.Types.join("\n")) : b.Types.join("\n").localeCompare(a.Types.join("\n"));
  }).filter(x => x.Name.toLowerCase().includes(etatCourant.search ? etatCourant.search.toLowerCase() : ""));
    
  return OrderedListePoke
}

/**
 * Genere le contenu html des bouton pour afficher plus ou moins de pokemons dans le tableau
 * @returns un objet contenant le code HTML
 */
function GenereBoutonPlusMoins()
{
  return{
    html: `<div class="has-text-centered butons">
            <button id="btn-moins" class="button is-primary">Show -</button>
            <button id="btn-plus" class="button is-primary">Show +</button>
          </div>`,
    callbacks:{}
  }
}

/**
* Génère le html du footer de la table de la liste des pokémons.
* Contient deux boutons de pagination plus et moins pour afficher plus ou moins de pokémons.
* On affiche aussi le nb de pokémon affichés sur le nb total de pokémons.
* @param {Etat} etatCourant
* @returns un objet contenant le html et les callbacks
*/
function genereFooterListePokemon(etatCourant) {
  // nb total de pokémons qui peuvent être affichés (après une recherche ou non)
  const nbPokemons = etatCourant.pokemons.filter((x) => x.Name.toLowerCase().includes(etatCourant.search ? etatCourant.search.toLowerCase() : "")).length; 
  // nb de pokémons affichés
  const nbPokemonsAffiches = getNbPokemonAAffiche(etatCourant) 
  const Boutons = GenereBoutonPlusMoins()
  return {
      html: `${Boutons.html}
            <div class="has-text-centered">
                <strong>${nbPokemonsAffiches}</strong>/<strong>${nbPokemons}</strong> Pokemons
            </div>`,
      callbacks: {
          "btn-plus": {
              onclick: () => majEtatEtPage(etatCourant, {nbPokemonsAffiches: nbPokemonsAffiches + 10 < nbPokemons ? nbPokemonsAffiches + 10 : nbPokemons}),
          },
          "btn-moins": {
              onclick: () => majEtatEtPage(etatCourant, {nbPokemonsAffiches: nbPokemonsAffiches - 10 > 9 ? nbPokemonsAffiches - 10 : nbPokemons > 10 ? 10 : nbPokemons}),
          }
      }
  }              
}

/**
 * Genere le contenu html des infos de chaque pokemon qui se trouve dans le tableau (à gauche)
 * @param {pokemon[]} PokeToShow une liste de pokemon après tri 
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML
 */

function GenereHTMLListPokemon(PokeToShow, etatCourant)
{
  return {
    html : PokeToShow.map((pokemon) => 
      `<tr id="pokemon-${pokemon.PokedexNumber}" class="${etatCourant.pokemon && etatCourant.pokemon.PokedexNumber ==  pokemon.PokedexNumber ? "is-selected" : ""}">
      <td><img src="${pokemon.Images.Detail}" width="74" alt="${pokemon.Name}"/></td>
      <td>${pokemon.PokedexNumber}</td>
      <td>${pokemon.Name}</td>
      <td>${pokemon.Abilities.join("</br>")}</td>
      <td>${pokemon.Types.join("</br>")}</td>
      </tr>`).join(""),
    callbacks : {}
  }
}

/**
 * Genere le tableau de pokemons situé à gauche de l'écran
 * @param {pokemon[]} PokeToShow une liste de pokemon après tri
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML et les callbacks
 */
function genereListPokemon(PokeToShow,etatCourant) {
  const header = GenereHeaderListPokemon(etatCourant);
  const footer = genereFooterListePokemon(etatCourant);
  const ligneTab = GenereHTMLListPokemon(PokeToShow, etatCourant).html;
  // On crée un tableau avec les callbacks pour chaque pokemon du tableau
  //permet de cliquer sur chaque pokemon por afficher sa carte d'infos
  const callbacks = PokeToShow.map((pokemon) => ({
        [`pokemon-${pokemon.PokedexNumber}`]: {
          onclick: () => {
            //console.log("click pokemon", pokemon.PokedexNumber);
            majEtatEtPage(etatCourant, { pokemon: pokemon });
          }}})).reduce((acc, cur) => ({...acc, ...cur }), {})
      
      return {
        html: `<table class="table is-fullwidth"> 
                ${header.html} 
                ${ligneTab} 
               </table>
               ${footer.html}
        `,
        callbacks:{...callbacks, ...header.callbacks, ...footer.callbacks}
      }
}



/**
 * Genere le contenu html du header de la carte du pokemon afficher
 * (nom Japonnais, ID, Nom)
 * @param {pokemon[]} pokemon une liste de pokemons 
 * @returns un objet contenant le code HTML
 */
function GenereHeaderInfoPokemon(pokemon)
{
  return{
    html: `
    <div class="card-header">
      <div class="card-header-title">${pokemon.JapaneseName} (#${pokemon.PokedexNumber})</div>
    </div>
    <div class="card-content">
      <article class="media">
        <div class="media-content">
          <h1 class="title">${pokemon.Name}</h1>
        </div>
      </article>
    </div>`
  }
}

/**
 * Genere le contenu html des infos du pokemon dans la carte afficher 
 * (point d'attaques, Abilitées, Resistances, faiblesses)
 * @param {pokemon[]} pokemon une liste de pokemons 
 * @returns un objet contenant le code HTML
 */

function GenereBodyInfoPokemon(pokemon){
  return {html : 
    `<div class="media-content">
        <div class="content has-text-left">
          <p>Hit points: ${pokemon.Attack}</p>
          <h3>Abilities</h3>
          <ul>
            <li>${pokemon.Abilities.join("</li><li>")}</li>
          </ul>
          <h3>Resistant against</h3>
          <ul>
            <li>${Object.keys(pokemon.Against).filter(x => pokemon.Against[x] < 1).join("</li><li>")}</li>
          </ul>
          <h3>Weak against</h3>
          <ul>
            <li>${Object.keys(pokemon.Against).filter(x => pokemon.Against[x] > 1).join("</li><li>")}</li>
          </ul> 
        </div>
      </div>`
  }
}
/**
 * Genere le contenu html de l'image du pokemon affiché par la carte
 * @param {pokemon[]} pokemon une liste de pokemons
 * @returns un objet contenant le code HTML
 */

function GenereBodyImageInfoPokemon(pokemon)
{
  return{
    html : `
    <figure class="media-right">
      <figure class="image is-475x475">
        <img
        class=""
        src="${pokemon.Images.Full}"
        alt="${pokemon.name}"
        />
      </figure>
    </figure>`
  }
}
/**
 * Genere le contenu html du footer de la carte du pokemon 
 * (bouton ajouter dans le deck si l'utilisateur est connecté)
 * @param {Etat} etatCourant 
 * @returns un objet contenant le code HTML
 */

function GenereFooterInfoPokemon(etatCourant)
{
  return{
    html:`
    ${etatCourant.login == undefined ? "" :` 
    <div class="card-footer">
      <article class="media">
        <div class="media-content">
          <button class="is-success button" tabindex="0">
            Ajouter à mon deck
          </button>
        </div>
      </article>
    </div>`
    }`
  }
}

/**
* Génère le contenu html de la carte du pokemon qu'ont veut afficher à droite
* @param {Etat} etatCourant
* @returns un objet contenant le code HTML 
*/
function genereInfosPokemon(etatCourant) {    
  if (!etatCourant.pokemon) return { html: "", callbacks: {} };
  const header = GenereHeaderInfoPokemon(etatCourant.pokemon);
  const body = GenereBodyInfoPokemon(etatCourant.pokemon);
  const bodyImage = GenereBodyImageInfoPokemon(etatCourant.pokemon);
  const footer = GenereFooterInfoPokemon(etatCourant);
  const html =` <div class="card">
                  ${header.html}
                  <div class="card-content">
                    <article class="media">
                      ${body.html}
                      ${bodyImage.html}
                    </article>
                  </div>
                  ${footer.html}
                </div>`
  return {
    html: html
  }
}

/**
* Génère le contenu html avec les callbacks qui vont avec de la barre de recherche
* Callbacks -> c'est lorsqu'on va appuyer sur la touche entrée que la recherche va s'éffectuée
* l'appuie de la touche entrée sur un champ vide retournera tout les pokemons 
* @param {Etat} etatCourant
* @returns un objet contenant le code HTML et les callbacks
*/
function genereSearchBar(etatCourant)
{
    return {
      html: `
              <div class="field">
                <div class="control has-icons-left">
                  <input id="SearchBar" class="input" placeholder="Chercher un pokemon" type="text" value="">
              </div></div>` ,
      callbacks : {
        "SearchBar" : { onkeyup:(event) => event.code == "Enter" ? majEtatEtPage(etatCourant, {search : document.getElementById("SearchBar").value }) : null}
      }
    }
}

/**
* Génère le contenu html de la page Pokedex du choix entre tous les pokemon ou les pokemon de l'utilisateur.
* @returns un objet contenant le code HTML
*/
function GenereHTMLPagePokedex()
{
  return{
    html:`<div class="tabs is-centered">
            <ul>
              <li class="is-active" id="tab-all-pokemons">
                <a>Tous les pokemons</a>
              </li>
              <li id="tab-tout"><a>Mes pokemons</a></li>
             </ul>
          </div>`
  }
}

/**
* Génère le contenu de la page Pokedex du tableau de pokemons.
* @param {Etat} etatCourant
* @returns un objet contenant le code HTML et les callbacks du tableau 
*/
function GenereListPokemon(etatCourant)
{
  const NavPokemon = GenereHTMLPagePokedex() 
  const PokeToShow = PokemonToShow(etatCourant)
  const nbPokemonsAffiches = getNbPokemonAAffiche(etatCourant);// On récupère le nombre de pokémons à afficher
  const pokemonsAffiches = PokeToShow.slice(0, nbPokemonsAffiches);// On récupère les pokemons à afficher après la découpe
  const TabPoke = genereListPokemon(pokemonsAffiches,etatCourant);
  return {
    html :`${NavPokemon.html}              
             <div id="tbl-pokemons">
             ${TabPoke.html}
             </div>`,
    callbacks: TabPoke.callbacks
  }
}

/**
* Génère le contenu de la page Pokedex.
* @param {Etat} etatCourant
* @returns un objet contenant le code HTML et les callbacks
*/
function generePagePokedex(etatCourant) {
  const TabPokemon = GenereListPokemon(etatCourant);
  const pokemonInfos = genereInfosPokemon(etatCourant);     
  const SearchBar = genereSearchBar(etatCourant)
  const html = ` ${SearchBar.html}
              <section class="section">
                <div class="columns">
                  <div class="column">
                    ${TabPokemon.html}
                  </div>
                  <div class="column">
                    ${pokemonInfos.html}
                  </div>
                </div>
              </section>`
  return {
      html: html,
      callbacks: {...TabPokemon.callbacks, ...SearchBar.callbacks}
  }
}

function genereCorpsPage(etatCourant) {
    return generePagePokedex(etatCourant);
}

/**
 * Génére le code HTML de la page ainsi que l'ensemble des callbacks à
 * enregistrer sur les éléments de cette page.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */

function generePage(etatCourant) {
    const barredeNavigation = genereBarreNavigation(etatCourant);
    const modaleLogin = genereModaleLogin(etatCourant);
    const CorpsPage = genereCorpsPage(etatCourant);
    // remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
    // les dictionnaires de callbacks qui viennent de la barre et de la modale.
    // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
    // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
    // pratique ce cas ne doit pas se produire car barreDeNavigation et
    // modaleLogin portent sur des zone différentes de la page et n'ont pas
    // d'éléments en commun.
    return {
        html: barredeNavigation.html + modaleLogin.html + CorpsPage.html,
        callbacks: {...barredeNavigation.callbacks, 
          ...modaleLogin.callbacks, ...CorpsPage.callbacks, },
    };
}

/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Créée un nouvel état basé sur les champs de l'ancien état, mais en prenant en
 * compte les nouvelles valeurs indiquées dans champsMisAJour, puis déclenche la
 * mise à jour de la page et des événements avec le nouvel état.
 *
 * @param {Etat} etatCourant etat avant la mise à jour
 * @param {*} champsMisAJour objet contenant les champs à mettre à jour, ainsi
 * que leur (nouvelle) valeur.
 */
function majEtatEtPage(etatCourant, champsMisAJour) {
    const nouvelEtat = {...etatCourant, ...champsMisAJour };
    majPage(nouvelEtat);
}

/**
 * Prend une structure décrivant les callbacks à enregistrer et effectue les
 * affectation sur les bon champs "on...". Par exemple si callbacks contient la
 * structure suivante où f1, f2 et f3 sont des callbacks:
 *
 * { "btn-pokedex": { "onclick": f1 },
 *   "input-search": { "onchange": f2,
 *                     "oninput": f3 }
 * }
 *
 * alors cette fonction rangera f1 dans le champ "onclick" de l'élément dont
 * l'id est "btn-pokedex", rangera f2 dans le champ "onchange" de l'élément dont
 * l'id est "input-search" et rangera f3 dans le champ "oninput" de ce même
 * élément. Cela aura, entre autres, pour effet de délclencher un appel à f1
 * lorsque l'on cliquera sur le bouton "btn-pokedex".
 *
 * @param {Object} callbacks dictionnaire associant les id d'éléments à un
 * dictionnaire qui associe des champs "on..." aux callbacks désirés.
 */
function enregistreCallbacks(callbacks) {
    Object.keys(callbacks).forEach((id) => {
        const elt = document.getElementById(id);
        if (elt === undefined || elt === null) {
            console.log(
                `Élément inconnu: ${id}, impossible d'enregistrer de callback sur cet id`
            );
        } else {
            Object.keys(callbacks[id]).forEach((onAction) => {
                elt[onAction] = callbacks[id][onAction];
            });
        }
    });
}

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
    console.log("CALL majPage");
    const page = generePage(etatCourant);
    document.getElementById("root").innerHTML = page.html;
    enregistreCallbacks(page.callbacks);
}
/**
 * Fonction qui permet de récupérer la liste des pokémons dispo sur le serveur
 * En faisant une requête Fetch à l'url serverUrl + "/pokemon"
 * @returns La liste des pokémons dispo sur le serveur
 */
function getPokemonList() {
    return fetch(serverUrl + "/pokemon")
        .then(async(response) => {
            // Si la réponse est bonne, on retourne la liste des pokémons
            if (response.status == 200) {
                const data = (await response.json()).sort(
                  (a, b) => a.PokedexNumber - b.PokedexNumber); // On attend la réponse et on met dans data grâce à "AWAIT"
                return data;
            } else {
                // Sinon on retourne un tableau vide
                return []
            }
        }) // La même si une erreur survient on retourne un tableau vide
        .catch([])
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
async function initClientPokemons() {
    console.log("CALL initClientPokemons");
    const etatInitial = {
        loginModal: false,
        login: undefined,
        errLogin: undefined,
        pokemons: await getPokemonList(),
    };
    console.log(etatInitial);
    majPage(etatInitial);
}

// Appel de la fonction init_client_duels au après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    console.log("Exécution du code après chargement de la page");
    initClientPokemons();
});