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
            feedback.properties = [];
            feedback.keys = [];
            feedback.worth = (1 / (Object.keys(soln).length * properties.length)) * 100;
            for (var p = 0; p < properties.length; p++) {
                feedback.percent[properties[p]] = 0;
            }
            for (var k in soln) {
                feedback.keys.push(k);
            }
            for (var p = 0; p < properties.length; p++) {
                feedback.properties.push(properties[p]);
                if ($.isEmptyObject(ans)) {
                    feedback.percent.total = 0;
                }
                for (var k in soln) {
                    if (ans.hasOwnProperty(k)) {
                        if (ans[k][properties[p]] == soln[k][properties[p]]) {
                            feedback.percent[properties[p]] += feedback.worth;
                        } 
                    }
                }
                for (var a in ans) {
                    if (soln.hasOwnProperty(a)) {
                    } else {
                        feedback.percent[properties[p]] -= feedback.worth;
                    }
                }
            };
            var total = 0;
            for (var x = 0; x < properties.length; x++) {
                total += feedback.percent[properties[x]];
            }
            feedback.percent.total = Math.round(total);
            return feedback;
        },
        mark_simple_obj: function (ans, soln) {
            //Marks simple object. eg { key1: param1, key2: param2 }
            var solnValues = {};
            var ansValues = {};
            feedback.percent.keys = 0;
            feedback.percent.values = 0;
            feedback.percent.kv = 0;
            feedback.worth = (1 / (Object.keys(soln).length) * 100);
            if ($.isEmptyObject(ans)) {
                feedback.percent.total = 0;
            } else {
                for (var s in soln) {
                    solnValues[soln[s]] = s;
                    if (ans.hasOwnProperty(s)) {
                        feedback.percent.keys += feedback.worth;
                    } 
                }
                if (feedback.percent.keys <= 0) {
                    feedback.percent.keys = 0;
                } else if (feedback.percent.keys >= 100) {
                    feedback.percent.keys = 100;
                }
                for (var a in ans) {
                    ansValues[ans[a]] = a;
                    if (soln.hasOwnProperty(a)) {
                        if (soln[a] === ans[a]) {
                            feedback.percent.kv += feedback.worth;
                        }
                    }
                }
                for (var s in solnValues){
                    if (ansValues.hasOwnProperty(s)){
                        feedback.percent.values += feedback.worth;
                    }
                }
                feedback.percent.total = Math.round((feedback.percent.values + feedback.percent.kv)/2);
            }
            return feedback;
        },
        mark_array_of_objs: function (ans, soln, properties) {
            //Marks an array of simple objects. eg [ { key1: param1, key2: param2 },{...}, ... ]
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
    function sumPercents(p) {
        var total = 0;
        for (var n = 0; n < p.length; n++) {
            total += p[n];
        }
        return total;
    }
    return Marker;
} ();