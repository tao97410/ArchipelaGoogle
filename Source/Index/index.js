function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function rechercher() {
    const newUrl = "../../Source/Results/results.html";
    document.location.href = newUrl + "?rechercher=" + removeAccents(document.getElementById("search-input").value.toLowerCase());
}