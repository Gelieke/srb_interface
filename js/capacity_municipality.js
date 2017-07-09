/*  Created by Gelieke Steeghs, copyright 2017.
    This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
    The interface shows different charts and graphs which are created with JavaScript library D3 v4.
    The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
    The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

    This is the JavaScript file called capacity_municipality.js, which is the code for the history buffer water level data graph.   */

function drawChart() {
    
    var svg = d3.select(".svg_capacity"),
        margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("g").attr("class", "toolTip").style("opacity", 0);
    var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S"); // parse the time for the time scale and axis    
    var formatTime = d3.timeFormat("%d %b %Y");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    
    var counter = 0;
    var translatex = 0;
    var data_agg = new Array();
    var temp = new Array();
    var buffersize = 190;
    var tickdays = 1;

    d3.json(datahandler, function(error, data) {
          if (error) throw error; 

          // format the data
          data.forEach(function(d, i) {
              // split the dates in day/month year and time on the other hand
              temp[i] = new Array();
              temp[i] = data[i]["day"].split(" ");
          });
                
        for (j = 0; j < data.length-1; j++) {
              if (temp[j][0] != temp[j+1][0]) { // If the next date is not the same as the previous date
                  // save this entry, because it's the last entry of the day - to a new array which uses aggregated data
                  data_agg[counter] = new Array();
                  data_agg[counter] = data[j];
                  counter++;
              }
        }
                
        var barWidth = (width-(data_agg.length-1)*4) / (data_agg.length-1);
        
          data_agg.forEach(function(d) {
              d.day = parseTime(d.day);
              
              if (d.waterlevel > 190) buffersize = 380; // two neighbourhoods are selected
           
              d.waterlevel = 100*(d.waterlevel/buffersize); // calculate percentage
              d.waterlevel = +Math.round(d.waterlevel * 100) / 100; // round to 2 decimals
              d.waterlevel = +d.waterlevel;
          });
        
      // loop through array for defining how many days between ticks
      for (var k = 0; k < data_agg.length; k++) {
          if (data_agg.length >= 8 && k % 10 == 0) {
              tickdays++;
              console.log(tickdays);
          }
      }

      x.domain(d3.extent(data_agg, function(d) { return d.day; }));
      y.domain([0, 100]);
         
      var barCapacity = svg.selectAll("g")
      .data(data_agg)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d, i) { 
          if (i == 1) translatex = margin.left+4 + ((i-1) * (2+barWidth+2));
          else translatex += ( (2+barWidth+2));
          return "translate(" + translatex + ",0)";
      })
      // tooltip
      .on("mousemove", function(d){
            tooltip
             .transition()
             .duration(200)
             .style("opacity", .9);
            tooltip
              .attr("class", "toolTip")
              .style("left", d3.event.pageX - 68 + "px")
              .style("top", d3.event.pageY - 75 + "px")
              .style("display", "inline-block")
              .html("Datum: " + (formatTime(d.day)) + "<br>" + "Gevuld voor: " + (d.waterlevel) + " %");
        })
      .on("mouseout", function(d){ tooltip.style("display", "none");});
        
      barCapacity.append("rect")
      .data(data_agg)
      .attr("class", "bar")
      .attr("y", function(d) {  return y(d.waterlevel) + margin.top; })
      .attr("width", barWidth)
      .attr("height", function(d) { return height - y(d.waterlevel); }) // otherwise the graph is upside down

      // Draw the x axis
      g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(d3.timeDay.every(tickdays)).tickFormat(d3.timeFormat("%d %b")))
            .selectAll("text")  
            .style("text-anchor", "begin")
            .attr("x", barWidth/2);

      // Draw the y axis
      g.append("g")
          .data(data_agg)
          .attr("class", "y axis")
          .call(d3.axisLeft(y))
        .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .style("z-index", 50)
          .text("Waterniveau (%)")
    });
}