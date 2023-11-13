function getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function rechercher() {
    console.log("appel à la fonction rechercher");
    // Requête SPARQL à exécuter
const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Page ?Name
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
    # Get the area of the island
    # Use the psn: prefix to normalize the values to a common unit of area
    ?Page p:P2046/psn:P2046/wikibase:quantityAmount ?islandArea.
    }
    ORDER BY DESC(?islandArea)
    LIMIT 100`;

    // URL de l'endpoint SPARQL de Wikidata
    const endpointUrl = 'https://query.wikidata.org/sparql';

    // Construire l'URL de la requête GET en ajoutant la requête SPARQL en tant que paramètre
    const sparqlUrl = endpointUrl + "?query="+encodeURIComponent(sparqlQuery)+ "&format=json";

    // Fonction pour effectuer la requête SPARQL
    async function queryWikidata() {
        try {
            const response = await fetch(sparqlUrl);
            if (response.ok) {
            const data = await response.json();
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

  function afficherResultats(data)
  {
    // Tableau pour mémoriser l'ordre des variables ; sans doute pas nécessaire
    // pour vos applications, c'est juste pour la démo sous forme de tableau
    var index = [];
    var contenuTableau = "<tr>";

    data.head.vars.forEach((v, i) => {
      contenuTableau += "<th>" + v + "</th>";
      index.push(v);
    });
    
    data.results.bindings.forEach(r => {
      contenuTableau += "<tr>";
      contenuTableau += "<td><a href='" + r.Page.value + "' target='_blank'>" + r.Page.value + "</a></td>";
      contenuTableau += "<td><a href =\"../../Source/Island/island.html?ile="+r.Name.value +"\">" + r.Name.value +" </a></td>";
      contenuTableau += "</tr>";
    });


    contenuTableau += "</tr>";

    document.getElementById("Resultats").innerHTML = contenuTableau;

  }

  window.onload = function () {
    rechercher();
  };