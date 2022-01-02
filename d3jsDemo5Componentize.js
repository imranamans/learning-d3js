
const defaultConfig = {
    margin: { top: 20, right: 20, bottom: 40, left: 40 },
    width: this.width,
    height: this.height,
    parsing: {
        xAxisKey: 'x',
        yAxisKey: 'y'
    },
    scales: {
        // x and y are scale ids
        x: {
            display: true,
            title: {
                display: false,
                text: '',
                color: 'var(--gray-2)'
            },
            grid: {
                display: false,
                color: 'var(--gray-7)'
            },
            ticks: {
                padding: 8,
                size: -4,
                count: null,
                color: 'var(--gray-4)',
                font: {
                    size: '7px',
                    weight: 0.5
                }
            }
        },
        y: {
            display: true,
            title: {
                display: false,
                text: '',
                color: 'var(--gray-2)'
            },
            grid: {
                display: false,
                color: 'var(--gray-7)'
            },
            ticks: {
                padding: 10,
                size: 0,
                count: null,
                color: 'var(--gray-4)',
                font: {
                    size: '8px',
                    weight: 0.5
                }
            }
        }
    },
    shadedRegion: {
        display: false,
        type: 'box',
        backgroundColor: 'var(--gray-8)',
        y: {
            start: null,
            end: null
        }
    },
    points: {
        display: true,
        shape: function (d, i) {
            return 'circle';
        },
        size: function (d, i) {
            return 20;
        },
        borderColor: function (d, i) {
            return 'var(--brand-blue)';
        },
        backgroundColor: function (d, i) {
            return 'var(--brand-blue)';
        },
        labels: {
            display: false,
            text: function (d, i) {
                return null;
            },
            fontSize: '8px',
            color: function (d, i) {
                return 'var(--brand-blue)';
            },
            x: null,
            y: null
        }
    },
    line: {
        color: 'var(--gray-4)',
        width: 0.5
    },
    legend: {
        padding: 10,
        display: false,
        fontSize: '6px',
        items: [
            // sample
            {
                label: '2 hr postprandial',
                point: {
                    shape: 'square',
                    borderColor: 'var(--brand-blue)',
                    backgroundColor: 'var(--brand-blue)'
                }
            },
            {
                label: 'Multiple entries',
                point: {
                    image: '/resources/img/icon-asterisk.svg',
                    imageWidth: 7,
                    imageHeight: 7
                }
            }
        ]
    },
    annotation: {
        annotations: {
            // sample
            point1: {
                xValue: serverDateTimeToMoment('2021-03-22T19:30:02.000Z').toDate(),
                yValue: 90,
                image: '/resources/img/icon-pill.svg',
                imageWidth: 10,
                imageHeight: 10
            },
            point2: {
                xValue: serverDateTimeToMoment('2021-03-26T23:16:40.000Z').toDate(),
                yValue: 90,
                image: '/resources/img/icon-pill.svg',
                imageWidth: 10,
                imageHeight: 10
            }
        }
    }
};

const defaultConfigLegendItem = {
    label: '',
    point: {
        // shape
        shape: 'circle',
        borderColor: 'var(--brand-blue)',
        backgroundColor: 'var(--foreground-color)',
        // image
        image: '/resources/img/icon-asterisk.svg',
        imageWidth: 7,
        imageHeight: 7
    }
};

const defaultConfigAnnotationPoint = {
    type: 'point',
    xValue: '',
    yValue: '',
    image: '/resources/img/icon-pill.svg',
    imageWidth: 10,
    imageHeight: 10
}

function buildScales(config, data) {

    const scaleIds = Object.keys(config.scales);

    const scaleMap = {};

    scaleIds.forEach(scaleId => {
        scaleMap[scaleId] = makeScale(
            getScaleByType(config.scales[scaleId]),
            getDomainByScale(config, data, scaleId),
            getRangeByScale(config, scaleId)
        );
    });

    return scaleMap;
}

function makeScale(accessor, data, range, scaleType) {
    return getScaleByType(scaleType)
        .domain(extent(data, accessor))
        .range(range)
        .nice();
}

function getAccessorByScale(config, scaleId) {

    const prop = config.parsing && config.parsing[`${scaleId}AxisKey`] ?
        config.parsing[`${scaleId}AxisKey`] :
        scaleId;
    return function (d) {
        return d[prop];
    };
}

function getDomainByScale(config, data, scaleId) {

    return extent(data, getAccessorByScale(config, scaleId));
}

function getRangeByScale(config, scaleId) {
    switch (true) {
        case scaleId.startsWith('x'):
            return [config.margin.left, config.width - config.margin.right];
        case scaleId.startsWith('y'):
            return [config.height - config.margin.bottom, config.margin.top];
        default:
            throw new Error(`Unable to determine range of scale given scale id: ${scaleId}`);
    };
}

function getScaleByType(scaleType) {
    switch (scaleType) {
        case 'time':
            return scaleTime();
        case 'linear':
            return scaleLinear();
        default:
            throw new Error(`Unknown scale type: ${scaleType}`);
    }
}