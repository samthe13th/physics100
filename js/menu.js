function Menu(id, mitems) {
    this.init = function() {
        for (var i = 0; i < mitems.length; i++) {
            $('#dropdown' + id).append("<a href='#contact'>" + mitems[i] + "</a>");
        }
    }
}