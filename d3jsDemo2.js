
let data = JSON.parse('{"response": [{"id":1,"dateMeasured":"2021-08-11T12:33:04-0500","dateRecorded":"2021-08-11T12:33:24-0500","employee":{"id":36},"patient":{"id":324},"voidDate":"2021-08-12T09:48:43-0500","voidingEmployee":{"id":74},"creationDate":"2021-08-11T12:33:25-0500","value":132,"source":"Stated","fasting":"nonfasting"},{"id":2,"dateMeasured":"2021-08-11T13:28:53-0500","dateRecorded":"2021-08-11T13:29:16-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-11T13:29:17-0500","value":118,"source":"Stated","fasting":"nonfasting"},{"id":3,"dateMeasured":"2021-08-12T12:38:29-0500","dateRecorded":"2021-08-12T12:38:47-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T12:38:47-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":4,"dateMeasured":"2021-08-12T13:10:17-0500","dateRecorded":"2021-08-12T13:10:44-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T13:10:45-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":5,"dateMeasured":"2021-08-12T14:06:33-0500","dateRecorded":"2021-08-12T14:07:05-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T14:07:06-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":6,"dateMeasured":"2021-08-12T15:57:46-0500","dateRecorded":"2021-08-12T15:58:06-0500","employee":{"id":36},"patient":{"id":354},"creationDate":"2021-08-12T15:58:07-0500","value":114,"source":"Stated","fasting":"nonfasting"},{"id":7,"dateMeasured":"2021-08-12T16:43:12-0500","dateRecorded":"2021-08-12T16:43:33-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T16:43:34-0500","value":113,"source":"Stated","fasting":"nonfasting"},{"id":8,"dateMeasured":"2021-08-16T10:29:34-0500","dateRecorded":"2021-08-16T10:31:28-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-16T10:31:28-0500","value":122,"source":"Actual","fasting":"fasting","location":"Left middle"},{"id":9,"dateMeasured":"2021-08-16T10:31:09-0500","dateRecorded":"2021-08-16T10:31:32-0500","employee":{"id":36},"patient":{"id":365},"creationDate":"2021-08-16T10:31:33-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":10,"dateMeasured":"2021-08-16T10:36:29-0500","dateRecorded":"2021-08-16T10:36:29-0500","employee":{"id":74},"patient":{"id":324},"creationDate":"2021-08-16T10:36:30-0500","value":111,"source":"stated","fasting":"fasting","location":"Left"},{"id":11,"dateMeasured":"2021-08-16T10:41:40-0500","dateRecorded":"2021-08-16T10:41:40-0500","employee":{"id":23},"patient":{"id":400},"creationDate":"2021-08-16T10:41:41-0500","value":33,"source":"stated","fasting":"fasting","location":"Pinky"},{"id":12,"dateMeasured":"2021-08-12T14:17:00-0500","dateRecorded":"2021-08-16T14:18:23-0500","employee":{"id":36},"patient":{"id":419},"creationDate":"2021-08-16T14:18:23-0500","value":234,"source":"Stated","fasting":"nonfasting","location":"Left middle"},{"id":13,"dateMeasured":"2021-08-16T15:44:57-0500","dateRecorded":"2021-08-16T15:45:20-0500","employee":{"id":74},"patient":{"id":201},"creationDate":"2021-08-16T15:50:37-0500","value":134,"source":"Stated","fasting":"nonfasting"},{"id":14,"dateMeasured":"2021-08-16T16:54:24-0500","dateRecorded":"2021-08-16T16:54:46-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-16T16:54:47-0500","value":172,"source":"Stated","fasting":"nonfasting"},{"id":15,"dateMeasured":"2021-08-17T10:58:38-0500","dateRecorded":"2021-08-17T10:59:02-0500","employee":{"id":36},"patient":{"id":383},"creationDate":"2021-08-17T10:59:03-0500","value":132,"source":"Stated","fasting":"nonfasting"},{"id":16,"dateMeasured":"2021-08-17T11:08:50-0500","dateRecorded":"2021-08-17T11:08:53-0500","employee":{"id":36},"patient":{"id":417},"creationDate":"2021-08-17T11:08:54-0500","value":117,"source":"Stated","fasting":"nonfasting"},{"id":17,"dateMeasured":"2021-08-17T11:41:24-0500","dateRecorded":"2021-08-17T11:41:53-0500","employee":{"id":36},"patient":{"id":419},"creationDate":"2021-08-17T11:41:54-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":18,"dateMeasured":"2021-08-17T12:59:15-0500","dateRecorded":"2021-08-17T12:59:44-0500","employee":{"id":36},"patient":{"id":382},"creationDate":"2021-08-17T12:59:45-0500","value":135,"source":"Stated","fasting":"nonfasting"},{"id":19,"dateMeasured":"2021-08-17T15:15:06-0500","dateRecorded":"2021-08-17T15:15:24-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-17T15:15:25-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":20,"dateMeasured":"2021-08-17T15:32:59-0500","dateRecorded":"2021-08-17T15:34:04-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-17T15:34:05-0500","value":100,"source":"Actual","fasting":"twoHrPP","location":"Left ring"},{"id":21,"dateMeasured":"2021-09-15T13:54:43-0500","dateRecorded":"2021-09-15T13:55:10-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-09-15T13:55:10-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":22,"dateMeasured":"2021-09-17T09:34:59-0500","dateRecorded":"2021-09-17T09:35:22-0500","employee":{"id":36},"patient":{"id":149},"creationDate":"2021-09-17T09:35:23-0500","value":97,"source":"Stated","fasting":"nonfasting"},{"id":23,"dateMeasured":"2021-09-17T11:59:48-0500","dateRecorded":"2021-09-17T12:00:06-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-09-17T12:00:07-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":24,"dateMeasured":"2021-09-21T11:10:37-0500","dateRecorded":"2021-09-21T11:10:41-0500","employee":{"id":36},"patient":{"id":435},"creationDate":"2021-09-21T11:10:42-0500","value":123,"source":"Stated","fasting":"nonfasting"}]}').response;

