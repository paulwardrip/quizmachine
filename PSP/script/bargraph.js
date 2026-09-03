var bargraph = function (selector, data) {

    var margin = {
        top: 10,
        right: 50,
        bottom: 30,
        left: 150
    };

    var par = d3.select(selector);

    // clear any previous render so re-graphing doesn't stack SVGs
    par.selectAll("svg").remove();

    var node = par.node();
    var box = {
        width: node.clientWidth,
        height: node.clientHeight
    };

    var width = Math.max(box.width - margin.left - margin.right, 100),
        height = Math.max(box.height - margin.top - margin.bottom, 100);

    var y = d3.scaleBand()
        .range([0, height])
        .padding(0.15);
    var x = d3.scaleLinear()
        .range([0, width]);

    var svg = par.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    y.domain(data.map(function (d) { return d.name; }));
    x.domain([0, 100]);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function (d) { return y(d.name); })
        .attr("width", function (d) { return x(d.value); })
        .attr("fill", function (d) {
            var offset = 255 * (d.value / 100);
            return "rgb(" + (offset / 2) + "," + (offset / 2) + "," + offset + ")";
        })
        .attr("opacity", function (d) {
            return Math.max(d.value / 100, 0.2);
        });

    // value label at the end of each bar
    svg.selectAll(".label")
        .data(data)
        .enter().append("text")
        .attr("class", "label")
        .attr("y", function (d) { return y(d.name) + y.bandwidth() / 2 + 4; })
        .attr("x", function (d) { return x(d.value) + 6; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text(function (d) { return d.value; });

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
};
