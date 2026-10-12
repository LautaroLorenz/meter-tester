// Genera el release de un cliente: compila el proceso main, el renderer con la configuración del
// cliente (src/environments/client.<cliente>.ts) y empaqueta con electron-builder, con el nombre
// del cliente en el archivo generado.
// Uso: node scripts/release.js <cliente>   (o npm run electron:build:<cliente>)
const { spawnSync } = require('child_process');

const CLIENTS = {
    edet: 'EDET',
    chaco: 'Chaco',
    tandil: 'Tandil',
    edelap: 'EDELAP'
};

const client = process.argv[2];
if (!CLIENTS[client]) {
    console.error(`Cliente inválido: "${client ?? ''}". Usar uno de: ${Object.keys(CLIENTS).join(', ')}`);
    console.error('Ejemplo: npm run electron:build:edet');
    process.exit(1);
}
const label = CLIENTS[client];

// sin shell: los argumentos llegan tal cual en macOS, Linux y Windows (incluido el ${version})
function run(script, args) {
    const result = spawnSync(process.execPath, [require.resolve(script), ...args], { stdio: 'inherit' });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

run('typescript/bin/tsc', ['-p', 'tsconfig.serve.json']);
run('@angular/cli/bin/ng.js', ['build', '-c', `production-${client}`, '--base-href', './']);
run('electron-builder/cli.js', [
    'build',
    '--publish=never',
    `-c.artifactName=\${productName}-${label}-\${version}-\${arch}.\${ext}`,
    `-c.win.artifactName=OELEC - CE Soft - ${label} - \${version}.\${ext}`,
    `-c.linux.artifactName=OELEC - CE Soft - ${label} - \${version}.\${ext}`
]);
