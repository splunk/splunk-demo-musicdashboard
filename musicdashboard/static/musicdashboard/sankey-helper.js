(function() {
    window.MusicDashboard = window.MusicDashboard || {};

    MusicDashboard.SankeyHelper = (function() {
        var UA_DISPLAY_NAMES = {
            'ua-mobile-android': 'Android',
            'ua-mobile-ipad': 'iPad',
            'ua-mobile-blackberry': 'Blackberry',
            'ua-mobile-iphone': 'iPhone',
            'ua-mobile-ipod': 'iPod'
        };
        
        var formatName = function(name) {
            return UA_DISPLAY_NAMES[name] || name;
        };
        
        var margin = {top: 1, right: 1, bottom: 6, left: 1};
        // Unfortunately sankey.js depends on a global width variable
        window.width = 900 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;
        var color = d3.scale.category20();
        var link = null;

        var setupSankey = function() {
            
            var svg = d3.select("#chart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            
            
            var sankey = d3.sankey()
                .nodeWidth(15)
                .nodePadding(10)
                .size([width, height]);

            var path = sankey.link();

            return {
                svg: svg,
                sankey: sankey,
                path: path
            };

        };

        var renderSankey = function(nodes, links, svg, sankey, path) {
            sankey
                .nodes(nodes)
                .links(links)
                .layout(1); 

            link = svg.append("g").selectAll(".link")
                  .data(links)
                .enter().append("path")
                  .attr("class", "link")
                  .attr("d", path)
                  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                  .sort(function(a, b) { return b.dy - a.dy; });

            link.append("title")
                  .text(function(d) { return d.source.name + " -> " + formatName(d.target.name) + "\n" + d.value; });

            var node = svg.append("g").selectAll(".node")
                  .data(nodes)
                .enter().append("g")
                  .attr("class", "node")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                                
            node.append("rect")
                  .attr("height", function(d) { return d.dy; })
                  .attr("width", sankey.nodeWidth())
                  .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
                  .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
                .append("title")
                  .text(function(d) { return formatName(d.name) + "\n" + d.value; });


            node.append("text")
                  .attr("x", -6)
                  .attr("y", function(d) { return d.dy / 2; })
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end")
                  .attr("transform", null)
                  .text(function(d) { return formatName(d.name); })
                .filter(function(d) { return d.x < width / 2; })
                  .attr("x", 6 + sankey.nodeWidth())
                  .attr("text-anchor", "start");
 
        };

        var getLink = function() {
            return link;
        };

        return {
            setupSankey: setupSankey,
            renderSankey: renderSankey,
            getLink: getLink
        }
    }());


}())
