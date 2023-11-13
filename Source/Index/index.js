function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function rechercher() {
    const newUrl = "../../Source/Results/results.html";
    document.location.href = newUrl + "?rechercher=" + removeAccents(document.getElementById("search-input").value.toLowerCase());
}

// Function to add the island names to the datalist
function addOptionsToDatalist(options) {
    var datalist = document.getElementById("islands");

    // Clear existing options (avoid bugs and duplicates)
    datalist.innerHTML = "";

    // Add new options
    options.forEach(function (optionText) {
        var option = document.createElement("option");
        option.value = optionText;
        datalist.appendChild(option);
    });
}

addOptionsToDatalist(["aaa", "aaab", "aaac", "bbbc"]);


function rechercherSuggestions() {
    // Requête SPARQL à exécuter
    const sparqlQuery = `#defaultView:Table
                        SELECT DISTINCT ?Name
                        WHERE {
                            # Instances of island (or of subclasses of island)
                            ?Page (wdt:P31/wdt:P279*) wd:Q23442.
                            ?Page rdfs:label ?Name.
                            
                            FILTER(lang(?Name) = 'fr')

                            # Get the area of the island
                            # Use the psn: prefix to normalize the values to a common unit of area
                            ?Page p:P2046/psn:P2046/wikibase:quantityAmount ?islandArea.
                            FILTER(?islandArea > 30000)

                        }
                        ORDER BY ASC(?Name)
                        LIMIT 2600`;

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
                const islandSuggestions = data.results.bindings.map((binding) => binding.Name.value);
                addOptionsToDatalist(islandSuggestions);
                console.log("Name suggestions found and added to datalist!");
            } else {
                console.error('Erreur récuperation des données :', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de la requête SPARQL :', error);
        }
    }

    queryWikidata();
}



// Call functions
rechercherSuggestions();