

var xhttp= new XMLHttpRequest();
xhttp.onreadystatechange=SetPage;

xhttp.open('GET','../../exemple2.json');

xhttp.send();

var information 


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
        
        nomIle_html.innerHTML=information.Name;
        statut_html.innerHTML=information.Desc;
        area_html.innerHTML = information.Area;
        population_html.innerHTML = information.Population;
        coordonates_html.innerHTML=information.Coordonates.latitude + " " + information.Coordonates.longitude; 
        archipel_html.innerHTML = information.Archipelago.Name;

       

        // Extract names from each sea element and push them into the seaNames array
        var seasLength = information.Seas.length;

        information.Seas.forEach((seaElement, index) => {
            var newElem = document.createElement('a');
            newElem.className = "contenu_cliquable";
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



        mer_html.forEach(seaElement => {

        });

        
        console.log(information.Archipelago.Name);
        

        
    }

   
    
}