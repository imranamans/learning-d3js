
function makeDemo() {

    let data = {
        response: [
            {
                "patient_id" : 80513,
                "value" : 187,
                "date_measured" : "2021-03-21 13:53:12.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 247,
                "date_measured" : "2021-03-21 21:50:53.0",
                "fasting" : "nonfasting"
            },
            {
                "patient_id" : 80513,
                "value" : 113,
                "date_measured" : "2021-03-22 14:30:02.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 150,
                "date_measured" : "2021-03-23 13:38:11.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 155,
                "date_measured" : "2021-03-24 13:19:56.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 218,
                "date_measured" : "2021-03-25 14:50:27.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 126,
                "date_measured" : "2021-03-26 18:16:40.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 97,
                "date_measured" : "2021-03-27 13:57:45.0",
                "fasting" : "fasting"
            }
        ]}.response;
    
    data = data.map((d) => {
        return {
            value: d.value,
            dateMeasured: moment(d.date_measured).toDate(),
            patient: {
                id: d.patient_id
            },
            fasting: d.fasting
        };
    });

    console.log(JSON.stringify(data));

    const width = 1152;
    const height = 300;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    // const pxX = svgWidth - margin.left - margin.right;
    // const pxY = svgHeight - margin.top - margin.bottom;

    // console.log('pxX:', pxX, 'pxY:', pxY);

    const svg = d3.select('#chartContainer')
        .append('svg')
        .style('background', 'var(--background-color)')
        // .style('max-width', `${svgWidth}px`)
        .style('font', '8px sans-serif')
        .style('overflow', 'visible')
        // .attr('height', svgHeight)
        // .attr('width', svgWidth)
        // .attr('preserveAspectRatio', 'xMinYMin meet')
        // .attr('viewBox', `0 0 ${svgWidth - margin.right - margin.left} ${svgHeight - margin.top - margin.bottom}`)
        .attr('viewBox', `0 0 ${width} ${height}`)
        // .classed('svg-content', true)
        ;

    // console.log('svgWidth:', svgWidth, 'svgHeight:', svgHeight, 'svg', svg);

    const domainX = d3.extent(data, function (d) {
        return d['dateMeasured'];
    });

    const scaleX = d3.scaleTime()
        .domain(domainX)
        .range([margin.left, width - margin.right])
        .nice();

    const thresholdLow = 80;
    const thresholdHigh = 140;

    const yDomainValues = data.map((d) => (d.value));

    const yMinValue = Math.min(...yDomainValues);
    const yMinDomain = yMinValue < thresholdLow ? yMinValue : thresholdLow;

    const yMaxValue = Math.max(...yDomainValues);
    const yMaxDomain = yMaxValue > thresholdHigh ? yMaxValue : thresholdHigh;

    const scaleY = d3.scaleLinear()
        // .domain(d3.extent(data, d => d['value']))
        .domain([yMinDomain, yMaxDomain])
        .range([height - margin.bottom, margin.top])
        .nice();

    var thresholdRanges = [
        {
            rangeStart: thresholdLow,
            rangeEnd: thresholdHigh,
            color: "var(--gray-9)"
        }
    ];

    var thresholdGroup = svg
        .selectAll("g.threshold")
        .data(thresholdRanges)
        .enter()
        .append("g")
        .attr("class", "threshold");

    thresholdGroup.append("rect")
        .attr("x", margin.left)
        .attr("y", function (d) {
            return scaleY(d.rangeEnd);
        })
        .attr("height", function (d) {
            return scaleY(d.rangeStart) - scaleY(d.rangeEnd);
        })
        .attr("width", width - margin.right - margin.left)
        .style("fill", function (d) { return d.color; });

    const thresholdBorder = svg
        .selectAll('g.thresholdBorder')
        .data(thresholdRanges)
        .enter()
        .append('g')
        .attr('class', 'threshold-range');

    thresholdBorder
        .append('line')
        .attr('stroke', 'var(--gray-5)')
        .attr('stroke-dasharray', '2,2')
        .attr('x1', margin.left)
        .attr('y1', function (d) { return scaleY(d.rangeEnd); })
        .attr('x2', function (d) { return width - margin.right; })
        .attr('y2', function (d) { return scaleY(d.rangeEnd); })

    const lineMaker = d3.line()
        .x(d => scaleX(d['dateMeasured']))
        .y(d => scaleY(d['value']));

    svg.append('g')
        .attr('id', 'chartLineGroup')
        .classed('chart-line', true)
        .append('path')
        .attr('d', lineMaker(data));

    var symbolTypes = {
        "diamond": d3.symbol(d3.symbolDiamond, 20),
        "circle": d3.symbol(d3.symbolCircle, 20)
    };

    svg.append('g')
        .attr('id', 'chartPointsGroup')
        .classed('chart-points', true)
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', function (d) {
            const symbolFunction = (d.value < thresholdLow || d.value > thresholdHigh) ? symbolTypes['circle'] : symbolTypes['circle'];
            return symbolFunction();
        })
        .attr("transform", function (d) {
            return "translate(" + scaleX(d['dateMeasured']) + "," + scaleY(d['value']) + ")";
        })
        .attr('fill', function (d, i) {
            // return (d.value < thresholdLow || d.value > thresholdHigh) ? 'var(--foreground-color)' : 'var(--brand-blue)';
            return d.fasting === 'fasting' ? 'var(--foreground-color)' : 'var(--brand-blue)';
        });

    svg.append('g')
        .attr('id', 'chartPointsTextGroup')
        .classed('chart-points-text-group', true)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d) => scaleX(d['dateMeasured']) - 3)
        .attr('y', (d) => scaleY(d['value']) - 7)
        .text((d) => d.value);

    svg.select('#chartPointsGroup')
        .selectAll('path')
        .on('mouseover', function (event, d) {
            console.log(d.value);
        });

    const timeFormat = d3.utcFormat("%H:%M %p");

    // X Axis
    const xAxisGenerator = d3.axisBottom(scaleX)
        // .tickSize(-(svgHeight - margin.top - margin.bottom))
        .tickSize(-6)
        // .tickSizeInner(3)
        .tickPadding(8)
        // .ticks(d3.timeHour.every(72), "%I %p")
        // .tickFormat(format)
        // .ticks(d3.timeDay)
        .ticks(20)
        ;

    console.log('xAxisGenerator', xAxisGenerator);

    const xAxis = svg.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxisGenerator);

    // Y Axis
    const yAxisGenerator = d3.axisLeft(scaleY)
        // .tickSize(-(svgWidth - margin.right - margin.left))
        .tickSize(0)
        .tickPadding(10)
        // .ticks(10)
        ;

    const yAxis = svg.append('g')
        .classed('y axis', true)
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxisGenerator);

    // Remove first Y coordinate
    yAxis.select(':nth-child(2) > text').remove()

}