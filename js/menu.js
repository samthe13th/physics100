function Menu(id) {
    this.init = function() {
        //alert("init " + str);
        //  $('#mainMenu').html('<div id="myDropdown" class="dropdown-content">'); 
        $('#dropdown' + id).html('<a href="#contact">Contact</a>');
    }
}