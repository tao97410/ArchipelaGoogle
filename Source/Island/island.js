

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
        var mer_html = document.getElementById('Content_Mers');
        var pays_html = document.getElementById('Content_Pays');
        
        nomIle_html.innerHTML=information.Name;
        statut_html.innerHTML=information.Desc;
        area_html.innerHTML = information.Area;
        population_html.innerHTML = information.Population;
        coordonates_html.innerHTML=information.Coordonates.latitude + " " + information.Coordonates.longitude; 
        archipel_html.innerHTML = information.Archipelago.Name;

        // Initialize seaNames as an empty array
        const seaNames = [];

        // Extract names from each sea element and push them into the seaNames array
        information.Seas.forEach(seaElement => {
        seaNames.push(seaElement.Name);
        });

        // Join the seaNames array with commas to create a comma-separated list
        const commaSeparatedSeaNames = seaNames.join(', ');

        mer_html.innerHTML = commaSeparatedSeaNames;
        pays_html.innerHTML = information.Countries.Name;
        console.log(information.Archipelago.Name);
        

        
    }

   
    
}