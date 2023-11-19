// Constants
const DBPEDIA_API = 'https://dbpedia.org/snorql'
let searchResults;

function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("images").style.visibility="hidden";
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
              ?ArchipelagoId (wdt:P31/wdt:P279*) wd:Q1402592.
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
  const sparqlUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

  // Fonction pour effectuer la requête SPARQL
  async function queryWikidata() {
    try {
      const response = await fetch(sparqlUrl);
      if (response.ok) {
        const data = await response.json();
        let dataFinal = {};    
        document.getElementById("loading").style.display = "none";      
        document.getElementById("images").style.visibility="visible";
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

        var statut_html = document.getElementById('Content_Statut');
        const libelle_Statut = document.getElementById('Libelle_Statut');

        var area_html = document.getElementById('Content_Area');
        const libelle_Area = document.getElementById('Libelle_Area')
        var population_html = document.getElementById('Content_Population');
        const libelle_Population = document.getElementById('Libelle_Population');
        var coordinates_html = document.getElementById('Content_Coordinates');
        const libelle_Coordinates = document.getElementById('Libelle_Coordinates');
        var archipel_html = document.getElementById('Content_Archipel');
        const libelle_Archipel = document.getElementById('Libelle_Archipel');
        var mer_html = document.getElementById('Content_Seas');
        const libelle_Seas = document.getElementById('Libelle_Seas');
        var pays_html = document.getElementById('Content_Countries');
        const libelle_Countries = document.getElementById('Libelle_Countries');
        var gentile_html =  document.getElementById('Content_Gentile');
        const Libelle_Gentile = document.getElementById('Libelle_Gentile');
        var langues_html =  document.getElementById('Content_Langues');
        const libelle_Langues = document.getElementById('Libelle_Langues');
        var chefAdministratif_html =  document.getElementById('Content_ChefAdministratif');
        const Libelle_ChefAdministratif = document.getElementById('Libelle_ChefAdministratif');
        
        



        console.log(information.Name);
        
        nomIle_html.innerHTML=information.Name;

        if (information.Desc)
          statut_html.innerHTML=information.Desc;
        else{
          libelle_Statut.parentNode.parentNode.remove();
        }
            
        if (information.Area)
            area_html.innerHTML = information.Area+"km²";
        else
            libelle_Area.parentNode.parentNode.remove();
        if (information.Population)
          population_html.innerHTML = information.Population;
        else
            libelle_Population.parentNode.parentNode.remove();
        if (information.Coordinates)
            coordinates_html.innerHTML="Lat "+information.Coordinates.latitude + "° </br> Long " + information.Coordinates.longitude+"°"; 
        else
            libelle_Coordinates.parentNode.parentNode.remove();
          

       
        
        if (information.Archipelago)
        {
            archipel_html.innerHTML = information.Archipelago;
            archipel_html.setAttribute('Name',information.Archipelago);
        }
        else 
            libelle_Archipel.parentNode.parentNode.remove();

        // Extract names from each sea element and push them into the seaNames array
        if(information.Seas[0])
        {
        var seasLength = information.Seas.length;

        information.Seas.forEach((seaElement, index) => {
            var newElem = document.createElement('a');
            newElem.setAttribute('Name',seaElement);
            newElem.innerHTML = seaElement;
        
            // Ajoutez une virgule si ce n'est pas le dernier élément
            if (index < seasLength - 1) {
                    newElem.innerHTML += "<br>";
            }
        
            mer_html.appendChild(newElem);
        });
        }
        else 
            libelle_Seas.parentNode.parentNode.remove();

        // Join the seaNames array with commas to create a comma-separated list
        

        if(information.Countries[0])
        {
        var countriesLength = information.Countries.length;

        information.Countries.forEach((countryElement, index) => {
            var newElem = document.createElement('a');
            newElem.className = "contenu_cliquable";
                newElem.setAttribute('Name',countryElement);
                newElem.innerHTML = countryElement;

            // Ajoutez une virgule si ce n'est pas le dernier élément
            if (index < countriesLength - 1) {
                    newElem.innerHTML += "<br>";
            }

            pays_html.appendChild(newElem);
        });
        }
        else  
           libelle_Countries.parentNode.parentNode.remove();

        if(information.Demonym)
          gentile_html.innerHTML=information.Demonym;
        else
          Libelle_Gentile.parentNode.parentNode.remove();
        if(information.Government)
          chefAdministratif_html.innerHTML=information.Government;
        else
          Libelle_ChefAdministratif.parentNode.parentNode.remove();


        if(information.Languages[0])
        {

            var languagesLength = information.Languages.length;

            information.Languages.forEach((languageElement, index) => {
                var newElem = document.createElement('p');
                newElem.innerHTML =languageElement;

                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < languagesLength - 1) {
                    newElem.innerHTML += "<br>";
                }

                langues_html.appendChild(newElem);
            });
        }
        else
          libelle_Langues.parentNode.parentNode.remove();

        let flag_html = document.getElementById('Flag');
        let image_html = document.getElementById('Image');

        if(information.Flags[0])
            flag_html.setAttribute('src',information.Flags);
        else
            flag_html.remove();
        if(information.Image)
            image_html.setAttribute('src',information.Image);
        else
            image_html.remove();




        // EVENT LISTENERS


        archipel_html.addEventListener('click', function(event) {
            // Call the GoToPage function with the 'id' attribute as the parameter
            var name = event.currentTarget.name;
            GoToPage(name,"Archipelago");
        });


        var merChildren = mer_html.children;

        for (var i = 0; i < merChildren.length; i++) {
            merChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var name = event.currentTarget.name;
                GoToPage(name,"Sea");
            });
        }

        var paysChildren = pays_html.children;

        for (var i = 0; i < paysChildren.length; i++) {
            paysChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var name = event.currentTarget.name;
                GoToPage(name,"Country");
            });
        }
        
}

function GoToPage(name,type){

    var url = `../${type}/${type.toLowerCase()}.html?name=${name}`;
    document.location.href = url;
}
        

        
async function findWikipediaPage(title) {
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
    searchResults = data.query.search;

    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const pageTitle = firstResult.title;
      console.log('Titre de la page Wikipedia :', searchResults);
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

async function fetchWikipediaIntroduction(pageTitle, compteur) {
  try {
    const response = await fetch(`https://fr.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts|categories',
        titles: pageTitle,
        cllimit:'100',
        origin: '*',
        exintro: true,
      }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
   
    
    let estPresent = false;
    pages[pageId].categories.forEach(c => {
      if(c.title == "Catégorie:Portail:Îles/Articles liés" || c.title=="Catégorie:Portail:Îles"){
        estPresent = true;
      }
    });
    if(estPresent){
      console.log(data);
      console.log("Page id : " + pageId)
      if (pageId !== '-1') {
        const introduction = pages[pageId].extract;
        console.log('Introduction de la page Wikipedia :', introduction);
        return introduction;
      } else {
        console.log('Page non trouvée.');
        return null;
      }
    }else{
      if(compteur>=3 || searchResults.length == compteur ){
        return "Pas d'article associés sur Wikipedia";
      }else{
        compteur++;
        return fetchWikipediaIntroduction(searchResults[compteur].title, compteur);            
}


    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'introduction :', error.message);
    return null;
  }  
}

window.onload = async function () {

  
  rechercher();
  var islandDescription = document.getElementById("description-ile");
  let nomPage = await findWikipediaPage(getParameter("ile"));
  islandDescription.innerHTML = await fetchWikipediaIntroduction(nomPage,0)

};
