function Menu(id, links) {
    this.init = function() {
        //alert("init " + str);
        //  $('#mainMenu').html('<div id="myDropdown" class="dropdown-content">'); 
        $('#dropdown' + id).html(links);
    }
}