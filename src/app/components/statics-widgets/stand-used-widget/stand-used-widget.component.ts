import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Tags } from '../../../models/business/database/static.model';
import { colors } from '../../../models/business/constants/colors.model';
import { BarChartData } from '../../../models/business/interafces/chart/bars.model';

@Component({
  selector: 'app-stand-used-widget',
  templateUrl: './stand-used-widget.component.html',
  styleUrls: ['./stand-used-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandUsedWidgetComponent implements OnInit, OnChanges {
  @Input() tags!: Tags[];

  data!: BarChartData;

  readonly chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '',
        },
        grid: {
          color: '',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: '',
        },
        grid: {
          color: '',
          drawBorder: false,
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tags) {
      this.recalculate(changes.tags.currentValue as Tags[]);
    }
  }

  ngOnInit(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.chartOptions.plugins.legend.labels.color = textColor;
    this.chartOptions.scales.y.ticks.color = textColorSecondary;
    this.chartOptions.scales.y.grid.color = surfaceBorder;
    this.chartOptions.scales.x.ticks.color = textColorSecondary;
    this.chartOptions.scales.x.grid.color = surfaceBorder;
  }

  private recalculate(tags: Tags[]): void {
    const standUsedMap: Record<string, number> = {};
    tags.forEach((tag) => {
      const unionTags = tag as unknown as { standIndex: string }[];
      unionTags.forEach(({ standIndex }) => {
        standUsedMap[standIndex] = standUsedMap[standIndex] + 1 || 1;
      });
    });
    this.data = Object.keys(standUsedMap).reduce<BarChartData>(
      (acc, key) => {
        if (!acc.datasets.length) {
          acc.datasets.push({
            label: 'Veces utilizado',
            backgroundColor: [],
            data: [],
            borderRadius: 3,
          });
        }
        acc.datasets[0].backgroundColor.push(colors[1]);
        acc.datasets[0].data.push(standUsedMap[key]);
        acc.labels.push(
          `Puesto ${(Number(key) + 1).toString().padStart(2, '0')}`
        );
        return acc;
      },
      {
        datasets: [],
        labels: [],
      } as BarChartData
    );
  }
}
