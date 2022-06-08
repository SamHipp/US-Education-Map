// URLs________________________________________________________________
const EDUCATION_DATA = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const COUNTY_DATA = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const colors = [
    'hsl(190, 0%, 30%)',
    'hsl(190, 25%, 35%)',
    'hsl(190, 50%, 40%)',
    'hsl(190, 75%, 45%)',
    'hsl(190, 100%, 50%)',
];


// Fetching the data_________________________________________________________
Promise.all([fetch(EDUCATION_DATA).then(response => response.json()), fetch(COUNTY_DATA).then(response => response.json())])
    .then((response) => { 

// Variables___________________________________________________________________
    const graphHeight = 650;
    const graphWidth = 1000;
    const eduData = response[0];
    const geoData = response[1];
    const data = eduData.map((x) => {
        return [x['area_name'], x['bachelorsOrHigher'], x['fips'], x['state']];
    });
    const colorFill = d3
        .scaleThreshold()
        .domain(d3.range(0, 75.1, 10))
        .range(["#000", ...colors]);
    const path = d3.geoPath();
    const legendBlockSize = 30;
    const tooltip = d3.select('#graph-container')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')
        .style('position', 'absolute');
    
    console.log(data);
    console.log(geoData);
    console.log(d3.schemeBlues);

// Adding graph SVG_________________________________________________________
    const svg = d3.select('#graph-container')
        .append('svg')
        .attr('height', graphHeight)
        .attr('width', graphWidth);

// Legend___________________________________________________________________
    // Legend Axis
    const xScale = d3.scaleLinear()
        .domain([0, 50])
        .range([0, legendBlockSize * 5]);
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)   
        .tickFormat(x => `${x}%`);
    svg.append('g')
        .call(xAxis)
        .attr('id', 'legend-axis')
        .attr('class', 'legend-axis')
        .attr("transform", `translate(${2 * graphWidth / 3}, ${legendBlockSize})`);
    // Adding colors
    svg.append('g')
        .selectAll('rect')
        .data(colors)
        .enter()
        .append('rect')
        .attr('height', legendBlockSize)
        .attr('width', legendBlockSize)
        .attr('x', (d, i) => {return 2 * graphWidth / 3 + legendBlockSize * i})
        .attr('y', 0)
        .attr('fill', d => d)
        .attr('stroke', 'black')

// Adding Map_______________________________________________________________
    svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(geoData, geoData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', function (d) {
      return d.id;
    })
    .attr('data-education', function (d) {
      let result = data.filter((obj) => {
        return obj[2] === d.id;
      });
      if (result[0]) {
        return result[0][1];
      }
      console.log('could find data for: ', d.id);
      return 0;
    })
    .attr('fill', function (d) {
      let result = data.filter((obj) => {
        return obj[2] === d.id;
      });
      if (result[0]) {
        return colorFill(result[0][1]);
      }
      return colorFill(0);
    })
    .attr('d', path)
    .on('mouseover', (item, d) => {
        let result = data.filter((obj) => {
            return obj[2] === d.id;
          });
          if (result[0]) {
        tooltip.html(
            `<p class="tooltip-text">${result[0][0]}, ${result[0][3]}:</p>
            <p class="tooltip-text">${result[0][1]}&#37;</p>`
        )
          } else {tooltip.html('<p class="tooltip-text">No data found</p>')}
        return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', (item, d) => {
        return tooltip.style("top", (item.pageY-25)+"px").style("left",(item.pageX+25)+"px");
    })
    .on('mouseout', (item, d) => {
        return tooltip.style('visibility', 'hidden');
    })





// _________________________________________________________________________
    })

