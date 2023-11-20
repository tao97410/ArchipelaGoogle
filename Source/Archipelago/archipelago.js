// Constants
const DBPEDIA_API = 'https://dbpedia.org/snorql'

function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  // Requête SPARQL à exécuter
  const sparqlQuery = `#defaultView:Table
  SELECT DISTINCT ?Page ?Name ?Desc ?Area ?Seas ?Countries ?Image 
    WHERE {
      # Instances of island (or of subclasses of island)
      ?Page (wdt:P31/wdt:P279*) wd:Q1402592.
      ?Page rdfs:label ?Name.    
      FILTER(lang(?Name) = 'fr')
      FILTER(STR(?Name) = \"` + getParameter("name") +`\")
      OPTIONAL{?Page schema:description ?Desc.
      FILTER(lang(?Desc) = 'fr')}
      # Get the area of the island
      # Use the psn: prefix to normalize the values to a common unit of area
      OPTIONAL {?Page wdt:P2046 ?Area.}
      OPTIONAL {?Page wdt:P206 ?SeaId.
                ?SeaId rdfs:label ?Seas.
                FILTER(lang(?Seas) = 'fr')}
      OPTIONAL {?Page wdt:P17 ?CountriesId.
        ?CountriesId rdfs:label ?Countries.
        FILTER(lang(?Countries) = 'fr')}
      OPTIONAL{?Page wdt:P18 ?Image}
    }
    ORDER BY ?Government ?Countries ?Seas
    LIMIT 100`;

  // URL de l'endpoint SPARQL de Wikidata
  const endpointUrl = 'https://query.wikidata.org/sparql';

  // Construire l'URL de la requête GET en ajoutant la requête SPARQL en tant que paramètre
  const sparqlUrl = endpointUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

  // Fonction pour effectuer la requête SPARQL
  console.log("pre requete")
  async function queryWikidata() {
    try {
      const response = await fetch(sparqlUrl);
      if (response.ok) {
        const data = await response.json();
        let dataFinal = {};          
        dataFinal.Name = data.results.bindings[0].Name.value;
        dataFinal.Desc = data.results.bindings[0].Desc?.value;
        dataFinal.Area = data.results.bindings[0]?.Area?.value;
        dataFinal.Image = data.results.bindings[0]?.Image?.value;
        dataFinal.Seas = [];
        dataFinal.Countries = [];
        data.results.bindings.forEach(r => {
          if(!dataFinal.Seas.includes(r?.Seas?.value)){
            dataFinal.Seas.push(r?.Seas?.value);
          }
          if(!dataFinal.Countries.includes(r?.Countries?.value)){
            dataFinal.Countries.push(r?.Countries?.value);

          }
                  
        });
        let jsonDataFinal = JSON.stringify(dataFinal);
        console.log(JSON.parse(jsonDataFinal));

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
                newElem.innerHTML = seaElement;
            
                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < seasLength - 1) {
                    newElem.innerHTML += "<br>";
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
                newElem.innerHTML = countryElement;

                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < countriesLength - 1) {
                    newElem.innerHTML += "<br>";
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
                newElem.innerHTML =languageElement;

                // Ajoutez une virgule si ce n'est pas le dernier élément
                if (index < languagesLength - 1) {
                    newElem.innerHTML += "<br>";
                }

                langues_html.appendChild(newElem);
            });
        }

        let flag_html = document.getElementById('Flag');
        let image_html = document.getElementById('Image');

        if(information.Flags)
            flag_html.setAttribute('src',information.Flags);
        if(information.Image)
            image_html.setAttribute('src',information.Image);




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
    const searchResults = data.query.search;

    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const pageTitle = firstResult.title;
      console.log('Titre de la page Wikipedia :', pageTitle);
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
      console.log('Introduction de la page Wikipedia :', introduction);
      return introduction + "\n    <i>(informations provenant de wikipédia)</i>";
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
  rechercher();
  var islandDescription = document.getElementById("description-archipel");
  let nomPage = await findWikipediaPage(getParameter("name"));
  islandDescription.innerHTML = await fetchWikipediaIntroduction(nomPage)
};
