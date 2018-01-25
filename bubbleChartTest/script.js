// CHART: D3 bubble chart based on top artists (long term) (hard coded)
// function bubbleChart() {
//
//     d3.json('data.json', function(error, data) {
//         if (error) {
//             console.error('Error getting or parsing the data.');
//             throw error;
//         }
//         var chart = bubbleChart().width(800).height(400);
//         d3.select('#bubbleChart').data(data).call(chart);
//     });
//
//     var width = '100vw',
//         height = 960,
//         maxRadius = 6,
//         columnForColors = "name",
//         columnForRadius = "popularity";
//
//     function chart(selection) {
//         var data = selection.enter().data();
//         var div = selection,
//             svg = div.selectAll('svg');
//         svg.attr('width', width).attr('height', height);
//
//         var tooltip = selection.append("div").style("position", "absolute").style("visibility", "hidden").style("text-decoration", "none").style("padding", "12px").style("background-color", "rgb(230, 230, 230)").style("border-radius", "4px").style("text-align", "left").style("font-family", "helvetica").style("width", "200px").style("line-height", "150%").text("");
//
//         var simulation = d3.forceSimulation(data).force("charge", d3.forceManyBody().strength([-90])).force("x", d3.forceX()).force("y", d3.forceY()).on("tick", ticked);
//
//         function ticked(e) {
//             node.attr("cx", function(d) {
//                 return d.x * 4;
//             }).attr("cy", function(d) {
//                 return d.y * 4;
//             });
//         }
//
//         // var colorCircles = ["#d53e4f", "#fc8d59", "#3288bd", "#e6f598", "#99d594"];
//         var scaleRadius = d3.scaleLinear().domain([
//             d3.min(data, function(d) {
//                 return + d[columnForRadius];
//             }),
//             d3.max(data, function(d) {
//                 return + d[columnForRadius];
//             })
//         ]).range([10, 30]);
//
//         var node = svg.selectAll("circle").data(data).enter().append("circle").attr('r', function(d) {
//             return scaleRadius(d[columnForRadius]);
//         }).style("fill", function() {
//             return '#d53e4f';
//         }).attr('transform', 'translate(' + [
//             width / 2,
//             height / 2
//         ] + ')').on("mouseover", function(d) {
//             tooltip.html(d[columnForColors] + "<br>" + "Followers: " + d.followers.total + "<br>" + "Popularity: " + d[columnForRadius]);
//             return tooltip.style("visibility", "visible");
//         }).on("mousemove", function() {
//             return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
//         }).on("mouseout", function() {
//             return tooltip.style("visibility", "hidden");
//         });
//     }
//
//     chart.width = function(value) {
//         if (!arguments.length) {
//             return width;
//         }
//         width = value;
//         return chart;
//     };
//
//     chart.height = function(value) {
//         if (!arguments.length) {
//             return height;
//         }
//         height = value;
//         return chart;
//     };
//
//     chart.columnForColors = function(value) {
//         if (!arguments.columnForColors) {
//             return columnForColors;
//         }
//         columnForColors = value;
//         return chart;
//     };
//
//     chart.columnForRadius = function(value) {
//         if (!arguments.columnForRadius) {
//             return columnForRadius;
//         }
//         columnForRadius = value;
//         return chart;
//     };
//     return chart;
// }





// new bubble chart test with dyanmic data: ==========
function bubbleChart(myJSON) {

    var data = myJSON;

    // where do these go //
    var chart = bubbleChart(myJSON).width(800).height(400);
    d3.select('#bubbleChart').data(myJSON).call(chart);
    // where do these go //

    var width = '100vw',
        height = 960,
        maxRadius = 6,
        columnForColors = "name",
        columnForRadius = "popularity";

    function chart(selection) {
        var data = selection.enter().data();
        var div = selection,
            svg = div.selectAll('svg');
        svg.attr('width', width).attr('height', height);

        var tooltip = selection.append("div").style("position", "absolute").style("visibility", "hidden").style("text-decoration", "none").style("padding", "12px").style("background-color", "rgb(230, 230, 230)").style("border-radius", "4px").style("text-align", "left").style("font-family", "helvetica").style("width", "200px").style("line-height", "150%").text("");

        var simulation = d3.forceSimulation(data).force("charge", d3.forceManyBody().strength([-90])).force("x", d3.forceX()).force("y", d3.forceY()).on("tick", ticked);

        function ticked(e) {
            node.attr("cx", function(d) {
                return d.x * 4;
            }).attr("cy", function(d) {
                return d.y * 4;
            });
        }

        var scaleRadius = d3.scaleLinear().domain([
            d3.min(data, function(d) {
                return + d[columnForRadius];
            }),
            d3.max(data, function(d) {
                return + d[columnForRadius];
            })
        ]).range([10, 30]);

        var node = svg.selectAll("circle").data(data).enter().append("circle").attr('r', function(d) {
            return scaleRadius(d[columnForRadius]);
        }).style("fill", function() {
            return '#d53e4f';
        }).attr('transform', 'translate(' + [
            width / 2,
            height / 2
        ] + ')').on("mouseover", function(d) {
            tooltip.html(d[columnForColors] + "<br>" + "Followers: " + d.followers.total + "<br>" + "Popularity: " + d[columnForRadius]);
            return tooltip.style("visibility", "visible");
        }).on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        }).on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });
    }

    chart.width = function(value) {
        if (!arguments.length) {
            return width;
        }
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) {
            return height;
        }
        height = value;
        return chart;
    };

    chart.columnForColors = function(value) {
        if (!arguments.columnForColors) {
            return columnForColors;
        }
        columnForColors = value;
        return chart;
    };

    chart.columnForRadius = function(value) {
        if (!arguments.columnForRadius) {
            return columnForRadius;
        }
        columnForRadius = value;
        return chart;
    };

    return chart;
}
