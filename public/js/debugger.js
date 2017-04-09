Debugger = function () {
    $("body").append("<div id='DebugModal'><div id='DebugHeader'>Debug Console</div><div id='DebugBody'></div><div>")
    db = {};
    db.variables = [];
    db.track = function (ref) {
        console.log("this: " + JSON.stringify(ref));
        db.variables.push(ref)
        $("#DebugBody").append("<div id='name_" + ref + "'><strong>" + ref + ": </strong><span class='DebugVal' id='value" + (db.variables.length - 1) + "'></span></div>")
    };
    setInterval(function () {
        for (var i = 0, ii = db.variables.length; i < ii; i++) {
            var displayvar;
            try {
                displayvar = eval(db.variables[i]);
            }
            catch (e) {
                displayvar = "undefined"
            }
            if (typeof (displayvar) === "object") {
                try {
                    displayvar = JSON.stringify(displayvar);
                }
                catch (e){
                    displayvar = ">>cannot stringify this object"
                }
            }
            $("#value" + i).text(displayvar);
        }
    }, 100);
    return db;
};