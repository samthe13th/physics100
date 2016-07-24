var Marker = function () {
    var allCorrect;
    var percents = [];
    var feedback = {
        "percent": {},
        "verbal": {
            "perfect": "Perfect! Great work.",
            "good": "Nice job! Almost perfect.",
            "poor": "Not quite! Try again"
        }
    };
    var Marker = {
        mark_array_of_objs: function (ans, soln, properties) {
            //Takes an array of objects. For each object, checks if value of each parameter is correct. 
            percents = [];
            feedback.percent = {};
            for (var p = 0; p < properties.length; p++) {
                feedback.percent[properties[p]] = 100;
            }
            for (var i = 0; i < ans.length; i++) {
                for (var j = 0; j < properties.length; j++) {
                    if (ans[i][properties[j]] != soln[i][properties[j]]) {
                        var jWorth = ans.length;
                        allCorrect = false;
                        feedback.percent[properties[j]] -= jWorth;
                    };
                    if (j == (properties.length - 1)) {
                        percents.push(feedback.percent[properties[j]]);
                    }
                }
            };
            feedback.percent.total = avgPercent(percents);
            return feedback;
        },
    }
    function avgPercent(percent_array) {
        var total = 0;
        for (var n = 0; n < percent_array.length; n++) {
            total += percent_array[n];
        }
        return (total / percent_array.length);
    }
    return Marker;
} ();