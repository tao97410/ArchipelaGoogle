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
                {?SeaId (wdt:P31/wdt:P279*) wd:Q165} UNION {?SeaId (wdt:P31/wdt:P279*) wd:Q9430}
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
        dataFinal.Name = data.results.bindings[0].Name?.value;
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

    console.log(dictionnaireHTML);
    
  for (var key in dictionnaireHTML) {
    if (dictionnaireHTML.hasOwnProperty(key)) {
      // Récupérer le tableau associé à la clé
        var elementArray = dictionnaireHTML[key];
        
          // Mettre la valeur associée à la clé dans le HTML du deuxième élément
          if(elementArray[1].classList.contains("carteIle"))
            
            elementArray[1].setAttribute('src',information[key]); //cas des iamges
          else if (key == "Coordinates"){
            elementArray[1].innerHTML = "lat " + information[key].latitude + "°</br> long " + information[key].longitude +"°";
          }else if(key=="Archipelago"){
            elementArray[1].innerHTML=information[key];
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
      

  if(dictionnaireHTML["Seas"]){
    var seas = dictionnaireHTML["Seas"][1].children;

    for (var i = 0; i < seas.length; i++) {
        seas[i].addEventListener('click', function(event) {
            // Call the GoToPage function with the 'id' attribute as the parameter
            var name = event.currentTarget.innerHTML;
            console.log(name);
            GoToPage(name,"Sea");
        });
    } 
  }
  
  
  if(dictionnaireHTML["Archipelago"]){
    var archipelago=dictionnaireHTML["Archipelago"][1];

    archipelago.addEventListener('click', function(event) {
      // Call the GoToPage function with the 'id' attribute as the parameter
      var name = event.currentTarget.innerHTML;
      GoToPage(name ,"Archipelago");
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
        disambiguation: 'false',
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
      return pageTitle;
    } else {
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
      if(c.title == "Catégorie:Portail:Îles/Articles liés" || c.title=="Catégorie:Portail:Maritime/Articles liés"){
        estPresent = true;
      }
    });
    if(estPresent){
      if (pageId !== '-1') {
        const introduction = pages[pageId].extract;
       
        return introduction + "\n    <i>(informations provenant de wikipédia)</i>";
      } else {
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

function nettoyerNomIle(nom) {
  // Convertir en minuscules
  nom = nom.toLowerCase();
  
  // Supprimer les caractères spéciaux et accents
  nom = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Supprimer les mots spécifiques
  nom = nom.replace(/\b(islands|island|isla|islets)\b/g, '');

  // Supprimer les déterminants
  nom = nom.replace(/\b(le|la|les|du|de)\b/g, '');

 // Remplacer les doubles espaces par un seul espace
 nom = nom.replace(/\s+/g, ' ');

 // Supprimer les espaces en début et fin de chaîne
 nom = nom.trim();

  // Supprimer les espaces et caractères non alphabétiques
  //nom = nom.replace(/[^a-zA-Z]/g, '');

  return nom;
}

// Exemples d'utilisation



window.onload = async function () {

  
  rechercher();
  var islandDescription = document.getElementById("description-ile");
  let nomPage = await findWikipediaPage(getParameter("ile"));
  islandDescription.innerHTML = await fetchWikipediaIntroduction(nomPage,0)

};
