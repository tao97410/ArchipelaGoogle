function getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function rechercher() {
    // Requête SPARQL à exécuter
const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Name ?Desc ?Area ?Population ?Coordinates ?Archipelago ?SeasId ?SeasNames ?CountriesId ?CountriesNames ?Image 
  WHERE {
    # Instances of island (or of subclasses of island)
    ?Page (wdt:P31/wdt:P279*) wd:Q23442.
    ?Page rdfs:label ?Name.
    FILTER(lang(?Name) = 'fr')
    FILTER(STR(?Name) = \"` + getParameter("ile") + `\")
    OPTIONAL{?Page schema:description ?Desc.
    FILTER(lang(?Desc) = 'fr')}
    # Get the area of the island
    # Use the psn: prefix to normalize the values to a common unit of area
    OPTIONAL {?Page wdt:P2046 ?Area.}
    OPTIONAL {?Page wdt:P1082 ?Population.}
    OPTIONAL {?Page wdt:P625 ?Coordinates.}
    OPTIONAL {?Page wdt:P361 ?Archipelago.
    ?Archipelago (wdt:P31/wdt:P279*) wd:Q33837.}
    OPTIONAL {?Page wdt:P206 ?SeasId.
             ?SeasId rdfs:label ?SeasNames.
             FILTER(lang(?SeasNames)='fr')}
    OPTIONAL {?Page wdt:P17 ?CountriesId.
             ?CountriesId rdfs:label ?CountriesNames.
             FILTER(lang(?CountriesNames)='fr')}
    OPTIONAL{?Page wdt:P18 ?Image}
  }
  ORDER BY ?Countries ?Seas
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
        let dataFinal = {};          
        dataFinal.Name = data.results.bindings[0].Name.value;
        dataFinal.Desc = data.results.bindings[0].Desc?.value;
        dataFinal.Area = data.results.bindings[0]?.Area?.value;
        dataFinal.Population = data.results.bindings[0]?.Population?.value;
        dataFinal.Coordinates = data.results.bindings[0]?.Coordinates?.value;
        dataFinal.Archipelago = data.results.bindings[0]?.Archipelago?.value;
        dataFinal.Image = data.results.bindings[0]?.Image?.value;
        dataFinal.Seas = [];
        dataFinal.Countries = [];
        data.results.bindings.forEach(r => {
          if(!dataFinal.Seas.some(row => row.includes(r?.SeasId?.value))){
            let sea = {};
            sea.id = r?.SeasId?.value;
            sea.Name = r?.SeasNames?.value;
            let jsonSea = JSON.stringify(sea);
            dataFinal.Seas.push(jsonSea);
          }
          
          if(!dataFinal.Countries.some(row => row.includes(r?.CountriesId?.value))){
            dataFinal.Countries.push([r?.CountriesId?.value, r?.CountriesNames?.value]);
          }          
        });
        let jsonDataFinal = JSON.stringify(dataFinal);
        console.log(jsonDataFinal);
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