// Constants
const DBPEDIA_API = 'https://dbpedia.org/snorql'

function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  // Requête SPARQL à exécuter
  const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Desc ?Area ?Population ?Coordinates ?Archipelago ?Seas ?Countries ?Image
  WHERE {
    # Instances of island (or of subclasses of island)
    ?Page (wdt:P31/wdt:P279*) wd:Q23442.
    ?Page rdfs:label ?Name.
    FILTER(lang(?Name) = 'fr')
    FILTER(?Name = \"` + getParameter("ile") + `\")
    # Get the area of the island
    # Use the psn: prefix to normalize the values to a common unit of area
    ?Page p:P2046/psn:P2046/wikibase:quantityAmount ?Area.
    ?Page rdfs:description ?Desc.
    FILTER(lang(?Desc) = 'fr')
    ?Page p:P1082/psn:P1082 ?Population.
    ?Page p:P625/psn:P625 ?Coordinates.
    ?Page p:P361/psn:P361 ?Archipelago.
    ?Archipelago (wdt:P31/wdt:P279*) wd:Q33837.
    ?Page p:P206/psn:P206 ?Seas.
    ?Page p:P17/psn:P17 ?Countries.
  }
  ORDER BY DESC(?Area)
  LIMIT 100`;

  // URL de l'endpoint SPARQL de Wikidata
  const endpointUrl = 'https://query.wikidata.org/sparql';

  // Construire l'URL de la requête GET en ajoutant la requête SPARQL en tant que paramètre
  const sparqlUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

  // Fonction pour effectuer la requête SPARQL
  async function queryWikidata() {
    try {
      console.log("before queyr");
      const response = await fetch(sparqlUrl);
      console.log("before queyr");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error('Erreur lors de la requête SPARQL :', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la requête SPARQL :', error);
    }
  }

  queryWikidata();
}

function setPage(island) {
  if (this.readyState == 4 && this.status == 200) {
    var tbody = document.getElementsByTagName("tbody");
    var information = JSON.parse(this.response);
    console.log(information);
    var nomIle = document.getElementById('nomIle');
    var statut = document.getElementById('Statut');
    nomIle.innerHTML = information.entities.Q17070.labels.fr.value;
    statut.innerHTML = information.entities.Q17070.descriptions.fr.value;
  }

}

async function findWikipediaPage(title) {
  title = "Île " + title
  try {
    const response = await fetch('https://fr.wikipedia.org/w/api.php?' +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        origin: '*',
        srsearch: title,
        srnamespace: 0, // Limite la recherche aux articles
      })
    );

    const data = await response.json();
    const searchResults = data.query.search;

    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const pageTitle = firstResult.title;
      console.log('Titre de la page Wikipedia :', pageTitle);
      console.log(pageTitle)
      return pageTitle;
    } else {
      console.log('Aucun résultat trouvé pour la recherche.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la recherche sur Wikipedia :', error.message);
    return null;
  }
}

async function fetchWikipediaIntroduction(pageTitle) {
  try {
    const response = await fetch(`https://fr.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts',
        titles: pageTitle,
        origin: '*',
        exintro: true,
      }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const pages = data.query.pages;
    console.log(data);
    const pageId = Object.keys(pages)[0];
    console.log("Page id : " + pageId)
    if (pageId !== '-1') {
      const introduction = pages[pageId].extract;
      //console.log('Introduction de la page Wikipedia :', introduction);
      //return introduction;
    } else {
      console.log('Page non trouvée.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'introduction :', error.message);
    return null;
  }
}

window.onload = async function () {
  var islandDescription = document.getElementById("description-ile");
  let nomPage = await findWikipediaPage("Groenland");
  islandDescription.innerHTML = await fetchWikipediaIntroduction(nomPage)
};