data = data.map((d) => {
    return {
        value: d.value,
        dateMeasured: d.dateMeasured,
        patientId: d.patient.id
    };
});

data = data.filter((d) => d.patientId === 324);

// console.table(data);
// console.table(data.filter( (d) => d.patientId === 324));

// data = data.filter( (d) => d.patient.id === 324);

// console.log('1', data.reduce( (acc, d) => {
//     const count = acc[d.patientId];
//     acc[d.patientId] = count ? count + 1 : 1;
//     return acc;
// }, {} ))

// data.forEach( (d) => { console.log(d.patient.id) })

function makeDemo() {

    const svgWidth = 1152;
    const svgHeight = 300;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    // const padding = { top: 5, right: 5, bottom: 5, left: 5 };
    // const pxX = svgWidth - margin.left - margin.right;
    // const pxY = svgHeight - margin.top - margin.bottom;

    // console.log('pxX:', pxX, 'pxY:', pxY);

    const svg = d3.select('#chartContainer')
        .append('svg')
        .style('background', 'var(--background-color)')
        // .style('max-width', `${svgWidth}px`)
        .style('font', '10px sans-serif')
        .style('overflow', 'visible')
        // .attr('height', svgHeight)
        // .attr('width', svgWidth)
        // .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
        // .classed('svg-content', true)
        ;

    // console.log('svgWidth:', svgWidth, 'svgHeight:', svgHeight, 'svg', svg);

    const timeDomain = d3.extent(data, function (d) {
        const x = new Date(d['dateMeasured']);
        return x;
    });

    // console.log('extent', timeDomain);

    const scX = d3.scaleTime()
        .domain(timeDomain)
        .range([margin.left, svgWidth - margin.right])
        // .ticks(d3.timeHour.every(12))
        .nice()
        ;

    const scY = d3.scaleLinear()
        .domain(d3.extent(data, d => d['value']))
        .range([svgHeight - margin.bottom, margin.top])
        .nice();

    const thresholdLow = 80;
    const thresholdHigh = 140;

    const lineMaker = d3.line()
        .x(d => scX(new Date(d['dateMeasured'])))
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
        .attr('cx', d => scX(new Date(d['dateMeasured'])))
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
        .attr('transform', `translate(0, ${svgHeight - margin.bottom})`)
        .call(xAxis)
        .append('text')
        .attr('fill', 'black')
        .attr('transform', 'translate(0, 260)');

    // Y Axis
    const yAxis = d3.axisLeft(scY)
        .tickSize(0)
        .tickPadding(10)
        ;

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);
}