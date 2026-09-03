var QuizMachine = function (target, url) {

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    var allrequired = false;

    var fonts = {
        "default": "Lato",
        "question": "Slabo 27px"
    };


    JsonStyle.style({
        ".quiz": {
            "font-family": "'" + fonts.default + "', sans-serif",
            "padding-bottom": "70px",

            ".answerbox": {
                display: "inline-block",
                padding: "1px 0"
            },

            ".number": {
                display: "inline-block",
                width: "40px",
                "text-align": "right",
                "font-weight": 700
            },

            ".answer": {
                display: "inline-block",
                "text-align": "center",
                background: "black",
                margin: "1px 1px",
                padding: "3px 5px",
                cursor: "pointer",
                border: "1px solid black",
                "border-radius": "2px"
            },

            ".unanswered": {
                ".answer": {
                    "background": "white"
                },

                ".answer:hover": {
                    "font-weight": 700,
                    background: "lightskyblue"
                },
            },

            ".answered": {
                ".answer": {
                    "font-weight": 100,
                    color: "#C0C0C0",
                    background: "#e0e0e0"
                },

                ".answer.picked": {
                    "font-weight": 700,
                    background: "deepskyblue",
                    color: "white"
                },
            },

            ".questiontext": {
                "font-family": "'" + fonts.question + "', serif",
                "vertical-align": "middle",
                padding: "0 0 0 4px",
                display: "inline-block"
            }
        },

        ".qm-progress": {
            position: "fixed",
            bottom: "0",
            left: "0",
            right: "0",
            background: "#222",
            color: "white",
            padding: "10px 16px",
            "font-family": "'" + fonts.default + "', sans-serif",
            "z-index": "100",
            "box-shadow": "0 -2px 6px rgba(0,0,0,0.3)",

            ".qm-progresstext": {
                "font-weight": 700,
                "margin-right": "16px"
            },

            ".qm-finish": {
                padding: "6px 14px",
                cursor: "pointer",
                border: "1px solid deepskyblue",
                "border-radius": "2px",
                background: "deepskyblue",
                color: "white",
                "font-weight": 700
            },

            ".qm-finish:disabled": {
                cursor: "default",
                opacity: "0.4"
            },

            ".qm-tools": {
                float: "right",
                "line-height": "30px"
            },

            ".qm-load": {
                cursor: "pointer",
                "margin-right": "16px",
                "text-decoration": "underline"
            },

            ".qm-load input": {
                display: "none"
            },

            ".qm-reset": {
                color: "#ff8080",
                cursor: "pointer",
                "text-decoration": "underline"
            }
        },

        "#graphical": {
            "font-family": "'" + fonts.default + "', sans-serif",

            "#resultactions": {
                margin: "0 0 10px 0",

                "input": {
                    padding: "5px",
                    "margin-right": "6px"
                },

                "button": {
                    padding: "6px 14px",
                    cursor: "pointer",
                    "margin-right": "6px"
                }
            }
        }
    });

    JsonStyle.googlefont(fonts.default, [100,400,700]);

    JsonStyle.googlefont(fonts.question);

    var mobileCss = [
        "@media (max-width: 600px) {",
        "  .quiz > div { display: flex; flex-wrap: wrap; align-items: baseline; margin-bottom: 18px; }",
        "  .quiz .number { order: 1; width: auto; padding-right: 6px; }",
        "  .quiz .questiontext { order: 2; flex: 1; width: auto !important; padding: 0; }",
        "  .quiz .answerbox { order: 3; width: 100%; display: flex; margin-top: 8px; }",
        "  .quiz .answer { flex: 1; width: auto !important; padding: 10px 6px; margin: 0 3px; }",
        "  .quiz .answer:first-child { margin-left: 0; }",
        "  .quiz .answer:last-child { margin-right: 0; }",
        "  .qm-progress { display: flex; flex-wrap: wrap; align-items: center; padding: 8px 10px; }",
        "  .qm-progress .qm-progresstext { margin-right: 10px; }",
        "  .qm-progress .qm-finish { padding: 10px 16px; }",
        "  .qm-progress .qm-tools { float: none; margin-left: auto; line-height: normal; }",
        "  .qm-progress .qm-load { margin-right: 10px; }",
        "  #graphical { padding: 0 8px; }",
        "  #resultactions input { width: 100px; }",
        "  #resultactions button { padding: 10px 12px; margin-bottom: 6px; }",
        "  #results { overflow-y: auto; -webkit-overflow-scrolling: touch; }",
        "}"
    ].join("\n");

    var globalCss = [
        ".quiz .answer .emoji { margin-right: 4px; }",
        ".quiz .answered .answer .emoji { filter: grayscale(1); opacity: 0.5; }",
        ".quiz .answered .answer.picked .emoji { filter: none; opacity: 1; }"
    ].join("\n");

    $("<style>").text(mobileCss + "\n" + globalCss).appendTo("head");

    var storageKey = "quizmachine:answers:" + url;

    var answerEmoji = {
        "yes": "👍",
        "maybe": "🤷",
        "no": "👎"
    };

    var qhtml = '<div class="unanswered">' +
        '<div class="answerbox"></div>' +
        '<div class="number"></div>' +
        '<div class="questiontext"></div>' +
        '</div>';

    var $quiz = $('<div class="quiz">');

    var $progress = $('<div class="qm-progress">' +
        '<span class="qm-progresstext"></span>' +
        '<button class="qm-finish" disabled>See Results</button>' +
        '<span class="qm-tools">' +
        '<label class="qm-load">Load saved results<input type="file" accept=".json,application/json"></label>' +
        '<span class="qm-reset">Reset quiz</span>' +
        '</span>' +
        '</div>');

    var cats = {};
    var q2c = {};
    var qbtns = {};

    var cn = 0;
    var qa = 0;
    var qtotal = 0;

    var scoreData;

    function sizeAnswers() {
        if (window.innerWidth <= 600) {
            $(".quiz .answer").css({ width: "" });
            $(".quiz .questiontext").css({ width: "" });
            return;
        }

        var fra = $(".answer", $(".answerbox", $quiz)[0]);
        var maxw = $(fra[0]).width();

        for (var fai = 1; fai < fra.length; fai++){
            if ($(fra[fai]).width() > maxw) maxw = $(fra[fai]).width();
        }

        $(".quiz .answer").css({ width: Math.round(maxw) + "px" });

        setTimeout(function () {
            var qwi = ($(".quiz .unanswered").innerWidth() - $(".quiz .answerbox").outerWidth() -
                $(".quiz .number").outerWidth()) - 20 + "px";
            $(".quiz .questiontext").css({ width: qwi });
        },0);
    }

    function scoreCat(c) {
        var score = 0;
        var count = 0;

        for (var idx in cats[c].answers) {
            if (cats[c].answers[idx] !== undefined) {
                score += cats[c].answers[idx];
                count++;
            }
        }

        cats[c].finished = (count === cats[c].total);
        cats[c].score = score;
        cats[c].count = count;
        cats[c].value = Math.round(score / cats[c].max * 100);

        if (!allrequired || cats[c].finished) buildScoreData();
    }

    function buildScoreData() {
        var sd = [];
        for (var idx in cats) {
            if (allrequired && !cats[idx].finished) return;
            sd.push({
                name: cats[idx].name,
                value: cats[idx].value,
                score: cats[idx].score
            });
        }
        scoreData = sd;
    }

    function updateProgress() {
        $(".qm-progresstext", $progress).text(qa + " / " + qtotal + " answered");
        $(".qm-finish", $progress).prop("disabled", !(qtotal > 0 && qa === qtotal));
    }

    function persist() {
        try {
            var saved = {};
            for (var qid in qbtns) {
                for (var label in qbtns[qid]) {
                    if (qbtns[qid][label].$btn.hasClass("picked")) saved[qid] = label;
                }
            }
            localStorage.setItem(storageKey, JSON.stringify(saved));
        } catch (e) { /* private mode / storage full: quiz still works, just won't survive reload */ }
    }

    function pick(answerbutton, questionelem) {
        var data = $(answerbutton).data("value");
        $(".answer", questionelem).removeClass("picked");
        if (cats[data.catid].answers[data.qid] === undefined) qa++;
        cats[data.catid].answers[data.qid] = data.points;
        answerbutton.addClass("picked");
        questionelem.addClass("answered");
        scoreCat(data.catid);
    }

    function unpick(answerbutton, questionelem) {
        var data = $(answerbutton).data("value");
        cats[data.catid].answers[data.qid] = undefined;
        $(".answer", questionelem).removeClass("picked");
        questionelem.removeClass("answered");
        qa--;
        scoreCat(data.catid);
    }

    function makeClicker(answerbutton, questionelem) {
        return function () {
            if (answerbutton.hasClass("picked")) {
                unpick(answerbutton, questionelem);
            } else {
                pick(answerbutton, questionelem);
            }
            persist();
            updateProgress();
        }
    }

    function restore() {
        var saved;
        try {
            saved = JSON.parse(localStorage.getItem(storageKey));
        } catch (e) { return; }
        if (!saved) return;

        for (var qid in saved) {
            var entry = qbtns[qid] && qbtns[qid][saved[qid]];
            if (entry) pick(entry.$btn, entry.$q);
        }
        updateProgress();
    }

    function stamp() {
        var d = new Date();
        return d.getFullYear() +
            ("0" + (d.getMonth() + 1)).slice(-2) +
            ("0" + d.getDate()).slice(-2);
    }

    function saveResults() {
        if (!scoreData) return;
        var name = ($("#savename").val() || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "results";
        var blob = new Blob([JSON.stringify(scoreData, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name + "-" + stamp() + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            URL.revokeObjectURL(a.href);
            a.remove();
        }, 0);
    }

    window.graphslix = function (d) {
        if (typeof d !== 'undefined') {
            scoreData = d;
        }
        if (!scoreData) return;

        $("#quizbox").hide();
        $progress.hide();
        var $g = $("#graphical").show();

        var $w = $(window);
        var $el = $("#results");
        $el.empty();

        var used = ($("h3", $g).outerHeight(true) || 0) +
            ($("#resultactions").outerHeight(true) || 0);

        var mobile = window.innerWidth <= 600;

        $el.css({
            width: Math.round($w.width() * (mobile ? 0.96 : 0.92)) + "px",
            height: Math.max(Math.round($w.height() - used - 60), 300) + "px"
        });

        bargraph("#results", scoreData);
    };

    function backToQuiz() {
        $("#graphical").hide();
        $("#quizbox").show();
        $progress.show();
    }

    $(".qm-finish", $progress).click(function () {
        if (qa < qtotal) return;
        if (window.confirm("All " + qtotal + " questions answered. Ready to see your results?")) {
            window.graphslix();
        }
    });

    $(".qm-reset", $progress).click(function () {
        if (window.confirm("Clear all your answers and start over?")) {
            try { localStorage.removeItem(storageKey); } catch (e) {}
            window.location.reload();
        }
    });

    $(".qm-load input", $progress).change(function () {
        var file = this.files && this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                if (!Array.isArray(data) || !data.length || data[0].name === undefined || data[0].value === undefined) {
                    alert("That file doesn't look like saved quiz results.");
                    return;
                }
                window.graphslix(data);
            } catch (e) {
                alert("Couldn't read that file as JSON.");
            }
        };
        reader.readAsText(file);
        this.value = "";
    });

    $("#saveresults").click(saveResults);
    $("#backtoquiz").click(backToQuiz);

    var resizeTimer;
    $(window).on("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if ($("#graphical").is(":visible")) window.graphslix();
            else sizeAnswers();
        }, 150);
    });

    try {
        $.getJSON(url).done(function (data) {
            for (var cix in data.categories) {

                var tag = data.categories[cix].short || cn;
                for (var qix in data.categories[cix].q) {
                    q2c[data.categories[cix].q[qix]] = tag
                }
                cats[tag] = {
                    "name": data.categories[cix].name,
                    "total": data.categories[cix].q.length,
                    "score": 0,
                    "max": data.categories[cix].q.length * data.answers['@max'],
                    "answers": {},
                    "finished": false,
                    "count": 0
                };
                cn++;
            }

            for (var idx in data.questions) {
                var $q = $(qhtml);
                var sn = q2c[idx];
                var qd = data.questions[idx];
                $(".questiontext", $q).html(qd.text);
                $(".number", $q).html(idx + ".");

                var ad = (qd.a === undefined) ? data.answers[data.answers["@default"]] : data.answers[qd.a];

                qbtns[idx] = {};

                for (var qi in ad) {
                    var $ae = $('<div class="answer cat-' + sn + '"></div>');
                    var em = answerEmoji[String(qi).toLowerCase()];
                    if (em) $ae.append('<span class="emoji">' + em + '</span>');
                    $ae.append($('<span class="atext"></span>').text(qi));
                    $ae.data("value", {
                        points: ad[qi],
                        qid: idx,
                        catid: sn
                    });
                    qbtns[idx][qi] = { $btn: $ae, $q: $q };
                    $(".answerbox", $q).append($ae);
                    $ae.click(makeClicker($ae,$q));
                }

                $quiz.append($q);
                qtotal++;
            }

            target.append($quiz);
            $("body").append($progress);

            restore();
            updateProgress();

            setTimeout(sizeAnswers,0);

        }).fail(function (a, b, c) {
            console.log(a, b, c);
        });

    } catch (e) {
        console.log(e);
    }

};
