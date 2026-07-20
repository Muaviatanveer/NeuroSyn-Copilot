import ChartjsToImage from 'chartjs-to-image';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config.js';

/**
 * Generates physical chart PNG files on disk from Visualizer specifications.
 * @param {string} sessionId - Workflow session identifier.
 * @param {Array} chartSpecs - Target configurations for the charts.
 * @returns {Promise<Array<string>>} Absolute paths to the written PNG assets.
 */
export async function generateChartImages(sessionId, chartSpecs) {
  const sessionOutputDir = path.join(config.paths.outputs, sessionId);
  if (!fs.existsSync(sessionOutputDir)) {
    fs.mkdirSync(sessionOutputDir, { recursive: true });
  }

  const generatedPaths = [];

  for (let i = 0; i < chartSpecs.length; i++) {
    const spec = chartSpecs[i];
    const chart = new ChartjsToImage();
    
    const labels = spec.suggestedDataPoints.map(p => p.label);
    const dataValues = spec.suggestedDataPoints.map(p => p.value);

    // Apply corporate design palette
    const bgColors = spec.chartType === 'pie' 
      ? ['#1E3A8A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      : '#3B82F6';

    chart.setConfig({
      type: spec.chartType === 'pie' ? 'pie' : spec.chartType === 'line' ? 'line' : 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: spec.title || 'Metrics',
          data: dataValues,
          backgroundColor: bgColors,
          borderColor: '#1E3A8A',
          borderWidth: 1.5,
          fill: spec.chartType === 'line'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: spec.title || 'Data Insights',
            font: { size: 16, weight: 'bold', family: 'Arial' },
            padding: 15
          },
          legend: {
            display: spec.chartType === 'pie'
          }
        },
        scales: spec.chartType !== 'pie' ? {
          y: {
            beginAtZero: true,
            title: { display: true, text: spec.yAxisLabel || 'Value' }
          },
          x: {
            title: { display: true, text: spec.xAxisLabel || 'Category' }
          }
        } : undefined
      }
    });

    chart.setWidth(800);
    chart.setHeight(450);
    chart.setDevicePixelRatio(2);

    const filename = `chart_${i + 1}_${Date.now()}.png`;
    const outputPath = path.join(sessionOutputDir, filename);

    try {
      // Fix method call to match chartjs-to-image API expectations
      await chart.toFile(outputPath);
      generatedPaths.push(outputPath);
    } catch (err) {
      console.error(`[Chart Engine Failure] Could not generate graphic index ${i}:`, err);
    }
  }

  return generatedPaths;
}