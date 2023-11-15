function getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function rechercher() {
    // Requête SPARQL à exécuter
const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Page ?Name ?Desc ?Area ?Population ?Coordinates ?Archipelago ?Seas ?Countries ?Image ?Demonym ?Languages ?Flags ?Government
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
    OPTIONAL {?Page wdt:P361 ?ArchipelagoId.
              ?ArchipelagoId (wdt:P31/wdt:P279*) wd:Q33837.
              ?ArchipelagoId rdfs:label ?Archipelago.
              FILTER(lang(?Archipelago) = 'fr')}
    OPTIONAL {?Page wdt:P206 ?SeaId.
              ?SeaId rdfs:label ?Seas.
              FILTER(lang(?Seas) = 'fr')}
    OPTIONAL {?Page wdt:P17 ?CountriesId.
      ?CountriesId rdfs:label ?Countries.
      FILTER(lang(?Countries) = 'fr')}
    OPTIONAL{?Page wdt:P18 ?Image}
    OPTIONAL{?Page wdt:P131 ?region.
    OPTIONAL{?region wdt:P1549 ?Demonym.
             FILTER(lang(?Demonym) = 'fr')}
    OPTIONAL{?region wdt:P37 ?LanguagesId.
             ?LanguagesId rdfs:label ?Languages.
             FILTER(lang(?Languages)='fr')}
    OPTIONAL{?region wdt:P41 ?Flags}
    OPTIONAL{?region wdt:P6 ?GovernmentId.
             ?GovernmentId rdfs:label ?Government
             FILTER(lang(?Government)='fr')}}
  }
  ORDER BY ?Government ?Countries ?Seas
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
        dataFinal.Image = data.results.bindings[0]?.Image?.value;
        dataFinal.Demonym = data.results.bindings[0]?.Demonym?.value;
        dataFinal.Government = data.results.bindings[data.results.bindings.length-1]?.Government?.value;   
        dataFinal.Archipelago = data.results.bindings[0]?.Archipelago?.value;

        // Utilisation d'une expression régulière pour extraire les valeurs de latitude et de longitude
        let match = data.results.bindings[0]?.Coordinates?.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);

        if (match) {
          // match[1] contient la latitude, match[2] contient la longitude
          let latitude = parseFloat(match[1]);
          let longitude = parseFloat(match[2]);

          // Création de l'objet JSON avec les attributs latitude et longitude
          let jsonObject = { latitude, longitude };
          let jsonCoordinates = JSON.stringify(jsonObject);

          dataFinal.Coordinates = JSON.parse(jsonCoordinates);
        }else{
          dataFinal.Coordinates = undefined;
        }

        dataFinal.Languages = [];
        dataFinal.Flags = [];
        dataFinal.Seas = [];
        dataFinal.Countries = [];
        data.results.bindings.forEach(r => {
          if(!dataFinal.Languages.includes(r?.Languages?.value)){
            dataFinal.Languages.push(r?.Languages?.value);
          }
          if(!dataFinal.Flags.includes(r?.Flags?.value)){
            dataFinal.Flags.push(r?.Flags?.value);
          }
          if(!dataFinal.Seas.includes(r?.Seas?.value)){
            dataFinal.Seas.push(r?.Seas?.value);
          }
          if(!dataFinal.Countries.includes(r?.Countries?.value)){
            dataFinal.Countries.push(r?.Countries?.value);
          }
                  
        });
        let jsonDataFinal = JSON.stringify(dataFinal);
        console.log(JSON.parse(jsonDataFinal));
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