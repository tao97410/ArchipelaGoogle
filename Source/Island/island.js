

var xhttp= new XMLHttpRequest();
xhttp.onreadystatechange=SetPage;

xhttp.open('GET','../../exemple2.json');

xhttp.send();

 window.onload = function () {
    SetPage();
 };


function SetPage(island) {
    if(this.readyState==4 && this.status==200){
        var tbody=document.getElementsByTagName("tbody");
        var information=JSON.parse(this.response);
        console.log(information);
        var nomIle_html=document.getElementById('Content_NomIle');
        var statut_html=document.getElementById('Content_Statut');
        var area_html = document.getElementById('Content_Area');
        var population_html = document.getElementById('Content_Population');
        var coordonates_html = document.getElementById('Content_Coordonates');

        var archipel_html = document.getElementById('Content_Archipel');
        var mer_html = document.getElementById('Content_Seas');
        var pays_html = document.getElementById('Content_Countries');

        console.log(information.Name);
        
        nomIle_html.innerHTML=information.Name;
        statut_html.innerHTML=information.Desc;
        area_html.innerHTML = information.Area;
        population_html.innerHTML = information.Population;
        coordonates_html.innerHTML=information.Coordonates.latitude + " " + information.Coordonates.longitude; 


        archipel_html.setAttribute('id',information.Archipelago.id);
        archipel_html.innerHTML = information.Archipelago.Name;

       

        // Extract names from each sea element and push them into the seaNames array
        var seasLength = information.Seas.length;

        information.Seas.forEach((seaElement, index) => {
            var newElem = document.createElement('a');
            newElem.className = "contenu_cliquable";
            newElem.setAttribute('id',seaElement.id);
            newElem.textContent = seaElement.Name;
        
            // Ajoutez une virgule si ce n'est pas le dernier élément
            if (index < seasLength - 1) {
                newElem.textContent += ",";
            }
        
            mer_html.appendChild(newElem);
        });

        // Join the seaNames array with commas to create a comma-separated list
        


        var countriesLength = information.Countries.length;

        information.Countries.forEach((countryElement, index) => {
            var newElem = document.createElement('a');
            newElem.className = "contenu_cliquable";
            newElem.setAttribute('id',countryElement.id);
            newElem.textContent = countryElement.Name;

            // Ajoutez une virgule si ce n'est pas le dernier élément
            if (index < countriesLength - 1) {
                newElem.textContent += ",";
            }

            pays_html.appendChild(newElem);
        });


        // EVENT LISTENERS


        archipel_html.addEventListener('click', function(event) {
            // Call the GoToPage function with the 'id' attribute as the parameter
            var id = event.currentTarget.id;
            GoToPage(id,"Archipelago");
        });


        var merChildren = mer_html.children;

        for (var i = 0; i < merChildren.length; i++) {
            merChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var id = event.currentTarget.id;
                GoToPage(id,"Sea");
            });
        }

        var paysChildren = pays_html.children;

        for (var i = 0; i < paysChildren.length; i++) {
            paysChildren[i].addEventListener('click', function(event) {
                // Call the GoToPage function with the 'id' attribute as the parameter
                var id = event.currentTarget.id;
                GoToPage(id,"Country");
            });
        }
        
        

        
    }

   
    
}

function GoToPage(id,type){

    var url = `../${type}/${type.toLowerCase()}.html?id=${id}`;
    console.log(url);
    document.location.href = url;
}