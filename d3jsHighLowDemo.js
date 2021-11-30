function makeBloodPressureDemo() {

    let data = {
        response: [
            {
                "patient_id": 81386,
                "systolic_value": 130,
                "diastolic_value": 77,
                "date_measured": "2021-04-18 22:07:38.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 125,
                "diastolic_value": 69,
                "date_measured": "2021-04-18 22:08:09.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 116,
                "diastolic_value": 70,
                "date_measured": "2021-04-19 18:03:37.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 121,
                "diastolic_value": 59,
                "date_measured": "2021-04-20 15:33:10.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 115,
                "diastolic_value": 60,
                "date_measured": "2021-04-20 16:20:18.0",
                "location": "Right Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 110,
                "diastolic_value": 61,
                "date_measured": "2021-04-22 18:07:13.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 103,
                "diastolic_value": 64,
                "date_measured": "2021-04-23 15:55:09.0",
                "location": "Left Arm",
                "position": "Sitting"
            },
            {
                "patient_id": 81386,
                "systolic_value": 117,
                "diastolic_value": 72,
                "date_measured": "2021-04-24 14:46:19.0",
                "location": "Right Arm",
                "position": "Sitting"
            }
        ]
    }.response;

    let dataMedChange = [
        {
            dateChanged: "2021-04-18 22:07:38.0"
        },
        {
            dateChanged: "2021-04-22 18:07:13.0"
        }
    ];

    dataMedChange = dataMedChange.map((d) => ({ dateChanged: moment(d.dateChanged).toDate() }));

    data = data.map((d) => {
        return {
            dateMeasured: moment(d.date_measured).toDate(),
            patientId: d.patient_id,
            systolicValue: d.systolic_value,
            diastolicValue: d.diastolic_value,
            location: d.location,
            position: d.position
        };
    });

    const thresholds = {
        "id": 1,
        "patient_id": null,
        "blood_pressure_thresholds_enabled": 1,
        "blood_pressure_systolic_high": 140,
        "blood_pressure_systolic_low": 100,
        "blood_pressure_diastolic_high": 90,
        "blood_pressure_diastolic_low": 60,
        "pulse_thresholds_enabled": 1,
        "pulse_high": 100,
        "pulse_low": 60,
        "temperature_thresholds_enabled": 1,
        "temperature_high": 99.1,
        "temperature_low": 97.8,
        "respiratory_rate_thresholds_enabled": 1,
        "respiratory_rate_high": 20,
        "respiratory_rate_low": 16,
        "o2_saturation_thresholds_enabled": 1,
        "o2_saturation_high": 100,
        "o2_saturation_low": 96,
        "blood_sugar_thresholds_enabled": 1,
        "blood_sugar_high": 140,
        "blood_sugar_low": 80,
        "abdominal_girth_thresholds_enabled": 1,
        "abdominal_girth_high": 999,
        "abdominal_girth_low": 0,
        "weight_thresholds_enabled": 0,
        "weight_high": 1500,
        "weight_low": 0,
        "height_thresholds_enabled": 0,
        "height_high": 275,
        "height_low": 0,
        "hba1c_high": 14.0,
        "hba1c_low": 4.0,
        "hba1c_thresholds_enabled": 1
    };

    const svgWidth = 1152;
    const svgHeight = 300;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    // const pxX = svgWidth - margin.left - margin.right;
    // const pxY = svgHeight - margin.top - margin.bottom;

    // console.log('pxX:', pxX, 'pxY:', pxY);

    const svg = d3.select('#bloodPressureDemo')
        .append('svg')
        .style('background', 'var(--background-color)')
        // .style('max-width', `${svgWidth}px`)
        .style('font', '8px sans-serif')
        .style('overflow', 'visible')
        // .attr('height', svgHeight)
        // .attr('width', svgWidth)
        // .attr('preserveAspectRatio', 'xMinYMin meet')
        // .attr('viewBox', `0 0 ${svgWidth - margin.right - margin.left} ${svgHeight - margin.top - margin.bottom}`)
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
        // .classed('svg-content', true)
        ;

    // console.log('svgWidth:', svgWidth, 'svgHeight:', svgHeight, 'svg', svg);

    const timeDomain = d3.extent(data, function (d) {
        console.log('dateMeasured', d['dateMeasured']);
        const x = new Date(d['dateMeasured']);
        return x;
    });

    const scX = d3.scaleTime()
        .domain(timeDomain)
        .range([margin.left, svgWidth - margin.right])
        .nice();

    const domainX1 = d3.extent(dataMedChange, function (d) {
        console.log('dateChanged', d['dateChanged']);
        // const x = new Date();
        return d['dateChanged'];
    });

    const scX1 = d3.scaleTime()
        .domain(domainX1)
        .range([margin.left, svgWidth - margin.right])
        .nice();

    function scaleMaker(scaleType, domain) {
        return scaleType.domain(domain)
            .range([svgHeight - margin.bottom, margin.top])
            .nice();
    }

    function domainMaker(accessors, thresholds) {

        let yDomainValues = accessors.reduce((acc, accessor) => {
            acc = acc.concat(data.map(accessor));
            return acc;
        }, []);

        yDomainValues = yDomainValues.concat(thresholds)

        const yMinValue = Math.min(...yDomainValues);
        const yMaxValue = Math.max(...yDomainValues);

        return [yMinValue, yMaxValue];
    }

    const yDomainValues = domainMaker([(d) => (d.systolicValue), (d) => (d.diastolicValue)],
        [thresholds.blood_pressure_diastolic_low, thresholds.blood_pressure_diastolic_high, thresholds.blood_pressure_systolic_low, thresholds.blood_pressure_systolic_high]);

    // console.log('yDomainValues', yDomainValues)

    const scY = scaleMaker(d3.scaleLinear(), yDomainValues)

    var thresholdRanges = [
        {
            rangeStart: thresholds.blood_pressure_diastolic_low,
            rangeEnd: thresholds.blood_pressure_diastolic_high,
            color: "var(--gray-9)"
        },
        {
            rangeStart: thresholds.blood_pressure_systolic_low,
            rangeEnd: thresholds.blood_pressure_systolic_high,
            color: "var(--gray-9)"
        }
    ];

    const thresholdGroup = svg
        .selectAll("g.threshold")
        .data(thresholdRanges)
        .enter()
        .append("g")
        .attr("class", "threshold");

    thresholdGroup.append("rect")
        .attr("x", margin.left)
        .attr("y", function (d) {
            return scY(d.rangeEnd);
        })
        .attr("height", function (d) {
            return scY(d.rangeStart) - scY(d.rangeEnd);
        })
        .attr("width", svgWidth - margin.right - margin.left)
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
        .attr('y1', function (d) { return scY(d.rangeEnd); })
        .attr('x2', function (d) { return svgWidth - margin.right; })
        .attr('y2', function (d) { return scY(d.rangeEnd); });

    thresholdBorder
        .append('line')
        .attr('stroke', 'var(--gray-5)')
        .attr('stroke-dasharray', '2,2')
        .attr('x1', margin.left)
        .attr('y1', function (d) { return scY(d.rangeStart); })
        .attr('x2', function (d) { return svgWidth - margin.right; })
        .attr('y2', function (d) { return scY(d.rangeStart); });

    const verticalLines = svg
        .selectAll('g.vertical-lines')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'vertical-lines');

    verticalLines
        .append('line')
        .attr('stroke', 'var(--gray-5)')
        .attr('x1', function (d) { return scX(new Date(d['dateMeasured'])); })
        .attr('y1', function (d) { return scY(d['systolicValue']); })
        .attr('x2', function (d) { return scX(new Date(d['dateMeasured'])); })
        .attr('y2', function (d) { return scY(d['diastolicValue']); })

    // Med change
    // svg.append('g')
    //     .attr('id', 'medChangeGroup')
    //     .selectAll('text')
    //     .data(dataMedChange)
    //     .enter()
    //     .append('text')
    //     .attr('x', (d) => scX1(d['dateChanged']))
    //     .attr('y', (d) => scY(55))
    //     // .attr('font-family', 'Font Awesome 5 Brands')
    //     // .attr('font-size', function (d) { return 2 + 'em' })
    //     .attr("class", "fa")
    //     .text('\uf484');

    svg.append('g')
        .attr('id', 'medChangeGroup')
        .selectAll('text')
        .data(dataMedChange)
        .enter()
        .append('text')
        .attr('x', (d) => scX1(d['dateChanged']))
        .attr('y', (d) => scY(55))
        .attr("class", "fas")
        .attr('font-size', '15px')
        .attr('fill', 'var(--gray-2)')
        .text('\uf484');


    var symbolTypes = {
        "diamond": d3.symbol(d3.symbolDiamond, 40),
        "circle": d3.symbol(d3.symbolCircle, 30)
    };

    svg.append('g')
        .attr('id', 'chartPointsGroup')
        .classed('chart-points', true)
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', function (d) {
            const symbolFunction = (d.systolicValue < thresholds.blood_pressure_systolic_low || d.systolicValue > thresholds.blood_pressure_systolic_high) ? symbolTypes['diamond'] : symbolTypes['circle'];
            return symbolFunction();
        })
        .attr("transform", function (d) {
            return "translate(" + scX(new Date(d['dateMeasured'])) + "," + scY(d['systolicValue']) + ")";
        })
        .attr('fill', function (d, i) {
            return (d.systolicValue < thresholds.blood_pressure_systolic_low || d.systolicValue > thresholds.blood_pressure_systolic_high) ? 'var(--red-3)' : 'var(--brand-blue)';
        });

    svg.append('g')
        .attr('id', 'chartPointsGroup2')
        .classed('chart-points', true)
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', function (d) {
            const symbolFunction = (d.diastolicValue < thresholds.blood_pressure_diastolic_low || d.diastolicValue > thresholds.blood_pressure_diastolic_high) ? symbolTypes['diamond'] : symbolTypes['circle'];
            return symbolFunction();
        })
        .attr("transform", function (d) {
            return "translate(" + scX(new Date(d['dateMeasured'])) + "," + scY(d['diastolicValue']) + ")";
        })
        .attr('fill', function (d, i) {
            return (d.diastolicValue < thresholds.blood_pressure_diastolic_low || d.diastolicValue > thresholds.blood_pressure_diastolic_high) ? 'var(--red-4)' : 'var(--brand-blue)';
        });

    svg.append('g')
        .attr('id', 'chartPointsTextGroup1')
        .classed('chart-points-text-group', true)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d) => scX(new Date(d['dateMeasured'])) - 5)
        .attr('y', (d) => scY(d['systolicValue']) - 7)
        .text((d) => d['systolicValue']);

    svg.append('g')
        .attr('id', 'chartPointsTextGroup2')
        .classed('chart-points-text-group', true)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d) => scX(new Date(d['dateMeasured'])) - 3)
        .attr('y', (d) => scY(d['diastolicValue']) + 12)
        .text((d) => d['diastolicValue']);

    svg.select('.chart-points')
        .selectAll('path')
        .on('mouseover', function (event, d) {
            console.log('x ', scX(new Date(d['dateMeasured'])));
            console.log('y systolic ', scY(d.systolicValue));
            console.log('y diastolic ', scY(d.diastolicValue));
        });

    const timeFormat = d3.utcFormat("%H:%M %p");

    // X Axis
    const xAxisGenerator = d3.axisBottom(scX)
        // .tickSize(-(svgHeight - margin.top - margin.bottom))
        .tickSize(-6)
        // .tickSizeInner(3)
        .tickPadding(8)
        // .ticks(d3.timeHour.every(72), "%I %p")
        // .tickFormat(format)
        // .ticks(d3.timeDay)
        .ticks(20)
        ;

    const xAxis = svg.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${svgHeight - margin.bottom})`)
        .call(xAxisGenerator);

    // Y Axis
    const yAxisGenerator = d3.axisLeft(scY)
        // .tickSize(-(svgWidth - margin.right - margin.left))
        .tickSize(0)
        .tickPadding(10)
        // .ticks(10)
        ;

    // console.log(1, yAxisGenerator.scale().ticks());

    const yAxis = svg.append('g')
        .classed('y axis', true)
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxisGenerator);

    // Remove first Y coordinate
    yAxis.select(':nth-child(2) > text').remove()

}