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
    barChartInit();


}

function temperatureChange() {
    // set the dimensions and margins of the graph

    var svg = d3.select(".multiLine svg"),
        margin = { top: 20, right: 20, bottom: 100, left: 50 },
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

            // Set domain of x and y
            x.domain(d3.extent(new Array(12), function (d, i) { return i; }));
            y.domain(d3.extent([-7, 25], function (d) { return d; }));

            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            // Append the x-axis
            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat((i) => monthNames[i])) // lambda function
                .selectAll("text")
                .attr("y", 0)
                .attr("x", 10)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");

            // Append the y-axis
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

            // Create color scale scheme
            var color = d3.scaleLinear().domain([1, data.length])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#0026ff"), d3.rgb('#ffff00')]);

            // Plot each line by using callback filtered data. Each callback represents one line.
            createLines(data, function (newData, i) {
                g.append("path")
                    .datum(newData)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke", color(i));
            });

            // Function for looping through object in the data and emit
            // each year as an array of objects with month and temperature.
            function createLines(data, callback) {
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

                    callback(newData, i);
                    i += 1;
                });
            }
        });
}

// Barchart

function barChartInit() {
    var svg = d3.select(".barChart svg"),
        margin = { top: 20, right: 20, bottom: 40, left: 50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data.tsv", function (d) {
        d.metANN = +d.metANN;
        return d;
    }, function (error, data) {
        if (error) throw error;

        x.domain(data.map(function (d) {
            return d.YEAR;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.metANN;
        })]);


        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 5)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "r"))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text("Degree");

        // Create color scale scheme
        var color = d3.scaleLinear().domain([1, data.length])
            .interpolate(d3.interpolateHcl)
            .range([d3.rgb("#0026ff"), d3.rgb('#ffff00')]);

        console.log(getMinMaxAndMean(data));
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .style("fill", (d, i) => {
                return d.metANN > getMinMaxAndMean(data)[2] ? color(120) : color(0);

            })
            .attr("x", (d) => x(d.YEAR))
            .attr("y", (d) => y(d.metANN))

            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(d.metANN);
            });
    });
}

// get minimum and maximum of array
function getMinMaxAndMean(data) {
    var arr = [];
    data.forEach(year => {
        arr.push(year.metANN);
    });
    return [Math.min(...arr), Math.max(...arr), arr.reduce(add, 0) / arr.length];
}

function add(a, b) {
    return a + b;
}

