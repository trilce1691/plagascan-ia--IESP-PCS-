# PlagaScan IA – Ayacucho V2: instalación rápida para concurso

## Opción recomendada: PWA
1. Subir el contenido de esta carpeta a un hosting HTTPS.
2. Abrir la dirección en el celular.
3. En Chrome/Edge: menú → **Instalar aplicación** / **Agregar a pantalla de inicio**.
4. Permitir cámara.
5. Probar: seleccionar cultivo → Activar cámara → Capturar → Analizar.

## Presentación al jurado
- Mostrar primero la pantalla Escanear.
- Tomar una foto de una hoja afectada.
- Mostrar resultado y manejo MIP.
- Explicar que el prototipo ya tiene interfaz, cámara, historial y API preparada.
- Aclarar que el modo demostración no es un modelo de IA entrenado.

## Para convertirlo en IA real
La API debe recibir `image` y `crop` y devolver:
`name`, `scientific`, `confidence`, `why`, `natural`, `chemical`.

La versión competitiva debe entrenarse con fotografías etiquetadas de cultivos y daños de Ayacucho y validarse con imágenes que el modelo no haya visto.

## Seguridad
La aplicación no fija dosis ni marcas de plaguicidas. La recomendación química debe validarse con el registro vigente de SENASA y con la etiqueta del producto autorizado para cultivo y organismo objetivo.
