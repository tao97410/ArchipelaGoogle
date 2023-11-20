function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  document.getElementById("loading").style.display = "block";

  console.log("appel à la fonction rechercher");
  // Requête SPARQL à exécuter
  const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Page ?Name
WHERE {
    { SELECT DISTINCT ?Page ?Name 
      WHERE {
      # Instances of island (or of subclasses of island)
      ?Page (wdt:P31/wdt:P279*) wd:Q23442.
      ?Page rdfs:label ?Name.
      BIND(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      ?Name,
      "[ÀÁÂÃÄÅàáâãäå]", "A", "i"),
      "[ÈÉÊËèéêë]", "E", "i"),
      "[ÌÍÎÏìíîï]", "I", "i"),
      "[ÒÓÔÕÖØòóôõöø]", "O", "i"),
      "[ÙÚÛÜùúûü]", "U", "i"),
      "[Çç]", "C", "i"),
      "[Ññ]", "N", "i"),
      "[Ýý]", "Y", "i") as ?Name_sans_accent) .
      FILTER(lang(?Name) = 'fr')
      FILTER(contains(lcase(?Name_sans_accent), \"` + getParameter("rechercher") + `\"))
      }
      LIMIT 100
      }  
  }  
  ORDER BY ASC(?Name)`;

  // URL de l'endpoint SPARQL de Wikidata
  const endpointUrl = 'https://query.wikidata.org/sparql';

  // Construire l'URL de la requête GET en ajoutant la requête SPARQL en tant que paramètre
  const sparqlUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

  // Fonction pour effectuer la requête SPARQL
  async function queryWikidata() {
    try {
      const response = await fetch(sparqlUrl);
      if (response.ok) {
        const data = await response.json();
        document.getElementById("loading").style.display = "none";
        afficherResultats(data);
      } else {
        console.error('Erreur lors de la requête SPARQL :', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la requête SPARQL :', error);
    }
  }

  queryWikidata();
}

function afficherResultats(data) {

  var contenuTableau = "";
  var titleContainer = document.getElementById("title-container");

  if (data.results.bindings.length == 0)
  {
    titleContainer.innerHTML = "<h1>Résultats de votre recherche : aucune île trouvée</h1>";
  } else {
  titleContainer.innerHTML = "<h1>Résultats de votre recherche : " + data.results.bindings.length + (data.results.bindings.length == 1 ? " île trouvée</h1>" : " îles trouvées</h1>");
  }


  data.results.bindings.forEach(r => {
    contenuTableau += "<a class='resultLink' href =\"../../Source/Island/island.html?ile=" + r.Name.value + "\"><div class='resultContainer'> "+ r.Name.value + " </div></a>";
  });

  document.getElementById("resultats").innerHTML = contenuTableau;

}

window.onload = function () {
  rechercher();
};