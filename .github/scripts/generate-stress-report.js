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
    
    // Extraer métricas (evitando errores si alguna métrica no existe)
    const counters = data.aggregate?.counters || {};
    const rates = data.aggregate?.rates || {};
    const summaries = data.aggregate?.summaries || {};

    const vusersCreated = counters['vusers.created'] || 0;
    const vusersFailed = counters['vusers.failed'] || 0;
    const vusersCompleted = counters['vusers.completed'] || 0;
    
    // Contar errores totales de websocket u otros
    const errors = Object.keys(counters)
        .filter(k => k.startsWith('errors.'))
        .map(k => ({ type: k.replace('errors.', ''), count: counters[k] }));
        
    const totalErrors = errors.reduce((acc, curr) => acc + curr.count, 0);

    const httpRate = rates['http.request_rate'] ? rates['http.request_rate'].toFixed(2) : '0';
    const vusersSessionLength = summaries['vusers.session_length'] || { min: 0, max: 0, median: 0, p95: 0 };

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Carga - Artillery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --azure-blue: #0078D4;
            --bg-color: #f3f2f1;
            --card-bg: #ffffff;
            --text-primary: #323130;
            --text-secondary: #605e5c;
            --border: #edebe9;
            --danger: #d13438;
            --success: #107c10;
        }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            background: var(--bg-color); 
            color: var(--text-primary); 
            padding: 2rem; 
            max-width: 1000px; 
            margin: 0 auto; 
        }
        h1 { 
            font-weight: 600;
            color: var(--text-primary); 
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--azure-blue);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .card { 
            background: var(--card-bg); 
            padding: 1.5rem; 
            border: 1px solid var(--border);
            border-radius: 0;
            box-shadow: 0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108);
            text-align: center;
        }
        .card h3 {
            margin: 0 0 0.5rem 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
        }
        .card .value {
            font-size: 2rem;
            font-weight: 600;
            color: var(--azure-blue);
        }
        .value.error { color: var(--danger); }
        .value.success { color: var(--success); }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card-bg);
            box-shadow: 0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108);
            margin-bottom: 2rem;
        }
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        th {
            background-color: #faf9f8;
            font-weight: 600;
            color: var(--text-secondary);
        }
    </style>
</head>
<body>
    <h1>Reporte de Pruebas de Estrés (Artillery)</h1>
    
    <div class="grid">
        <div class="card">
            <h3>Usuarios Simulados</h3>
            <div class="value">${vusersCreated}</div>
        </div>
        <div class="card">
            <h3>Usuarios Completados</h3>
            <div class="value success">${vusersCompleted}</div>
        </div>
        <div class="card">
            <h3>Usuarios Fallidos</h3>
            <div class="value ${vusersFailed > 0 ? 'error' : 'success'}">${vusersFailed}</div>
        </div>
        <div class="card">
            <h3>Total Errores Red</h3>
            <div class="value ${totalErrors > 0 ? 'error' : 'success'}">${totalErrors}</div>
        </div>
    </div>

    <h2>Tiempos de Respuesta de Sesión (ms)</h2>
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

    ${errors.length > 0 ? `
    <h2>Desglose de Errores</h2>
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
                <td style="color: var(--danger);">${e.type}</td>
                <td>${e.count}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}
</body>
</html>`;

    fs.writeFileSync(path.resolve(outputFile), html, 'utf8');
    console.log('Reporte HTML generado correctamente en ' + outputFile);

} catch (error) {
    console.error('Error al generar el reporte HTML:', error);
    process.exit(1);
}
