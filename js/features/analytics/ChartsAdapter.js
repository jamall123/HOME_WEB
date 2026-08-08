/**
 * ChartsAdapter.js
 * Abstract chart renderer that uses native Canvas API.
 * Ensures zero dependencies on external libraries like Chart.js unless configured.
 */

export class ChartsAdapterClass {
    renderBarChart(canvasId, data, labels, color = '#4caf50') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 30;
        const width = canvas.width - (padding * 2);
        const height = canvas.height - (padding * 2);
        
        const maxVal = Math.max(...data, 1);
        const barWidth = width / data.length;

        ctx.fillStyle = color;
        ctx.font = '12px Arial';

        data.forEach((val, i) => {
            const barHeight = (val / maxVal) * height;
            const x = padding + (i * barWidth);
            const y = canvas.height - padding - barHeight;

            // Draw Bar
            ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

            // Draw Label
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + (barWidth / 2), canvas.height - 10);
            
            // Draw Value
            ctx.fillText(val, x + (barWidth / 2), y - 5);
            ctx.fillStyle = color;
        });
    }

    renderDoughnutChart(canvasId, data, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const total = data.reduce((a, b) => a + b, 0);
        let startAngle = -0.5 * Math.PI;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 20;

        data.forEach((val, i) => {
            const sliceAngle = (val / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            startAngle += sliceAngle;
        });

        // Inner circle for doughnut effect
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
}
export const ChartsAdapter = new ChartsAdapterClass();
