/** On page load */
d3.select(window).on('load', init);


function select() {
    return d3.select('div.box')
        .selectAll('div.box-element')
        .style('background-color', 'tomato')
        .text('Hello');
}


function init() {

    var hhdata = [
        { 'name': 'Arthur Dent', 'age': 42 },
        { 'name': 'Ford Pence', 'age': 22 },
        { 'name': 'Zaphod Beetlebox', 'age': 100 }
    ]

    d3.selectAll('div.box')
        .append('box-child')
        .selectAll('div')
        .data(hhdata)
        .enter()
        .append('div')
        .text(function (d, i) {
            return d.name;
        })
        .style('background-color', function (d) {
            if (d.age > 50) return 'tomato';
            if (d.age <= 50) return 'green';
        });
    //select();
    temperatureChange();


}

function temperatureChange() {
    // set the dimensions and margins of the graph

    var svg = d3.select("svg"),
        margin = { top: 20, right: 100, bottom: 30, left: 50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var line = d3.line()
        .x(function (d) { return x(d.month); })
        .y(function (d) { return y(d.temp); });

    /** Get data */
    d3.tsv("data.tsv", function (d) {
        return d;
    },
        function (error, data) {
            data.pop();
            data.pop();
            data.pop();
            if (error) throw error;

            x.domain(d3.extent(new Array(12), function (d, i) { return i; }));
            y.domain(d3.extent([-10, 20], function (d) { return d; }));
            console.log(d3.extent(new Array(12), function (d, i) { return i; }));

            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            g.append("g")
                .selectAll('text')
                .data(monthNames)
                .enter()
                .append("text")
                .attr("x", function(d, i) {
                    return x(i);
                })
                .attr("y", y(-10))
                .text(function (d, i) {
                    console.log(d);
                    return d
                });


            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text("Temperature");

            var i = 0;
            data.forEach(function (year) {
                var newData = [];

                months = Object.keys(year).splice(1, 12);
                months.forEach(function (month, i) {
                    newData.push({
                        "month": i,
                        "temp": parseFloat(year[month])
                    });
                });

                console.log(data.length);
                var colorScale = d3.scaleLinear()
                    .domain([0, data.length])
                    .range(['#ff0', "#eeff00"]);

                color = d3.scaleLinear().domain([1, data.length])
                    .interpolate(d3.interpolateHcl)
                    .range([d3.rgb("#0026ff"), d3.rgb('#ffff00')]);

                g.append("path")
                    .datum(newData)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke", color(i));
                i += 1;
            });

        });
}

