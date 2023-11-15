function getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function rechercher() {
    // Requête SPARQL à exécuter
const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Page ?Name ?Desc ?Area ?Population ?Coordinates ?ArchipelagoId ?ArchipelagoName ?SeasId ?SeasNames ?CountriesId ?CountriesNames ?Image ?Demonym ?Languages ?Flags ?Government
  WHERE {
    # Instances of island (or of subclasses of island)
    ?Page (wdt:P31/wdt:P279*) wd:Q23442.
    ?Page rdfs:label ?Name.
    ?Page wdt:P131 ?region.
    FILTER(lang(?Name) = 'fr')
    FILTER(STR(?Name) = \"`+ getParameter("ile") +`\")
    OPTIONAL{?Page schema:description ?Desc.
    FILTER(lang(?Desc) = 'fr')}
    # Get the area of the island
    # Use the psn: prefix to normalize the values to a common unit of area
    OPTIONAL {?Page wdt:P2046 ?Area.}
    OPTIONAL {?Page wdt:P1082 ?Population.}
    OPTIONAL {?Page wdt:P625 ?Coordinates.}
    OPTIONAL {?Page wdt:P361 ?ArchipelagoId.
    ?ArchipelagoId (wdt:P31/wdt:P279*) wd:Q33837.
    ?ArchipelagoId rdfs:label ?ArchipelagoName.
    FILTER(lang(?ArchipelagoName) = 'fr')}
    OPTIONAL {?Page wdt:P206 ?SeasId.
             ?SeasId rdfs:label ?SeasNames.
             FILTER(lang(?SeasNames)='fr')}
    OPTIONAL {?Page wdt:P17 ?CountriesId.
             ?CountriesId rdfs:label ?CountriesNames.
             FILTER(lang(?CountriesNames)='fr')}
    OPTIONAL{?Page wdt:P18 ?Image}
    OPTIONAL{?region wdt:P1549 ?Demonym}
    OPTIONAL{?region wdt:P37 ?LanguagesId.
             ?LanguagesId rdfs:label ?Languages.
             FILTER(lang(?Languages)='fr')}
    OPTIONAL{?region wdt:P41 ?Flags}
    OPTIONAL{?region wdt:P6 ?Government}
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

        let archi = {};
        archi.id = data.results.bindings[0]?.ArchipelagoId?.value;
        archi.Name = data.results.bindings[0]?.ArchipelagoName?.value;
        let jsonArchi = JSON.stringify(archi);

        dataFinal.Archipelago = JSON.parse(jsonArchi);
        
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
          let sea = {};
          sea.id = r?.SeasId?.value;
          sea.Name = r?.SeasNames?.value;
          let jsonSea = JSON.stringify(sea);
          if(!dataFinal.Seas.includes(jsonSea)){
            dataFinal.Seas.push(JSON.parse(jsonSea));
          }
          let country = {};
          country.id = r?.CountriesId?.value;
          country.Name = r?.CountriesNames?.value;
          let jsonCountry = JSON.stringify(country);
          if(!dataFinal.Countries.includes(jsonCountry)){
            dataFinal.Countries.push(JSON.parse(jsonCountry));
          }
                  
        });
        let jsonDataFinal = JSON.stringify(dataFinal);
        console.log(JSON.parse(jsonDataFinal));
        setPage(JSON.parse(jsonDataFinal));
      } else {
        console.error('Erreur lors de la requête SPARQL :', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la requête SPARQL :', error);
    }
  }
  queryWikidata();
}

function setPage(information) {
        var tbody=document.getElementsByTagName("tbody");
        var nomIle_html=document.getElementById('Content_NomIle');
        var statut_html=document.getElementById('Content_Statut');
        var area_html = document.getElementById('Content_Area');
        var population_html = document.getElementById('Content_Population');
        var coordonates_html = document.getElementById('Content_Coordonates');

        var archipel_html = document.getElementById('Content_Archipel');
        var mer_html = document.getElementById('Content_Seas');
        var pays_html = document.getElementById('Content_Countries');
        var gentile_html=  document.getElementById('Content_Gentile');
        var langues_html=  document.getElementById('Content_Langues');
        var chefAdministratif_html=  document.getElementById('Content_ChefAdministratif');
        var images_html= document.getElementById('images');
        



        console.log(information.Name);
        
        nomIle_html.innerHTML=information.Name;

        if (information.Desc)
            statut_html.innerHTML=information.Desc;
        if (information.Area)
            area_html.innerHTML = information.Area+"km²";
        if (information.Population)
            population_html.innerHTML = information.Population;
        if (information.Coordinates)
            coordonates_html.innerHTML="Lat "+information.Coordinates.latitude + "° ; Long " + information.Coordinates.longitude+"°"; 


        
        if (information.Archipelago)
        {
            archipel_html.innerHTML = information.Archipelago;
            archipel_html.setAttribute('Name',information.Archipelago);
        }

        // Extract names from each sea element and push them into the seaNames array
        if(information.Seas)
        {
            var seasLength = information.Seas.length;

            information.Seas.forEach((seaElement, index) => {
                var newElem = document.createElement('a');
                newElem.className = "contenu_cliquable";
                newElem.setAttribute('Name',seaElement);
                newElem.textContent = seaElement;
            
                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < seasLength - 1) {
                    newElem.textContent += ",";
                }
            
                mer_html.appendChild(newElem);
            });
        }

        // Join the seaNames array with commas to create a comma-separated list
        

        if(information.Countries)
        {
            var countriesLength = information.Countries.length;

            information.Countries.forEach((countryElement, index) => {
                var newElem = document.createElement('a');
                newElem.className = "contenu_cliquable";
                newElem.setAttribute('Name',countryElement);
                newElem.textContent = countryElement;

                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < countriesLength - 1) {
                    newElem.textContent += ",";
                }

                pays_html.appendChild(newElem);
            }); 
        }

        if(information.Demonym)
        gentile_html.innerHTML=information.Demonym;
        if(information.Government)
        chefAdministratif_html.innerHTML=information.Government;

        if(information.Languages)
        {

            var languagesLength = information.Languages.length;

            information.Languages.forEach((languageElement, index) => {
                var newElem = document.createElement('p');
                newElem.className = "contenu";
                newElem.textContent = languageElement;

                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < languagesLength - 1) {
                    newElem.textContent += ",";
                }

                langues_html.appendChild(newElem);
            });
        }

        let flag_html = document.getElementById('Flag');
        let image_html = document.getElementById('Image');

        if(information.Flags)
            flag_html.setAttribute('src',information.Flags[0]);
        if(information.Image)
            image_html.setAttribute('src',information.Image);




        // EVENT LISTENERS


        archipel_html.addEventListener('click', function(event) {
            // Call the GoToPage function with the 'id' attribute as the parameter
            var name = event.currentTarget;
            GoToPage(name,"Archipelago");
        });


        var merChildren = mer_html.children;

        for (var i = 0; i < merChildren.length; i++) {
            merChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var name = event.currentTarget;
                GoToPage(name,"Sea");
            });
        }

        var paysChildren = pays_html.children;

        for (var i = 0; i < paysChildren.length; i++) {
            paysChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var name = event.currentTarget;
                GoToPage(name,"Country");
            });
        }       

        
    

   
    
}

function GoToPage(name,type){

    var url = `../${type}/${type.toLowerCase()}.html?name=${name}`;
    document.location.href = url;
}

window.onload = function () {
    rechercher();
  };
