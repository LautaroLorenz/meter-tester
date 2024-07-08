import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Tags } from '../../../models/business/database/static.model';
import { BarChartData } from '../../../models/business/interafces/chart/bars.model';
import { colors } from '../../../models/business/constants/colors.model';

@Component({
    selector: 'app-model-tested-widget',
    templateUrl: './model-tested-widget.component.html',
    styleUrls: ['./model-tested-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelTestedWidgetComponent implements OnInit, OnChanges {
    @Input() approvedTags!: Tags[];
    @Input() failedTags!: Tags[];
    @Input() top!: number;

    data!: BarChartData;

    readonly chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: ''
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: ''
                },
                grid: {
                    color: '',
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    color: ''
                },
                grid: {
                    color: '',
                    drawBorder: false
                }
            }
        }
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.approvedTags || changes.failedTags) {
            this.recalculate(this.approvedTags, this.failedTags);
        }
    }

    ngOnInit(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.chartOptions.plugins.legend.labels.color = textColor;
        this.chartOptions.scales.y.ticks.color = textColorSecondary;
        this.chartOptions.scales.y.grid.color = surfaceBorder;
        this.chartOptions.scales.x.ticks.color = textColorSecondary;
        this.chartOptions.scales.x.grid.color = surfaceBorder;
    }

    private recalculate(approvedTags: Tags[], failedTags: Tags[]): void {
        const dataMap: Record<string, number> = {};

        approvedTags.forEach((tag) => {
            const unionTags = tag as unknown as { model: string }[];
            unionTags.forEach(({ model }) => {
                dataMap[model] = dataMap[model] + 1 || 1;
            });
        });

        failedTags.forEach((tag) => {
            const unionTags = tag as unknown as { model: string }[];
            unionTags.forEach(({ model }) => {
                dataMap[model] = dataMap[model] + 1 || 1;
            });
        });

        this.data = Object.keys(dataMap).reduce<BarChartData>(
            (acc, key) => {
                if (!acc.datasets.length) {
                    acc.datasets.push({
                        label: 'Número de pruebas',
                        backgroundColor: [],
                        data: [],
                        borderRadius: 3
                    });
                }
                acc.datasets[0].backgroundColor.push(colors[35]);
                acc.datasets[0].data.push(dataMap[key]);
                acc.labels.push(key);
                return acc;
            },
            {
                datasets: [],
                labels: []
            } as BarChartData
        );
        this.data = this.sortDataByCounters(this.data);
        this.data = this.truncateDataByTop(this.data, this.top);
    }

    private sortDataByCounters(elements: BarChartData): BarChartData {
        if (!elements?.datasets[0]) {
            return {
                datasets: [],
                labels: []
            };
        }

        const onlyData = elements.datasets[0].data.map((counter, index) => ({
            counter,
            index
        }));

        onlyData.sort((a, b) => b.counter - a.counter);

        const sortedData = onlyData.map(({ index }) => elements.datasets[0].data[index]);
        const sortedLabels = onlyData.map(({ index }) => elements.labels[index]);

        return {
            datasets: [
                {
                    ...elements.datasets[0],
                    data: sortedData
                }
            ],
            labels: sortedLabels
        };
    }

    private truncateDataByTop(elements: BarChartData, top: number): BarChartData {
        if (!elements?.datasets[0]) {
            return {
                datasets: [],
                labels: []
            };
        }

        return {
            datasets: [
                {
                    ...elements.datasets[0],
                    data: elements.datasets[0].data.slice(0, top)
                }
            ],
            labels: elements.labels.slice(0, top)
        };
    }
}
