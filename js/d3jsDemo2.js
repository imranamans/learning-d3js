function makeDemo() {
    const width = 1152;
    const height = 300;

    let dataX = [{
        "value": 132,
        "dateMeasured": "2021-08-11T17:33:04.000Z",
        "patientId": 324
    }, {
        "value": 118,
        "dateMeasured": "2021-08-11T18:28:53.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-08-12T17:38:29.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-08-12T18:10:17.000Z",
        "patientId": 324
    }, {
        "value": 123,
        "dateMeasured": "2021-08-12T19:06:33.000Z",
        "patientId": 324
    }, {
        "value": 113,
        "dateMeasured": "2021-08-12T21:43:12.000Z",
        "patientId": 324
    }, {
        "value": 122,
        "dateMeasured": "2021-08-16T15:29:34.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-08-16T15:36:29.000Z",
        "patientId": 324
    }, {
        "value": 172,
        "dateMeasured": "2021-08-16T21:54:24.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-08-17T20:15:06.000Z",
        "patientId": 324
    }, {
        "value": 100,
        "dateMeasured": "2021-08-17T20:32:59.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-09-15T18:54:43.000Z",
        "patientId": 324
    }, {
        "value": 111,
        "dateMeasured": "2021-09-17T16:59:48.000Z",
        "patientId": 324
    }];

    dataX = dataX.map((d) => {
        return {
            value: d.value,
            dateMeasured: new Date(d.dateMeasured),
            patientId: d.patientId
        };
    });

    let data = {
        datasets: [
            {
                data: [],
                parsing: {
                    xAxisKey: 'dateMeasured',
                    yAxisKey: 'value'
                },
            }
        ]
    }

    let options = {
        parsing: {
            xAxisKey: 'dateMeasured',
            yAxisKey: 'value'
        },
        scales: {
            y: {
                type: 'linear'
            },
            x: {
                type: 'time',
                grid: {
                    display: true
                },
                ticks: {
                    callback: function(d, index) {

                    }
                }
            },
            y1: {

            }
        },
    }

    init(width, height, dataX);
}

function init(width, height, data, options = {}) {

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const pxX = width - margin.left - margin.right;
    const pxY = height - margin.top - margin.bottom;

    // console.log('pxX:', pxX, 'pxY:', pxY);

    const svg = d3.select('#chartContainer')
        .append('svg')
        .style('background', 'var(--background-color)')
        // .style('max-width', `${width}px`)
        .style('font', '10px sans-serif')
        .style('overflow', 'visible')
        // .attr('height', height)
        // .attr('width', width)
        // .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width} ${height}`)
        // .classed('svg-content', true)
        ;

    const domainX = d3.extent(data, function (d) {
        return d['dateMeasured'];
    });

    const scX = d3.scaleTime()
        .domain(domainX)
        .range([margin.left, width - margin.right])
        .nice();

    const scY = d3.scaleLinear()
        .domain(d3.extent(data, d => d['value']))
        .range([height - margin.bottom, margin.top])
        .nice();

    const thresholdLow = 80;
    const thresholdHigh = 140;

    const lineMaker = d3.line()
        .x(d => scX(d['dateMeasured']))
        .y(d => scY(d['value']));

    svg.append('g')
        .attr('id', 'line')
        .append('path')
        .attr('fill', 'none')
        .attr('d', lineMaker(data));

    svg.append('g')
        .attr('id', 'chartGroup')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('stroke', 'var(--brand-blue)').attr('stroke-width', '1')
        .attr('fill', function (d, i) {
            return (d.value < thresholdLow || d.value > thresholdHigh) ? '#fff' : 'var(--brand-blue)';
        })
        .attr('cx', d => scX(d['dateMeasured']))
        .attr('cy', d => scY(d['value']));

    svg.select('#chartGroup')
        .selectAll('circle')
        .on('mouseover', function (event, d) {
            console.log(d.value);
        });

    const format = d3.utcFormat("%H:%M %p");

    // X Axis
    const xAxis = d3.axisBottom(scX)
        .tickSize(6)
        .tickSizeInner(3)
        .tickPadding(10)
        // .ticks(d3.timeHour.every(72), "%I %p")
        // .tickFormat(format)
        // .ticks(d3.timeMinute.every(360))
        // .ticks(10)
        ;

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis)
        .append('text')
        .attr('fill', 'black')
    // .attr('transform', 'translate(0, 260)');

    // Y Axis
    const yAxis = d3.axisLeft(scY)
        .tickSize(0)
        .tickPadding(10)
        ;

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

    //PREPARE GRIDS
    //MAIN
    var ygridlines = d3.axisTop()
        .tickFormat("")
        .tickSize(-(height - margin.bottom))
        .ticks(10)
        .scale(scX);

    var xgridlines = d3.axisLeft()
        .tickFormat("")
        .tickSize(-(width - margin.left - margin.right))
        .ticks(10)
        .scale(scY);

    //MINOR
    var ygridlinesmin = d3.axisTop()
        .tickFormat("")
        .tickSize(-(height - margin.bottom - margin.top))
        .ticks(100)
        .scale(scX);

    var xgridlinesmin = d3.axisLeft()
        .tickFormat("")
        .tickSize(-(width - margin.left - margin.right))
        .ticks(100)
        .scale(scY);
    //DRAW GRIDS
    //MINOR GRID
    // svg.append("g")
    // .attr('transform', `translate(0, ${height - margin.bottom})`)
    //     .attr("class", "minor-grid")
    //     .call(ygridlinesmin);

    // svg.append("g")
    // .attr('transform', `translate(${margin.left}, 0)`)
    //     .attr("class", "minor-grid")
    //     .call(xgridlinesmin);

    //MAIN GRID
    svg.append("g")
        .attr("class", "main-grid")
        .call(ygridlines);

    svg.append("g")
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr("class", "main-grid")
        .call(xgridlines);
}