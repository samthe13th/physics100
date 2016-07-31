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
        mark_2d_obj: function (ans, soln, properties) {
            //Marks an object containing objects eg { key1: { keyA: paramA, keyB: paramB}, {...}, ... }
            percents = [];
            feedback.percent = {};
            feedback.worth = (1 / (Object.keys(soln).length * properties.length)) * 100;
            console.log("Each sub part worth: " + feedback.worth + "%");
            for (var p = 0; p < properties.length; p++) {
                feedback.percent[properties[p]] = 0;
            }
            for (var p = 0; p < properties.length; p++) {
                if ($.isEmptyObject(ans)) {
                    feedback.percent.total = 0;
                } else {
                    for (var k in soln) {
                        if (ans.hasOwnProperty(k)) {
                            if (ans[k][properties[p]] == soln[k][properties[p]]) {
                                console.log(ans[k][properties[p]] + " == " + soln[k][properties[p]]);
                                feedback.percent[properties[p]] += feedback.worth;
                                console.log(ans[k] + " => " + properties[p] + ": " + feedback.percent[properties[p]]);
                            } else {
                                console.log(ans[k][properties[p]] + " != " + soln[k][properties[p]]);
                            }
                        }
                    }
                }
            };
            var total = 0;
            for (var x = 0; x < properties.length; x++) {
                console.log("CALC TOTAL => " + properties[x] + ": " + feedback.percent[properties[x]]);
                total += feedback.percent[properties[x]];
            }
            feedback.percent.total = Math.round(total);
            console.log(feedback.percent.total + "%");
            return feedback;
        },
        mark_array_of_objs: function (ans, soln, properties) {
            //Marks an array of simple objects. eg [ { key1: param1, key2: param2 },{...}, ... ]
            percents = [];
            feedback.percent = {};
            for (var p = 0; p < properties.length; p++) {
                feedback.percent[properties[p]] = 100;
            }
            //iterate through answer array
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
    function sumPercents(p) {
        var total = 0;
        for (var n = 0; n < p.length; n++) {
            total += p[n];
        }
        return total;
    }
    return Marker;
} ();