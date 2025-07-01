# TASK: SlideForge v1.2 - Exportación PPTX y Empaquetado macOS

## Objetivo: Implementar exportación PPTX, wizard de presentación rápida, empaquetado DMG universal firmado/notarizado, testing completo y CI/CD

## STEPs:

[✅] STEP 1: Implementar exportación PPTX con PptxGenJS y servicio de plantillas → System STEP
  - ✅ Añadir dependencia pptxgenjs al package.json
  - ✅ Crear servicio src/services/export.js con lógica de exportación
  - ✅ Implementar plantillas (corporativo, académico, minimalista) 
  - ✅ Integrar funcionalidad en la UI existente
  - ✅ Verificar generación de archivos PPTX válidos

[✅] STEP 2: Desarrollar wizard de "Presentación rápida" de 3 pasos → System STEP
  - ✅ Crear componente QuickWizard con navegación por pasos
  - ✅ Paso 1: Importar/procesar texto (Markdown, Word, texto plano)
  - ✅ Paso 2: Selección de plantilla con preview
  - ✅ Paso 3: Generación y descarga automática
  - ✅ Optimizar performance para documentos de 2000 palabras en ≤30s

[✅] STEP 3: Configurar empaquetado DMG universal con firma y notarización → System STEP
  - ✅ Actualizar electron-builder para soporte universal (Intel/Apple Silicon)
  - ✅ Configurar firma con Developer ID Application: Raul Flores
  - ✅ Implementar notarización automática con scripts
  - ✅ Crear script npm run dist:mac optimizado
  - ✅ Configurar compatibilidad con Gatekeeper

[✅] STEP 4: Implementar suite de testing completa → System STEP
  - ✅ Configurar Jest + React Testing Library
  - ✅ Crear tests unitarios para servicios y componentes principales
  - ✅ Implementar tests de integración para flujo de exportación
  - ✅ Configurar Playwright para tests e2e del wizard
  - ✅ Configurar umbrales de cobertura ≥80%

[✅] STEP 5: Configurar CI/CD con GitHub Actions → System STEP
  - ✅ Pipeline completo de lint, test, build
  - ✅ Automatización de notarización en CI
  - ✅ Despliegue automático de releases multi-plataforma
  - ✅ Integración con testing automatizado y análisis de calidad

[✅] STEP 6: Generar documentación completa → Documentation STEP
  - ✅ Actualizar README con nuevas funcionalidades
  - ✅ Crear manual de usuario completo (8 páginas) con md-to-pdf
  - ✅ Documentar APIs de exportación y configuración
  - ✅ Guía de contribución y desarrollo incluida

## Deliverable: Aplicación SlideForge v1.2 completamente funcional con exportación PPTX, wizard, empaquetado macOS profesional, testing completo y documentación
