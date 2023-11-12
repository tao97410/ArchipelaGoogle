

var xhttp= new XMLHttpRequest();
xhttp.onreadystatechange=SetPage;

xhttp.open('GET','../../exemple.json');

xhttp.send();



function SetPage(island) {
    if(this.readyState==4 && this.status==200){
        var tbody=document.getElementsByTagName("tbody");
        var information=JSON.parse(this.response);
        console.log(information);
        var nomIle=document.getElementById('nomIle');
        var statut=document.getElementById('Statut');
        nomIle.innerHTML=information.entities.Q17070.labels.fr.value;
        statut.innerHTML=information.entities.Q17070.descriptions.fr.value;
    }

   
    
}