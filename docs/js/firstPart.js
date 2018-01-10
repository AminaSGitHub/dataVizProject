var width = 700,//700,
            height = 580;

       var svg1 = d3.select("body").selectAll("div.svg1")
          .append( "svg" )
          .attr( "width", width )
          .attr( "height", height );
        var carte;
        
        // French map 
        var projection = d3.geoConicConformal().center([2.454071, 46.279229]).scale(2500);
       
        
        // On definie une echelle de couleur
        var color = d3.scaleQuantize()  
              .range(["rgb(213,239,204)", 
                      "rgb(169,221,160)", 
                      "rgb(94,186,97)", 
                      "rgb(42,141,71)", 
                      "rgb(0,91,36)"]);
        var nbrColors = 5;
        var minG = 0 , maxG = 0; // Used for legend
         /*Area containing the name and the value of each region*/
        var tooltipp = d3.select('body')
                        .append('div')
                        .attr('class', 'hidden tooltipp');
               
        var path = d3.geoPath() // d3.geo.path avec d3 version 3
                     .projection(projection);

            
        // On rajoute un groupe englobant toute la visualisation pour plus tard
        var g = svg1.append( "g" );     
        
       d3.csv("TER_France2013_2017.csv", function(data) {
         
             var jsonF;
             var listDates = Object.keys(data[0]);
             var listYears  = []; // Will contain [2013,2014,2015,2016]
             var listMonths  = []; // Will contain [Janvier,...,Decembre]
             var currentYear = 1;  //"2013";
             var currentMonth = 1; //"Janvier";
            //console.log("Liste des dates :" + String(listDates[5]));
            // console.log("DATA " + Object.values(data[0])[0]);
            // console.log("data[1]" +Object.values(data[listDates[1]]));
              /*Begin legend*/
              var element;
              minG = parseFloat(Object.values(data[0])[1]);
              maxG = parseFloat(Object.values(data[0])[1]);
               for (var i = 0; i < data.length; i++) {
                 for(var j = 1; j < listDates.length-4; j++){
                   //console.log("ELEMENT : ===> data : "+Object.values(data[i])[j]);
                  element = parseFloat(Object.values(data[i])[j]);
                  if (element < minG ){
                    minG = element;
                  } 
                  if (element > maxG ){
                    maxG = element;
                  }
                 }
               }
         // console.log("MAX =  : "+maxG + " MIN =  : "+ minG);
               pas = (maxG - minG)/nbrColors;
               //console.log("Pas "+ pas);
         drawLegende(minG, maxG,pas);
              /*End legend*/
         
             for(var m = 1; m< listDates.length; m++){
               var datee = listDates[m].split(" ");
                //console.log("Date ====> "+ datee[1]);//listMonths
               // console.log("Date ====> "+ listMonths)
                if (listYears.findIndex(p => p == datee[1]) === (-1)) {
                    listYears.push(datee[1]);
                }
                if (listMonths.findIndex(p => p == datee[0]) === (-1)) {
                  if(datee[0] != "Somme2013" && datee[0] != "Somme2014" && datee[0] != "Somme2015" && datee[0] != "Somme2016" && datee[0] != "Somme2017"){
                    listMonths.push(datee[0]);
                  }
                }
               
             }
            //console.log("YEa?????????rs : ==>" + listYears[0]);
            //console.log("YEa?????????rs : ==>" + listMonths[1]);
           
            
            d3.json("regions.json", function(json) {
              // first value for slider
                var first = listDates[1].split(" ");
              // first value for sliderYear
                var firstYear = listYears[0];
                var firstMonth = listMonths[0];
                //d3.select('#month').html(first[0]);
                d3.select('#month').html(firstMonth);
                d3.select('#year').html(firstYear);
                // update the month in slider
                d3.select("#slider").on("input", function() {
                  //currentMonth = listMonths[this.value-1];
                  currentMonth = +this.value; 
                  //console.log("currentMonth" + currentMonth);
                  updateViz(+this.value);
                });
              
                d3.select("#sliderYear").on("input", function() { 
                 //currentYear = listYears[this.value-1];
                  currentYear = +this.value;
                 // console.log("currentYear" + currentYear);
                  updateViz2(+this.value);
                });
              
            //On fusionne les donnees avec le GeoJSON des regions
            for (var i = 0; i < data.length; i++) {
              // Find the name of the region in csv file
              var dataState = data[i].region;
              for (var j = 0; j< json.features.length; j++){
                // Find the name of the region in json file
                var jsonState = json.features[j].properties.nom;//
                if (dataState == jsonState) {
                  json.features[j].properties.tab =  Object.values(data[i]);
                  //stop because result found
                   break;
                }
              }
            }
             
     
            svg1.selectAll("path")
              .data(json.features)
              .enter()
              .append("path")
              .attr("d", path);
            
            jsonF = json; 
            drawMap(currentMonth, currentYear);  
            }); // End of "regions.json"
          
          //update elements 
          function updateViz(val){
            d3.select('#month').html(listMonths[val-1]);
            drawMap(currentMonth, currentYear); 
          };
          
          function updateViz2(valY){
            d3.select('#year').html(listYears[valY-1]);
            drawMap(currentMonth, currentYear); 
          };
               
          // Draw the map
          function drawMap(monthBis, yearBis){
            var nbr;
            var currentDate = 12*(yearBis-1)+monthBis ;
            
            //Set input domain for color scale
              color.domain([ minG,maxG]);
                  
            carte = svg1.selectAll("path")
               .data(jsonF.features);
            carte
              .on('mousemove', function(d) {
                  if(d.properties.tab == undefined || d.properties.tab == "NaN"){
                      nbr = "undefined";
                  }else { 
                      nbr = d.properties.tab[currentDate]; 
                    }
                  var mouse = d3.mouse(svg1.node()).map(function(d) {
                     return parseInt(d);
                  });
              
                  tooltipp.classed('hidden', false)
                         .attr('style', 'left:' + (mouse[0] + 15) +
                                 'px; top:' + (mouse[1] - 35) + 'px')
                         .html(d.properties.nom + ":" + parseFloat(nbr).toFixed(2)+ " %");
                          
                  })
              .on('mouseout', function() {
                  tooltipp.classed('hidden', true);
                  });
            
            //code in case of update of the map / change of month 
            carte 
             .attr('class', function(d) {
                    return 'province ' + d.properties.code;
                 })
             .attr('d', path)
             .style("fill", function(d) {
                    // get value found above
                    var tab = d.properties.tab;
                    if (tab && tab[currentDate] != "") {
                        return color(tab[currentDate]);
                    } else { 
                        // if no value then color with Grey
                        return "#ccc";
                    }
                    
                    
                });
            
            //fist time of coloring the map
            carte.selectAll("path")
                .enter()
                .data(jsonF.features)
                .append("path")
                .attr("class", "enter")
                .attr("d", path)
                .style("fill", function(d) {
                      // get value found above
                      var tab = d.properties.tab;
                      if (tab && tab[currentDate] != "") {  
                          return color(tab[currentDate]);
                      } else { 
                          // if no value then color with Grey 
                          return "#ccc";
                      }
                  });
            
          


          }; // End of drawMap//
         
          /*Function to add legende */
          function drawLegende(min, max,pas){
              var c = color;
              var limites = [];
              c.domain([min,max]);
              //console.log("limites Avant : "+ limites);
              var bool;
              for(var it=min; it<max; it = it+pas){
                limites.push(it);
              }
              //console.log("limites Apres : "+ limites);//
              var legend = svg1.selectAll(".legend")
                              .data(limites)
                              .enter()
                              .append("g")
                              .attr("class", "legend")
                              .attr("transform", function(d, i) {
                                  return "translate(0," + i * 20 + ")"; 
                              });

              legend.append("rect")
                    .attr("x", 200)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d) { return color(d); });

              legend.append("text")
                    .attr("x", 194)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) { var dPas = d+ pas; return parseFloat(d).toFixed(2) + " %-" + parseFloat(dPas).toFixed(2)+ " %" ; }); 
          } 

       });