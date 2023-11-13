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
  const sparqlUrl = endpointUrl + "?query="+encodeURIComponent(sparqlQuery)+ "&format=json";

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
    if(this.readyState==4 && this.status==200){
        var tbody=document.getElementsByTagName("tbody");
        var information=JSON.parse(this.response);
        console.log(information);
        var nomIle=document.getElementById('nomIle');
        var statut=document.getElementById('Statut');
        nomIle.innerHTML=information.entities.Q17070.labels.fr.value;
        statut.innerHTML=information.entities.Q17070.descriptions.fr.value;
    } 
    
}



window.onload = function () {
    rechercher();
  };