# Nuvora: sitio de presentación

Sitio estático (HTML y CSS, sin JavaScript ni compilación) para publicar con **GitHub Pages**. Este repositorio es público y **no contiene el código de Nuvora**, solo la página de presentación.

## Estructura

```
index.html            página principal
terminos.html         términos y condiciones (generado)
privacidad.html       política de privacidad (generada)
404.html
assets/estilos.css    estilos (tema claro y oscuro según el sistema)
assets/img            capturas reales del producto (datos de demostración)
assets/fonts          Geist (SIL OFL)
assets/icons          Phosphor Icons (MIT)
herramientas/generar-legales.mjs
```

## Ver el sitio en local

```powershell
python -m http.server 8099
# abrir http://localhost:8099
```

## Actualizar los textos legales

`terminos.html` y `privacidad.html` se generan a partir de los textos de la aplicación:

```powershell
node herramientas/generar-legales.mjs
```

Por defecto **no muestran la cédula ni la dirección exacta** (solo el municipio), porque el sitio es público. Con `--con-cedula` y `--con-direccion` se publica el texto tal como está en la aplicación.

## Publicar

En GitHub: *Settings → Pages → Deploy from a branch → `main` / `(root)`*. La dirección queda en `https://<usuario>.github.io/nuvora/`. Si el nombre del repositorio o el dominio cambian, actualiza las direcciones absolutas de `index.html` (canonical, Open Graph, JSON-LD), `sitemap.xml`, `robots.txt`, las plantillas del generador y la ruta base de `404.html`.
