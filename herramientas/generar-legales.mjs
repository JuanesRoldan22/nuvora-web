// Genera terminos.html y privacidad.html a partir de los textos de la aplicacion (frontend/src/content/legal/*.ts).
//
// Uso:  node herramientas/generar-legales.mjs [--origen <carpeta con terminos.ts y privacidad.ts>] [--con-cedula] [--con-direccion]
//
// Las paginas son publicas en internet, asi que por defecto NO muestran el numero de cedula ni la direccion exacta
// (queda solo el municipio). La ley pide identificar al responsable con su domicilio, correo y telefono; la cedula no.
// Con --con-cedula / --con-direccion se publica el texto tal como esta en la aplicacion.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argumentos = process.argv.slice(2);
const valor = (nombre) => { const i = argumentos.indexOf(nombre); return i >= 0 ? argumentos[i + 1] : undefined; };
const origen = valor("--origen") ?? "D:/Proyecto/Nuvora/frontend/src/content/legal";
const conCedula = argumentos.includes("--con-cedula");
const conDireccion = argumentos.includes("--con-direccion");

const escapar = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function enLinea(texto) {
  return escapar(texto)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/([\w.+-]+@[\w-]+\.[\w.-]*\w)/g, '<a href="mailto:$1">$1</a>');
}

function aHtml(markdown) {
  const salida = [];
  let parrafo = [];
  let lista = null;
  const cerrarParrafo = () => { if (parrafo.length) salida.push(`<p>${enLinea(parrafo.join(" "))}</p>`); parrafo = []; };
  const cerrarLista = () => { if (lista) salida.push(`<ul>${lista.map((i) => `<li>${enLinea(i)}</li>`).join("")}</ul>`); lista = null; };
  for (const linea of markdown.split("\n")) {
    const t = linea.trim();
    if (t === "") { cerrarParrafo(); cerrarLista(); }
    else if (t.startsWith("## ")) { cerrarParrafo(); cerrarLista(); salida.push(`<h2>${enLinea(t.slice(3))}</h2>`); }
    else if (t.startsWith("# ")) { cerrarParrafo(); cerrarLista(); salida.push(`<h1>${enLinea(t.slice(2))}</h1>`); }
    else if (t.startsWith("- ")) { cerrarParrafo(); (lista ??= []).push(t.slice(2)); }
    else { cerrarLista(); parrafo.push(t); }
  }
  cerrarParrafo(); cerrarLista();
  return salida.join("\n");
}

function leerTexto(archivo, constante) {
  const fuente = readFileSync(join(origen, archivo), "utf8");
  const inicio = fuente.indexOf("`", fuente.indexOf(`export const ${constante} =`)) + 1;
  const fin = fuente.lastIndexOf("`;");
  if (inicio <= 0 || fin <= inicio) throw new Error(`No se pudo leer ${constante} en ${archivo}`);
  let texto = fuente.slice(inicio, fin);
  if (!conCedula) texto = texto.replace(/ identificado con cédula de ciudadanía No\. \d+,/g, "");
  if (!conDireccion) texto = texto.replace(/(domicilio en )Calle [^,]+, /g, "$1");
  return texto;
}

const plantilla = ({ titulo, descripcion, archivo, cuerpo, nota }) => `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo} | Nuvora</title>
  <meta name="description" content="${descripcion}">
  <link rel="canonical" href="https://juanesroldan22.github.io/nuvora-web/${archivo}">
  <meta name="theme-color" content="#f4f5f6" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0f1114" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/estilos.css">
</head>
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>
  <header class="nav">
    <div class="contenedor nav-interior">
      <a class="logo" href="./" aria-label="Nuvora, inicio"><span class="logo-marca" aria-hidden="true">N</span>Nuvora</a>
      <nav class="nav-enlaces" aria-label="Documentos legales">
        <a href="terminos.html">Términos</a>
        <a href="privacidad.html">Privacidad</a>
        <a class="boton boton-secundario boton-chico" href="./">Volver al inicio</a>
      </nav>
    </div>
  </header>
  <main id="contenido" class="contenedor legal">
${nota}
${cuerpo}
  </main>
  <footer class="pie">
    <div class="contenedor">
      <p class="pie-legal" style="margin-top:0;padding-top:0;border-top:0">© 2026 Juan Andres Roldan Rondon. Todos los derechos reservados. <a href="terminos.html">Términos</a> y <a href="privacidad.html">Política de privacidad</a>.</p>
    </div>
  </footer>
</body>
</html>
`;

writeFileSync(join(raiz, "terminos.html"), plantilla({
  titulo: "Términos y condiciones",
  descripcion: "Términos y condiciones de uso de Nuvora.",
  archivo: "terminos.html",
  cuerpo: aHtml(leerTexto("terminos.ts", "terminos")),
  nota: "",
}));
writeFileSync(join(raiz, "privacidad.html"), plantilla({
  titulo: "Política de privacidad",
  descripcion: "Política de privacidad y tratamiento de datos personales de Nuvora.",
  archivo: "privacidad.html",
  cuerpo: aHtml(leerTexto("privacidad.ts", "privacidad")),
  nota: "",
}));
console.log(`Generadas terminos.html y privacidad.html (cedula ${conCedula ? "visible" : "oculta"}, direccion ${conDireccion ? "visible" : "solo municipio"}).`);
