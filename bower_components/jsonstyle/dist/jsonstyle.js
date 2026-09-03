
var JsonStyle = function () {

    var head;
    if (typeof  window !== 'undefined') {
        head = document.getElementsByTagName("head")[0];
        head.appendChild(document.createComment("Powered by: JsonStyle"))
    }

    function style(o) {

        var styles = css(o);

        if (typeof  window !== 'undefined') {
            var sheet = document.createElement("style");
            sheet.type = "text/css";
            sheet.appendChild(document.createTextNode(styles));
            sheet.setAttribute("generator", "jsonstyle-style");
            head.appendChild(sheet);

        } else {
            return styles;
        }
    }

    function css(__obj) {
        var csstr = "";

        function classdef(obj) {
            var childqueue;

            for (var idx in obj) {
                if (obj.hasOwnProperty(idx)) {
                    var val = obj[idx];

                    for (var pidx in val) {
                        if (val.hasOwnProperty(pidx) && typeof val[pidx] === 'object') {
                            if (!childqueue) childqueue = {};
                            childqueue[idx + (pidx.indexOf(":") === 0 ? "" : " ") + pidx] = val[pidx];
                            val[pidx] = undefined;
                        }
                    }

                    csstr += idx + " " + JSON.stringify(val, null, 2).replace(/"/g, '').replace(/,([^ ])/g, ';$1') + "\n";

                }
            }

            if (childqueue) classdef(childqueue);
        }

        classdef(__obj);

        return csstr;
    }

    function googlefont(name, weights, plusItalics) {
        var url = "https://fonts.googleapis.com/css?family=" + name;
        var append = ":";

        if (weights && weights instanceof Array) {
            for (var idx in weights) {
                url += append + weights[idx];
                append = ",";
                if (plusItalics === true) {
                    url += append + weights[idx] + "i";
                }
            }
        }

        if (typeof  window !== 'undefined') {
            var l = document.createElement("link");
            l.rel = "stylesheet";
            l.type = "text/css";
            l.href = url;

            l.setAttribute("generator", "jsonstyle-googlefont");

            head.appendChild(l);

        } else {
            return url;
        }
    }

    return {
        style: style,
        googlefont: googlefont
    }
}();

if (typeof module !== 'undefined') {
    module.exports = JsonStyle;
}