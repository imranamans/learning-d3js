<template>
    <div class="line-chart-container">
        <svg :id="id"
             ref="lineChart"
             :viewBox="viewBox"
             class="line-chart"
             width="100%">

            <g :id="id + '_shadedRegionGroup'"
               class="shaded-region"></g>
            <g :id="id + '_shadedRegionBorderGroup'"
               class="shaded-region-border"></g>

            <g :id="id + '_xGrid'" class="x-grid"></g>
            <g :id="id + '_yGrid'" class="y-grid"></g>

            <g :id="id + '_xAxis'" class="x-axis"></g>
            <g :id="id + '_yAxis'" class="y-axis"></g>

            <g :id="id + '_lineGroup'"
               class="line"></g>

            <g :id="id + '_pointsGroup'"
               class="points"></g>

            <g :id="id + '_legendGroup'"
               class="legend"></g>

            <defs>
                <radialGradient id="pointHighlight">
                    <stop offset="50%" stop-color="var(--brand-blue)" stop-opacity="1"/>
                    <stop offset="100%" stop-color="var(--brand-blue)" stop-opacity="0.3"/>
                </radialGradient>
            </defs>
        </svg>
    </div>
</template>

<script>
import {
    clearChart, debugChart,
    drawAnnotation,
    drawAxes,
    drawGridLines,
    drawLegend,
    drawLine,
    drawPoints,
    drawShadedRegion,
    redrawLine,
    redrawPoints
} from './Chart.js';
import {merge} from 'lodash';

export default {
    name: 'LineChart',
    props: {
        id: {
            type: String,
            required: true
        },
        /**
         * Overall width of the line chart
         */
        width: {
            type: Number,
            required: true
        },
        /**
         * Overall height of the line chart
         */
        height: {
            type: Number,
            required: true
        },
        /**
         * An array of objects.  The value for the X axis is retrieved from the object
         * property named by options.parsing.xAxisKey.  The value for the Y axis is
         * retrieved from the object property named by options.parsing.yAxisKey.
         */
        data: {
            type: Array,
            required: true
        },
        /**
         * Defines options for how the line chart will be displayed.
         * @see https://confluence.pointclickcare.com/confluence/display/HC/Graphing+Component+API+Documentation
         */
        options: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            defaultOptions: {
                margin: {top: 20, right: 20, bottom: 40, left: 40},
                width: this.width,
                height: this.height,
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                },
                dataKey: null,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: false,
                            text: null,
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
                            },
                            tickFormat: null
                        },
                        nice: false,
                        min: null,
                        max: null,
                        suggestedMin: null,
                        suggestedMax: null
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: false,
                            text: null,
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
                        },
                        nice: false,
                        min: null,
                        max: null,
                        suggestedMin: null,
                        suggestedMax: null
                    }
                },
                shadedRegion: {
                    display: false,
                    backgroundColor: 'var(--gray-8)',
                    y: {
                        start: null,
                        end: null
                    }
                },
                points: {
                    display: true,
                    shape: function(d, i) {
                        return 'circle';
                    },
                    size: function(d, i) {
                        return 20;
                    },
                    borderColor: function(d, i) {
                        return 'var(--brand-blue)';
                    },
                    borderWidth: 1,
                    backgroundColor: function(d, i) {
                        return 'var(--brand-blue)';
                    },
                    animate: true,
                    labels: {
                        display: false,
                        text: function(d, i) {
                            return null;
                        },
                        fontSize: '8px',
                        color: function(d, i) {
                            return 'var(--brand-blue)';
                        },
                        x: null,
                        y: null
                    },
                    tooltip: {
                        display: false,
                        callback: function(d, i) {
                            // can return html.
                            return d.value;
                        },
                        textAlign: 'center',
                        backgroundColor: 'var(--gray-1)',
                        color: 'var(--foreground-color)',
                        borderRadius: '5px',
                        borderWidth: 0,
                        borderColor: null,
                        pointerEvents: 'none',
                        width: 'auto',
                        height: 'auto',
                        padding: '5px',
                        offset: 10
                    }
                },
                line: {
                    color: 'var(--gray-4)',
                    width: 0.5,
                    animate: true
                },
                legend: {
                    padding: 10,
                    display: false,
                    fontSize: '6px',
                    items: []
                },
                annotation: {
                    annotations: {}
                }
            }
        };
    },
    computed: {
        config() {
            return merge({}, this.defaultOptions, this.options);
        },
        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
        }
    },
    watch: {
        data: function(newValue) {
            this.redrawChart();
        },
        options: {
            deep: true,
            handler(newValue) {
                this.redrawChart();
            }
        }
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        drawChart() {
            debugChart(this.config, this.data, this.$refs.lineChart);
            // drawShadedRegion(this.config, this.data, this.$refs.lineChart);
            // drawGridLines(this.config, this.data, this.$refs.lineChart);
            // drawAxes(this.config, this.data, this.$refs.lineChart);
            drawLine(this.config, this.data, this.$refs.lineChart);
            redrawPoints(this.config, this.data, this.$refs.lineChart);
            // drawLegend(this.config, this.$refs.lineChart);
            // drawAnnotation(this.config, this.data, this.$refs.lineChart);
        },
        redrawChart() {
            // clearChart(this.config, this.data, this.$refs.lineChart);
            // this.drawChart();
            redrawLine(this.config, this.data, this.$refs.lineChart);
            redrawPoints(this.config, this.data, this.$refs.lineChart);
        }
    }
};
</script>

<style scoped>

@import '../../../css/color.css';

.line-chart-container {
    width: 100%;
}

.line-chart {
    width: 100%;
}

g.shaded-region-border {
    stroke: var(--gray-5);
    stroke-dasharray: 2, 2;
    stroke-width: 0.5;
}

</style>

<style>

/* Creates a small triangle extender for the tooltip */
.chart-tooltip:after {
    box-sizing: border-box;
    display: inline;
    font-size: 10px;
    width: 100%;
    line-height: 1;
    color: rgba(0, 0, 0, 0.8);
    content: "\25BC";
    position: absolute;
    text-align: center;
}

/* Style top tooltip */
.chart-tooltip.top:after {
    margin: -2px 0 0 0;
    top: 100%;
    left: 0;
}

</style>