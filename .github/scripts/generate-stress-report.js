const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error('Uso: node generate-stress-report.js <input.json> <output.html>');
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf8'));
    
    const counters = data.aggregate?.counters || {};
    const rates = data.aggregate?.rates || {};
    const summaries = data.aggregate?.summaries || {};

    const vusersCreated = counters['vusers.created'] || 0;
    const vusersFailed = counters['vusers.failed'] || 0;
    const vusersCompleted = counters['vusers.completed'] || 0;
    
    const errors = Object.keys(counters)
        .filter(k => k.startsWith('errors.'))
        .map(k => ({ type: k.replace('errors.', ''), count: counters[k] }));
        
    const totalErrors = errors.reduce((acc, curr) => acc + curr.count, 0);

    const vusersSessionLength = summaries['vusers.session_length'] || { min: 0, max: 0, median: 0, p95: 0 };
    
    const isSuccess = vusersFailed === 0 && totalErrors === 0 && vusersCompleted > 0;
    const scoreColor = isSuccess ? '#4ade80' : '#f87171'; // Green or Red
    const scoreText = isSuccess ? 'A' : 'F';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Carga - Socket.IO</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand-black: #000000;
            --brand-white: #ffffff;
            --brand-green: #4ade80;
            --brand-red: #f87171;
            --brand-gray: #f8f9fa;
        }
        body { 
            font-family: 'JetBrains Mono', monospace; 
            background: var(--brand-white); 
            color: var(--brand-black); 
            padding: 2rem; 
            margin: 0; 
        }
        
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 2rem;
        }
        
        .score-box {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .score-label {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        
        .score-value {
            font-size: 3rem;
            font-weight: 800;
        }
        
        .score-grade {
            background: ${scoreColor};
            color: var(--brand-black);
            border: 4px solid var(--brand-black);
            padding: 0.5rem 1.5rem;
            font-size: 3rem;
            font-weight: 800;
            box-shadow: 4px 4px 0px 0px var(--brand-black);
        }

        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .tab {
            font-family: 'Space Grotesk', sans-serif;
            padding: 0.5rem 1.5rem;
            border: 2px solid var(--brand-black);
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: 4px 4px 0px 0px var(--brand-black);
        }
        .tab.active {
            background: var(--brand-black);
            color: var(--brand-white);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .card { 
            background: var(--brand-white); 
            padding: 1.5rem; 
            border: 3px solid var(--brand-black);
            box-shadow: 6px 6px 0px 0px var(--brand-black);
        }
        
        .card h3 {
            font-family: 'Space Grotesk', sans-serif;
            margin: 0 0 1rem 0;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 2px solid var(--brand-black);
            padding-bottom: 0.5rem;
        }
        
        .card .value {
            font-size: 2.5rem;
            font-weight: 800;
        }

        .chart-area {
            border: 3px solid var(--brand-black);
            padding: 2rem;
            box-shadow: 6px 6px 0px 0px var(--brand-black);
            margin-bottom: 2rem;
        }
        
        .chart-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }
        
        .chart-title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'JetBrains Mono', monospace;
        }
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid var(--brand-black);
        }
        th {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
    </style>
</head>
<body>
    <div class="header-section">
        <div>
            <!-- left side empty for now, title is in parent iframe -->
        </div>
        <div class="score-box">
            <div style="text-align: right">
                <div class="score-label">ERROR RATE</div>
                <div class="score-value">${vusersCreated > 0 ? ((vusersFailed / vusersCreated) * 100).toFixed(2) : 0}%</div>
            </div>
            <div class="score-grade">${scoreText}</div>
        </div>
    </div>

    <div class="tabs">
        <div class="tab active">Métricas</div>
        <div class="tab">Tiempos</div>
        <div class="tab">Errores</div>
    </div>
    
    <div class="grid">
        <div class="card">
            <h3>Usuarios Simulados</h3>
            <div class="value">${vusersCreated}</div>
        </div>
        <div class="card">
            <h3>Usuarios Completados</h3>
            <div class="value">${vusersCompleted}</div>
        </div>
        <div class="card">
            <h3>Usuarios Fallidos</h3>
            <div class="value">${vusersFailed}</div>
        </div>
        <div class="card">
            <h3>Total Errores Red</h3>
            <div class="value">${totalErrors}</div>
        </div>
    </div>

    <div class="chart-area">
        <div class="chart-header">
            <div class="chart-title">Tiempos de Respuesta (ms)</div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Mínimo</th>
                    <th>Máximo</th>
                    <th>Mediana</th>
                    <th>Percentil 95 (p95)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${vusersSessionLength.min || 0}</td>
                    <td>${vusersSessionLength.max || 0}</td>
                    <td>${vusersSessionLength.median || 0}</td>
                    <td>${vusersSessionLength.p95 || 0}</td>
                </tr>
            </tbody>
        </table>
    </div>

    ${errors.length > 0 ? `
    <div class="chart-area">
        <div class="chart-header">
            <div class="chart-title">Desglose de Errores</div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Tipo de Error</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>
                ${errors.map(e => `
                <tr>
                    <td style="color: var(--brand-red); font-weight: 700;">${e.type}</td>
                    <td>${e.count}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}
</body>
</html>`;

    fs.writeFileSync(path.resolve(outputFile), html, 'utf8');
    console.log('Reporte HTML generado correctamente en ' + outputFile);

} catch (error) {
    console.error('Error al generar el reporte HTML:', error);
    process.exit(1);
}
