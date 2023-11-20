// Constants
const DBPEDIA_API = 'https://dbpedia.org/snorql'

function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("images").style.visibility="hidden";
  // Requête SPARQL à exécuter
  const sparqlQuery = `#defaultView:Table
SELECT DISTINCT ?Name ?Description ?Image ?Official ?Demonym ?Languages ?Motto ?Continent ?Capital ?Seas ?Coordinates ?Regime ?Head ?Population ?Currency ?IDH ?Area ?Map ?Flags
  WHERE {
    # Instances of countries
    ?Page (wdt:P31/wdt:P279*) wd:Q6256.
    ?Page rdfs:label ?Name.    
    FILTER(lang(?Name) = 'fr')
    FILTER(STR(?Name) = \"` + getParameter("name") + `\")
    OPTIONAL{?Page schema:description ?Description.
    FILTER(lang(?Description) = 'fr')}
    # Get the area of the island
    # Use the psn: prefix to normalize the values to a common unit of area
    OPTIONAL {?Page wdt:P2046 ?Area.}
    OPTIONAL {?Page wdt:P1082 ?Population.}
    OPTIONAL {?Page wdt:P625 ?Coordinates.}
    OPTIONAL {?Page wdt:P206 ?SeaId.
              ?SeaId rdfs:label ?Seas.
              FILTER(lang(?Seas) = 'fr')}
    OPTIONAL{?Page wdt:P18 ?Image}
    OPTIONAL{?Page wdt:P1549 ?Demonym.
             FILTER(lang(?Demonym) = 'fr')}
    OPTIONAL{?Page wdt:P37 ?LanguagesId.
             ?LanguagesId rdfs:label ?Languages.
             FILTER(lang(?Languages)='fr')}
    OPTIONAL{?Page wdt:P41 ?Flags}
    OPTIONAL{?Page wdt:P6 ?HeadId.
             ?HeadId rdfs:label ?Head.
             FILTER(lang(?Head)='fr')}
    OPTIONAL{?Page wdt:P1448 ?Official.
             FILTER(lang(?Official)='fr')}
    OPTIONAL{?Page wdt:P1546 ?MottoId.
             ?MottoId rdfs:label ?Motto.
             FILTER(lang(?Motto)='fr')}
    OPTIONAL{?Page wdt:P30 ?ContinentId.
             ?ContinentId rdfs:label ?Continent.
             FILTER(lang(?Continent)='fr')}
    OPTIONAL{?Page wdt:P36 ?CapitalId.
             ?CapitalId rdfs:label ?Capital.
             FILTER(lang(?Capital)='fr')}
    OPTIONAL{?Page wdt:P122 ?RegimeId.
             ?RegimeId rdfs:label ?Regime.
             FILTER(lang(?Regime)='fr')}
    OPTIONAL{?Page wdt:P38 ?CurrencyId.
             ?CurrencyId rdfs:label ?Currency.
             FILTER(lang(?Currency)='fr')}
    OPTIONAL{?Page wdt:P1081 ?IDH}
    OPTIONAL{?Page wdt:P242 ?Map}

  }
  ORDER BY ?Head ?IDH ?Countries ?Seas
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
        document.getElementById("images").style.visibility="visible" 
        dataFinal.Name = data.results.bindings[0].Name.value;
        dataFinal.Description = data.results.bindings[0].Desc?.value;
        dataFinal.Area = data.results.bindings[0]?.Area?.value;
        dataFinal.Population = data.results.bindings[0]?.Population?.value;
        dataFinal.Image = data.results.bindings[0]?.Image?.value;
        dataFinal.Demonym = data.results.bindings[0]?.Demonym?.value;
        dataFinal.Continent = data.results.bindings[0]?.Continent?.value;
        dataFinal.Official = data.results.bindings[0]?.Official?.value;
        dataFinal.Capital = data.results.bindings[0]?.Capital?.value;
        dataFinal.Currency = data.results.bindings[0]?.Currency?.value;
        dataFinal.Regime = data.results.bindings[0]?.Regime?.value;
        dataFinal.Head = data.results.bindings[data.results.bindings.length-1]?.Head?.value;
        dataFinal.Motto = data.results.bindings[0]?.Motto?.value;
        dataFinal.Map = data.results.bindings[0]?.Map?.value;

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

          dataFinal.IDH = r?.IDH?.value;
                  
        });
        let jsonDataFinal = JSON.stringify(dataFinal);

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
  var dictionnaireHTML = {};

  // Iterate through the keys in the JSON object
  for (var key in information) {
    if (information.hasOwnProperty(key)) {
      // Construct the element IDs based on the current key
      var libelleId = "Libelle_" + key;
      var contentId = "Content_" + key;
  
      // Get the elements using document.getElementById
      var libelleElement = document.getElementById(libelleId);
      var contentElement = document.getElementById(contentId);
  
      // Create an array with the elements and assign it to the key in the dictionary
      dictionnaireHTML[key] = [libelleElement, contentElement];

    }
  }

    
    
  for (var key in dictionnaireHTML) {
    if (dictionnaireHTML.hasOwnProperty(key)) {
      // Récupérer le tableau associé à la clé
        var elementArray = dictionnaireHTML[key];
        
          // Mettre la valeur associée à la clé dans le HTML du deuxième élément
          if(elementArray[1].classList.contains("carteIle"))
            
            elementArray[1].setAttribute('src',information[key]); //cas des iamges
          else if (key == "Coordinates"){
            elementArray[1].innerHTML = "lat " + information[key].latitude + "°</br> long " + information[key].longitude +"°";
          }
          else{
            if (elementArray[1].tagName == "P" || elementArray[1].tagName == "H1" )
            elementArray[1].insertAdjacentHTML('afterbegin', information[key] + " ");
            else if (elementArray[1].tagName == "DIV"){ //un tableau
              if(information[key][0])
              {
                    var Length = information[key].length;
        
                    information[key].forEach((Element,index) => {
                        var newElem = document.createElement('a');
                        newElem.className = "contenu_cliquable";
                        newElem.setAttribute('Name',Element);
                        newElem.innerHTML = Element;
                    
                        // Ajoutez une virgule si ce n'est pas le dernier élément
                        if (index < Length - 1) {
                            newElem.innerHTML += "<br>";
                        }
                    
                        elementArray[1].appendChild(newElem);
                    });
            }
            else{
              elementArray[0].remove();
            }
            
          }
          }
               
            

      }
    }


    //REMOVE
    // Get all elements with class "libelle" or "contenu"
    var libelleElements = document.getElementsByClassName("libelle");
    var contenuElements = document.getElementsByClassName("contenu");
    // Function to check if an element's ID is in the resultDictionary
    function isInDictionary(element) {
      var id = element.id.substring(element.id.lastIndexOf("_") + 1);
      return dictionnaireHTML.hasOwnProperty(id);
    }

    // Remove elements that are not in the resultDictionary
    function removeUnusedElements(elements) {
      for (var i = elements.length - 1; i >= 0; i--) {
        if (!isInDictionary(elements[i])) {
          elements[i].parentNode.parentNode.remove();
        }
      }
    }

    // Call the function for both "libelle" and "contenu" elements
    removeUnusedElements(libelleElements);
    removeUnusedElements(contenuElements);
      

  var seas = dictionnaireHTML["Seas"][1].children;

  for (var i = 0; i < seas.length; i++) {
      seas[i].addEventListener('click', function(event) {
          // Call the GoToPage function with the 'id' attribute as the parameter
          var name = event.currentTarget.name;
          GoToPage(name,"Sea");
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
      return pageTitle;
    } else {
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
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1') {
      const introduction = pages[pageId].extract;
      return introduction;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'introduction :', error.message);
    return null;
  }
}

window.onload = async function () {
    
  rechercher();
  var islandDescription = document.getElementById("description-ile");
  let nomPage = await findWikipediaPage(getParameter("name"));
  islandDescription.innerHTML = await fetchWikipediaIntroduction(nomPage)
};
