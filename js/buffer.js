/*  Created by Gelieke Steeghs, copyright 2017.
    This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
    The interface shows different charts and graphs which are created with JavaScript library D3 v4.
    The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
    The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

    This is the JavaScript file called buffer.js, which is the code for the current buffer water level data graph.   */

function drawBuffer() {
    
    var buffersize = 190;

    var bufferchart = d3.select(".svg_buffer"),
        margin = {top: 40, right: 10, bottom: 30, left: 38},
        width = +bufferchart.attr("width") - margin.left - margin.right,
        height = +bufferchart.attr("height") - margin.top - margin.bottom,
        bufferg = bufferchart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var barWidthBuffer = width/3;    

    var x = d3.scaleBand().rangeRound([0, barWidthBuffer]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var width = 180;

    // display buffer png image
    var imgs = bufferchart.select("g").selectAll("image")
            .data([0])
            .enter()
            .append("bufferchart:image")
            .attr("xlink:href", "../images/buffer.png")
            .attr("x",-22)
            .attr("y", -34)
            .attr("width", 250)
            .attr("height", 265);

    var tooltip1 = d3.select("body").append("g").attr("class", "toolTipBuffer");

    var rainfall = 0;
    
    d3.json(datahandler_current, function(error, data) {
      if (error) throw error; 

      rainfall = data[data.length - 1]["waterlevel"]; // store in variable for displaying in tooltip

      y.domain([0, 1]);

      // draw y axis
      bufferg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(y).ticks(10).tickFormat(function(d) { return d * 100; }))
      .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Waterniveau (%)")

      bufferg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("id", "buffergBar")
          .attr("x", 8)
          .attr("y", function(d) { return y(rainfall/buffersize)})
          .attr("width", 190)
          .attr("height",  function(d) { return height - y(rainfall/buffersize)});
                tooltip1
                  .attr("class", "toolTipBuffer")
                  .style("display", "block")
                  .style("left", $('.bar').offset().left + 23 + "px")
                  .style("top", $('.bar').offset().top - 70 + "px")
                  .html(" Huidig volume: " + rainfall + " L <br> Gevuld voor: " + Math.round(100*(rainfall/buffersize)*100)/100 + "%"); 
    });
}