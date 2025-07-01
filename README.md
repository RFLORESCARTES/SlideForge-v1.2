# SlideForge v1.2 🚀

[![CI/CD Pipeline](https://github.com/RFLORESCARTES/SlideForge-v1.2/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RFLORESCARTES/SlideForge-v1.2/actions/workflows/ci-cd.yml)
[![Code Quality](https://github.com/RFLORESCARTES/SlideForge-v1.2/actions/workflows/code-quality.yml/badge.svg)](https://github.com/RFLORESCARTES/SlideForge-v1.2/actions/workflows/code-quality.yml)
[![codecov](https://codecov.io/gh/RFLORESCARTES/SlideForge-v1.2/branch/main/graph/badge.svg)](https://codecov.io/gh/RFLORESCARTES/SlideForge-v1.2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Generador inteligente de presentaciones PowerPoint con IA integrada y exportación PPTX nativa**

SlideForge es una aplicación moderna de escritorio que permite crear presentaciones profesionales de forma rápida y eficiente, con soporte completo para exportación PPTX y un wizard de presentación rápida que procesa documentos en menos de 30 segundos.

![SlideForge Interface](docs/images/slideforge-interface.png)

## ✨ Características Principales

### 🎯 Exportación PPTX Nativa
- **Exportación directa a formato PPTX** compatible con PowerPoint 2019+
- **Plantillas profesionales** predefinidas (Académico, Corporativo, Minimalista)
- **Plantillas personalizables** con colores, fuentes y estilos propios
- **Diseño automático** con distribución inteligente de contenido

### ⚡ Wizard de Presentación Rápida
- **Flujo de 3 pasos** para creación rápida de presentaciones
- **Procesamiento optimizado** para documentos de hasta 2000 palabras en ≤30s
- **Soporte multi-formato**: .docx, .txt, .md
- **Preview en tiempo real** de plantillas y contenido

### 🤖 Asistente IA Integrado
- **Mejora automática** de contenido con OpenAI GPT-4
- **Reestructuración inteligente** de información
- **Tono académico** y profesional automático
- **Resumen y síntesis** de contenido extenso

### 🎨 Sistema de Temas Avanzado
- **Temas predefinidos** optimizados para diferentes contextos
- **Editor de temas personalizado** con preview en vivo
- **Gestión de bibliotecas** de fragmentos reutilizables
- **Historial completo** de presentaciones generadas

### 🔧 Funcionalidades Técnicas
- **Aplicación universal** para macOS (Intel + Apple Silicon)
- **Firma digital y notarización** automática
- **Interface moderna** con React + Tailwind CSS
- **Testing completo** con >80% cobertura de código

## 🚀 Instalación Rápida

### Descarga Directa (Recomendado)
1. Descarga el archivo `.dmg` desde [Releases](https://github.com/RFLORESCARTES/SlideForge-v1.2/releases)
2. Monta el DMG y arrastra SlideForge a Aplicaciones
3. Abre SlideForge (sin advertencias de seguridad gracias a la notarización)

### Desde Código Fuente
```bash
# Clonar repositorio
git clone https://github.com/RFLORESCARTES/SlideForge-v1.2.git
cd SlideForge-v1.2

# Instalar dependencias
npm install --legacy-peer-deps

# Desarrollo
npm run dev

# Construir para producción
npm run dist:mac
```
Para construir sin firma de código durante el desarrollo local, ejecuta:
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run dist:mac
```

## 📋 Requisitos del Sistema

### macOS
- **Versión mínima**: macOS 10.14 (Mojave)
- **Arquitectura**: Universal (Intel + Apple Silicon)
- **Espacio**: 250 MB libres
- **RAM**: 4 GB recomendado

### Desarrollo
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Xcode Command Line Tools** (para compilación)

## 📖 Guía de Uso

### 🎯 Wizard de Presentación Rápida

#### Paso 1: Importar Contenido
```markdown
# Mi Presentación

## Introducción
Descripción del tema principal

## Desarrollo
- Punto clave 1
- Punto clave 2
- Punto clave 3

## Conclusión
Resumen de ideas principales
```

#### Paso 2: Seleccionar Plantilla
- **Académico**: Para universidades e investigación
- **Corporativo**: Para empresas y negocios
- **Minimalista**: Para diseños limpios y modernos

#### Paso 3: Generar y Descargar
- ⚡ Generación automática en <30s
- 📥 Descarga directa en formato PPTX
- ✅ Compatible con PowerPoint 2019+

### 🤖 Asistente IA

#### Configuración
1. Obtén tu API key de [OpenAI](https://platform.openai.com/api-keys)
2. Ve a la pestaña "IA" en SlideForge
3. Ingresa tu API key y guarda

#### Funciones Disponibles
- **Mejorar Redacción**: Claridad y fluidez profesional
- **Resumir Contenido**: Síntesis inteligente
- **Tono Académico**: Formalización automática
- **Reestructurar**: Organización lógica optimizada

### 🎨 Temas Personalizados

#### Crear Tema Personalizado
```javascript
// Configuración de ejemplo
{
  name: "Mi Tema Corporativo",
  titleColor: "#1a365d",
  contentColor: "#2d3748", 
  backgroundColor: "#ffffff",
  accentColor: "#3182ce",
  fontFamily: "Calibri"
}
```

## 🧪 Testing y Calidad

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Métricas de Calidad
- **Cobertura de código**: >80%
- **Tests unitarios**: Jest + React Testing Library
- **Tests E2E**: Playwright
- **Análisis estático**: ESLint + SonarCloud

## 🔧 Desarrollo

### Configuración del Entorno
```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Variables de entorno (opcional)
cp .env.example .env
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir aplicación web
npm run dist:mac     # Construir app macOS universal
npm run test         # Ejecutar tests
npm run lint         # Análisis de código
npm run preview      # Preview de producción
```

### Estructura del Proyecto
```
slideforge-v1.2/
├── src/
│   ├── components/          # Componentes React
│   │   ├── QuickWizard.jsx  # Wizard de presentación rápida
│   │   └── __tests__/       # Tests de componentes
│   ├── services/            # Servicios y lógica de negocio
│   │   ├── export.js        # Servicio de exportación PPTX
│   │   └── __tests__/       # Tests de servicios
│   └── test/                # Configuración de testing
├── e2e/                     # Tests end-to-end
├── scripts/                 # Scripts de construcción
├── build/                   # Archivos de construcción
└── .github/workflows/       # CI/CD workflows
```

## 🔒 Seguridad y Privacidad

### Certificación macOS
- **Firma digital** con Developer ID
- **Notarización** automática de Apple
- **Sin advertencias** de Gatekeeper

### Privacidad de Datos
- **Procesamiento local** de documentos
- **API de OpenAI** solo para funciones IA opcionales
- **Sin telemetría** ni recopilación de datos
- **Código abierto** para transparencia total

## 🚀 CI/CD y Deployment

### GitHub Actions
- ✅ **Lint y Tests** en cada push
- ✅ **Tests E2E** con Playwright
- ✅ **Construcción multi-plataforma**
- ✅ **Análisis de seguridad** automático
- ✅ **Notarización** de builds macOS

### Release Process
```bash
# Crear nueva versión
git tag v1.2.0
git push origin v1.2.0

# GitHub Actions automáticamente:
# 1. Ejecuta todos los tests
# 2. Construye para todas las plataformas
# 3. Firma y notariza (macOS)
# 4. Crea release con archivos
```

## 📊 Benchmarks de Rendimiento

### Tiempo de Procesamiento
| Tamaño del Documento | Tiempo Promedio | Máximo Aceptable |
|---------------------|-----------------|------------------|
| 500 palabras        | 2-5s           | 10s              |
| 1000 palabras       | 5-10s          | 15s              |
| 2000 palabras       | 10-25s         | 30s              |

### Métricas de Calidad
- **Tiempo de carga inicial**: <3s
- **Tiempo de generación PPTX**: <5s (para 10 slides)
- **Uso de memoria**: <200MB promedio
- **Tamaño de instalación**: ~150MB

## 🤝 Contribución

### Reportar Issues
1. Busca issues existentes primero
2. Usa las plantillas proporcionadas
3. Incluye información detallada del sistema
4. Proporciona pasos para reproducir

### Desarrollo
1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **ESLint** para calidad de código
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Tests requeridos** para nuevas funcionalidades

## 📋 Roadmap

### v1.3 (Próximamente)
- [ ] Exportación a Google Slides
- [ ] Plantillas de temas adicionales
- [ ] Colaboración en tiempo real
- [ ] Plugin para VS Code

### v1.4 (Futuro)
- [ ] Soporte para Windows y Linux
- [ ] API REST para integración
- [ ] Modo offline completo
- [ ] Integración con servicios de almacenamiento

## 📞 Soporte

### Documentación
- **Manual de Usuario**: [docs/user-manual.pdf](docs/user-manual.pdf)
- **API Documentation**: [docs/api/](docs/api/)
- **Development Guide**: [docs/development.md](docs/development.md)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/RFLORESCARTES/SlideForge-v1.2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RFLORESCARTES/SlideForge-v1.2/discussions)

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **OpenAI** por la API de GPT-4
- **PptxGenJS** por la biblioteca de generación PPTX
- **Electron** por el framework de aplicaciones
- **React** y **Tailwind CSS** por la interfaz moderna
- **Comunidad open source** por las herramientas y librerías

---

**Desarrollado con ❤️ por el equipo de SlideForge**

[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-1f425f.svg)](https://www.electronjs.org/)
[![Powered by OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-412991.svg)](https://openai.com/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb.svg)](https://reactjs.org/)
