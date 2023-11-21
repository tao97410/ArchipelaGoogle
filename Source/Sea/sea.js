// Constants
const DBPEDIA_API = 'https://dbpedia.org/snorql'

function getParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function rechercher() {
  // Requête SPARQL à exécuter
  document.getElementById("loading").style.display = "block";
  document.getElementById("images").style.visibility="hidden";
  const sparqlQuery = `#defaultView:Table
  SELECT DISTINCT ?Page ?Name ?Desc ?Area ?Lowest ?Depth ?Width ?Countries ?Image 
    WHERE {
      {# Instances of island (or of subclasses of island)
      ?Page (wdt:P31/wdt:P279*) wd:Q9430.
      ?Page rdfs:label ?Name.    
      FILTER(lang(?Name) = 'fr')
      FILTER(STR(?Name) = \"` + getParameter("name") + `\")
      OPTIONAL{?Page schema:description ?Desc.
      FILTER(lang(?Desc) = 'fr')}
      # Get the area of the island
      # Use the psn: prefix to normalize the values to a common unit of area
      OPTIONAL {?Page wdt:P2046 ?Area.}
      OPTIONAL {?Page wdt:P1589 ?LowestId.
                ?LowestId wdt:P2044 ?Lowest}
      OPTIONAL {?Page wdt:P4511 ?Depth.}
      OPTIONAL {?Page wdt:P2049 ?Width.}
      OPTIONAL {?Page wdt:P17 ?CountriesId.
        ?CountriesId rdfs:label ?Countries.
        FILTER(lang(?Countries) = 'fr')}
      OPTIONAL{?Page wdt:P18 ?Image}}
      UNION
      {?Page (wdt:P31/wdt:P279*) wd:Q165.
      ?Page rdfs:label ?Name.    
      FILTER(lang(?Name) = 'fr')
      FILTER(STR(?Name) = \"` + getParameter("name") + `\")
      OPTIONAL{?Page schema:description ?Desc.
      FILTER(lang(?Desc) = 'fr')}
      # Get the area of the island
      # Use the psn: prefix to normalize the values to a common unit of area
      OPTIONAL {?Page wdt:P2046 ?Area.}
      OPTIONAL {?Page wdt:P1589 ?LowestId.
                ?LowestId wdt:P2044 ?Lowest}
      OPTIONAL {?Page wdt:P4511 ?Depth.}
      OPTIONAL {?Page wdt:P2049 ?Width.}
      OPTIONAL {?Page wdt:P17 ?CountriesId.
        ?CountriesId rdfs:label ?Countries.
        FILTER(lang(?Countries) = 'fr')}
      OPTIONAL{?Page wdt:P18 ?Image}}
    }
    ORDER BY ?Depth  ?Countries ?Seas
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
        document.getElementById("images").style.visibility="visible"  ;    
        dataFinal.Name = data.results.bindings[0].Name.value;
        dataFinal.Desc = data.results.bindings[0].Desc?.value;
        dataFinal.Area = data.results.bindings[0]?.Area?.value;
        dataFinal.Depth = data.results.bindings[0]?.Depth?.value;
        dataFinal.Image = data.results.bindings[0]?.Image?.value;
        dataFinal.Width = data.results.bindings[0]?.Width?.value;
        dataFinal.Lowest = data.results.bindings[0]?.Lowest?.value;
        dataFinal.Countries = [];
        data.results.bindings.forEach(r => {
          if(!dataFinal.Countries.includes(r?.Countries?.value)){
            dataFinal.Countries.push(r?.Countries?.value);
          }
                  
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
            
        
            // Vérifier si le deuxième élément n'est pas nul et a la classe "contenu"
            if (elementArray[1] !== null ) {
              // Mettre la valeur associée à la clé dans le HTML du deuxième élément
              if(elementArray[1].classList.contains("carteIle"))
                
                elementArray[1].setAttribute('src',information[key]); //cas des iamges
              else{
                if (elementArray[1].tagName == "P" || elementArray[1].tagName == "H1" )
                elementArray[1].insertAdjacentHTML('afterbegin', information[key] + " ");
                else if (elementArray[1].tagName == "DIV"){ //un tableau
                  if(information[key][0])
                  {
                        var Length = information[key].length;
            
                        information[key].forEach((Element,index) => {
                            var newElem = document.createElement('a');
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
              } else {
              // Supprimer le premier élément du tableau
                if (elementArray[0]){
                  elementArray[0].remove();
                  elementArray[1].remove();
                }
                  
            }       
                

          }
        }
        //REMOVE
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

      var countries = dictionnaireHTML["Countries"][1].children;

      for (var i = 0; i < countries.length; i++) {
          countries[i].addEventListener('click', function(event) {
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
      return introduction + "\n    <i>(informations provenant de wikipédia)</i>";
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
