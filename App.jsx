import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Download, FileText, Palette, Clock, BookOpen, Plus, Zap, ChevronRight, Circle, Triangle, Square, Brain, RefreshCw, FileUp, Wand2, Type, BarChart3, Target, Trash2, Settings, Save, Eye, AlertCircle, FileDown } from 'lucide-react';
import * as mammoth from 'mammoth';
import { exportAsPptx, getAvailableTemplates } from './src/services/export.js';
import QuickWizard from './src/components/QuickWizard.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import './App.css';

const PowerPointGenerator = () => {
  const [textContent, setTextContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('academico');
  const [generatedSlides, setGeneratedSlides] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fragments, setFragments] = useState({});
  const [history, setHistory] = useState([]);
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [newFragment, setNewFragment] = useState({ category: '', name: '', content: '' });
  const [activeTab, setActiveTab] = useState('create');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [analyzingTemplate, setAnalyzingTemplate] = useState(false);
  const [extractedTemplate, setExtractedTemplate] = useState(null);
  const [customThemes, setCustomThemes] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [customTheme, setCustomTheme] = useState({
    name: '',
    titleColor: '#8B1538',
    contentColor: '#2D2D2D',
    fontFamily: 'Calibri',
    titleSize: '36px',
    subtitleSize: '24px',
    contentSize: '18px',
    bulletSize: '16px'
  });

  // Configuración de temas
  const themes = {
    academico: {
      name: 'Académico',
      titleSize: '36px',
      subtitleSize: '24px',
      contentSize: '18px',
      bulletSize: '16px',
      titleColor: '#8B1538',
      contentColor: '#2D2D2D',
      backgroundColor: '#FFFFFF',
      accentColor: '#C41E3A'
    },
    corporativo: {
      name: 'Corporativo',
      titleSize: '32px',
      subtitleSize: '22px',
      contentSize: '16px',
      bulletSize: '14px',
      titleColor: '#8B1538',
      contentColor: '#4A4A4A',
      backgroundColor: '#FFFFFF',
      accentColor: '#A01729'
    },
    conferencia: {
      name: 'Conferencia',
      titleSize: '40px',
      subtitleSize: '26px',
      contentSize: '20px',
      bulletSize: '18px',
      titleColor: '#8B1538',
      contentColor: '#2D2D2D',
      backgroundColor: '#FFFFFF',
      accentColor: '#C41E3A'
    },
    tesis: {
      name: 'Tesis/Defensa',
      titleSize: '34px',
      subtitleSize: '24px',
      contentSize: '18px',
      bulletSize: '16px',
      titleColor: '#8B1538',
      contentColor: '#2D2D2D',
      backgroundColor: '#FFFFFF',
      accentColor: '#A01729'
    },
    minimal: {
      name: 'Minimalista',
      titleSize: '28px',
      subtitleSize: '20px',
      contentSize: '16px',
      bulletSize: '14px',
      titleColor: '#2D2D2D',
      contentColor: '#6B6B6B',
      backgroundColor: '#FFFFFF',
      accentColor: '#8B1538'
    }
  };

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedFragments = localStorage.getItem('ppt_fragments');
    const savedHistory = localStorage.getItem('ppt_history');
    const savedApiKey = localStorage.getItem('openai_api_key');
    
    if (savedFragments) {
      setFragments(JSON.parse(savedFragments));
    } else {
      const defaultFragments = {
        introducciones: {
          investigacion: "Esta investigación tiene como objetivo principal analizar y evaluar los aspectos fundamentales de...",
          proyecto: "El presente proyecto busca desarrollar una solución integral que permita...",
          presentacion: "En esta presentación abordaremos los aspectos clave de..."
        },
        metodologias: {
          cualitativa: "La metodología empleada se basa en un enfoque cualitativo que incluye...",
          cuantitativa: "Se utilizó un diseño cuantitativo descriptivo con las siguientes características...",
          mixta: "Se implementó una metodología mixta que combina elementos cuantitativos y cualitativos..."
        },
        conclusiones: {
          general: "En conclusión, los resultados obtenidos demuestran que...",
          investigacion: "Los hallazgos de esta investigación confirman la hipótesis planteada...",
          proyecto: "La implementación exitosa de este proyecto permite concluir que..."
        }
      };
      setFragments(defaultFragments);
      localStorage.setItem('ppt_fragments', JSON.stringify(defaultFragments));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Cargar temas personalizados
    const savedCustomThemes = localStorage.getItem('custom_themes');
    if (savedCustomThemes) {
      setCustomThemes(JSON.parse(savedCustomThemes));
    }
  }, []);

  // Funciones de procesamiento de archivos
  const handleFileUpload = async (files) => {
    setIsProcessingFile(true);
    const fileArray = Array.from(files);
    
    try {
      for (const file of fileArray) {
        await processFile(file);
      }
    } catch (error) {
      console.error('Error procesando archivos:', error);
      alert('Error al procesar archivos. Por favor, intente nuevamente.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const processFile = async (file) => {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    let extractedText = '';

    try {
      switch (fileExtension) {
        case 'txt':
        case 'md':
          extractedText = await file.text();
          break;
          
        case 'docx':
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
          break;
          
        case 'pdf':
          alert('Procesamiento de PDF será implementado en la próxima versión. Por favor use archivos Word o texto plano.');
          return;
          
        default:
          alert(`Tipo de archivo ${fileExtension} no soportado actualmente.`);
          return;
      }

      // Limpiar y formatear texto
      const cleanedText = cleanExtractedText(extractedText);
      
      // Agregar al contenido existente
      const newContent = textContent ? textContent + '\n\n' + cleanedText : cleanedText;
      setTextContent(newContent);
      
      // Actualizar lista de archivos procesados
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: fileExtension,
        processed: true
      }]);

    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error);
      alert(`Error al procesar ${file.name}`);
    }
  };

  const cleanExtractedText = (text) => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim();
  };

  // Integración con OpenAI mejorada
  const improveContentWithOpenAI = async (improvementType) => {
    if (!textContent.trim()) {
      alert('Por favor, ingrese contenido antes de usar el asistente IA.');
      return;
    }

    if (!apiKey) {
      setShowApiKeyInput(true);
      alert('Por favor, configure su API key de OpenAI primero.');
      return;
    }

    setAiProcessing(true);
    
    try {
      const prompts = {
        summarize: `Resumir el siguiente texto académico manteniendo los puntos clave y la estructura principal. El texto debe quedar más conciso pero conservar toda la información importante:

${textContent}

Responde únicamente con el texto resumido, sin comentarios adicionales.`,

        improve: `Mejorar la redacción del siguiente texto haciéndolo más claro, profesional y bien estructurado para una presentación académica. Mantén el contenido original pero mejora la claridad y fluidez:

${textContent}

Responde únicamente con el texto mejorado, sin comentarios adicionales.`,

        academic: `Ajustar el siguiente texto a un tono académico formal, usando terminología apropiada y estructura profesional para una presentación universitaria:

${textContent}

Responde únicamente con el texto ajustado, sin comentarios adicionales.`,

        structure: `Analizar el siguiente contenido y sugerir una mejor organización en diapositivas. Proponer títulos de diapositivas y reorganización del contenido:

${textContent}

Responde con el contenido reorganizado listo para convertir en diapositivas, incluyendo títulos sugeridos y mejor estructura.`
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompts[improvementType] }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Error de OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const improvedText = data.choices[0].message.content;
      
      // Aplicar la mejora al contenido
      setTextContent(improvedText);
      
      // Mostrar sugerencias
      setAiSuggestions({
        type: improvementType,
        original: textContent.substring(0, 200) + '...',
        improved: improvedText.substring(0, 200) + '...',
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('Error con OpenAI:', error);
      alert('Error al procesar con IA. Verifique su API key y conexión.');
    } finally {
      setAiProcessing(false);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setShowApiKeyInput(false);
      alert('API Key guardada exitosamente');
    }
  };

  // Funciones originales de parsing mejoradas
  const identifyLineType = (line) => {
    const titleIndicators = ['introducción', 'conclusión', 'metodología', 'resultados', 
                           'objetivos', 'antecedentes', 'discusión', 'referencias',
                           'agenda', 'overview', 'resumen', 'summary'];
    
    if (line.length < 100 && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•')) {
      if (titleIndicators.some(indicator => line.toLowerCase().includes(indicator)) || 
          line.toUpperCase() === line || 
          line.split(' ').length <= 6) {
        return 'title';
      }
    }
    
    if (/^\d+\.\d+\s+/.test(line) || /^[IVX]+\.\s+/.test(line)) {
      return 'subtitle';
    }
    
    if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      return 'bullet';
    }
    
    return 'content';
  };

  const cleanBulletText = (line) => {
    return line.replace(/^[-*•]\s+|^\d+\.\s+/, '');
  };

  const parseTextContent = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const slides = [];
    let currentSlide = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const lineType = identifyLineType(trimmedLine);
      
      if (lineType === 'title' || currentSlide === null) {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = {
          title: lineType === 'title' ? trimmedLine : 'Contenido',
          subtitle: '',
          bullets: [],
          content: []
        };
        if (lineType !== 'title') {
          if (lineType === 'bullet') {
            currentSlide.bullets.push(cleanBulletText(trimmedLine));
          } else {
            currentSlide.content.push(trimmedLine);
          }
        }
      } else if (lineType === 'subtitle') {
        currentSlide.subtitle = trimmedLine;
      } else if (lineType === 'bullet') {
        currentSlide.bullets.push(cleanBulletText(trimmedLine));
      } else {
        currentSlide.content.push(trimmedLine);
      }
    }
    
    if (currentSlide) {
      slides.push(currentSlide);
    }
    
    return slides;
  };

  const generatePresentation = async () => {
    if (!textContent.trim()) {
      alert('Por favor, ingrese el contenido de la presentación.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const slides = parseTextContent(textContent);
      setGeneratedSlides(slides);
      
      const newHistoryItem = {
        id: Date.now(),
        title: slides[0]?.title || 'Presentación sin título',
        theme: selectedTheme,
        date: new Date().toISOString(),
        slidesCount: slides.length,
        preview: textContent.substring(0, 100) + '...'
      };
      
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('ppt_history', JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error('Error generando presentación:', error);
      alert('Error al generar la presentación. Por favor, revise el formato del texto.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertFragment = (content) => {
    const newText = textContent ? textContent + '\n\n' + content + '\n\n' : content + '\n\n';
    setTextContent(newText);
  };

  const downloadAsText = () => {
    if (generatedSlides.length === 0) {
      alert('Primero genere una presentación para descargar.');
      return;
    }

    let content = `PRESENTACIÓN POWERPOINT - TEMA: ${themes[selectedTheme].name}\n`;
    content += `Generado el: ${new Date().toLocaleDateString()}\n`;
    content += '='.repeat(60) + '\n\n';

    generatedSlides.forEach((slide, index) => {
      content += `DIAPOSITIVA ${index + 1}\n`;
      content += '-'.repeat(20) + '\n';
      content += `TÍTULO: ${slide.title}\n`;
      
      if (slide.subtitle) {
        content += `SUBTÍTULO: ${slide.subtitle}\n`;
      }
      
      if (slide.bullets.length > 0) {
        content += 'VIÑETAS:\n';
        slide.bullets.forEach(bullet => {
          content += `• ${bullet}\n`;
        });
      }
      
      if (slide.content.length > 0) {
        content += 'CONTENIDO:\n';
        slide.content.forEach(text => {
          content += `${text}\n`;
        });
      }
      
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentacion_${selectedTheme}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [showQuickWizard, setShowQuickWizard] = useState(false);

  const exportToPptx = async () => {
    if (generatedSlides.length === 0) {
      alert('Primero genere una presentación para exportar a PPTX.');
      return;
    }

    setIsExportingPptx(true);
    
    try {
      // Mapear el tema seleccionado al nombre del template
      const templateName = selectedTheme;
      
      await exportAsPptx(generatedSlides, templateName);
      alert('¡Archivo PPTX generado exitosamente!');
    } catch (error) {
      console.error('Error exportando a PPTX:', error);
      alert(`Error al generar archivo PPTX: ${error.message}`);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const currentTheme = themes[selectedTheme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header moderno */}
      <header className="bg-gradient-to-r from-red-800 via-red-900 to-red-800 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <FileText size={28} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles size={10} className="text-red-800" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">SlideForge</h1>
                <p className="text-red-100 text-sm">Generador Inteligente de Presentaciones</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                OpenAI Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Crear</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload size={16} />
              <span>Subir</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain size={16} />
              <span>IA</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center space-x-2">
              <Palette size={16} />
              <span>Temas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Crear */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Alertas de AI */}
                {aiSuggestions && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>IA aplicó mejoras: {aiSuggestions.type} a las {aiSuggestions.timestamp}</span>
                        <Button variant="ghost" size="sm" onClick={() => setAiSuggestions(null)}>
                          ×
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Card de entrada de texto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Contenido de tu Presentación</span>
                    </CardTitle>
                    <CardDescription>
                      Escribe, pega o sube tu contenido para generar diapositivas automáticamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Formato Inteligente:</strong> Títulos en líneas cortas, viñetas con -, *, • o números. 
                        Usa el asistente IA para mejorar automáticamente.
                      </AlertDescription>
                    </Alert>

                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Ejemplo:

Introducción al Proyecto de Investigación

1. Objetivos Principales
- Desarrollar una metodología eficiente
- Implementar mejores prácticas
- Evaluar resultados obtenidos

Este proyecto busca establecer un marco de trabajo que permita optimizar los procesos actuales..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTextContent(prev => prev + '\n\nNueva Diapositiva\n\n')}
                      >
                        + Slide
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTextContent(prev => prev + '\n- ')}
                      >
                        + Viñeta
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de generación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={generatePresentation}
                    disabled={isGenerating || !textContent.trim()}
                    className="h-16 text-lg bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-800"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generar Presentación
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowQuickWizard(true)}
                    className="h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Presentación Rápida
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {generatedSlides.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={downloadAsText}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar TXT
                    </Button>
                    <Button
                      onClick={exportToPptx}
                      disabled={isExportingPptx}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isExportingPptx ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generando PPTX...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-4 w-4" />
                          Descargar PPTX
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Vista previa */}
                {generatedSlides.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5" />
                          <span>Vista Previa</span>
                        </div>
                        <Badge>{generatedSlides.length} diapositivas</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {generatedSlides.map((slide, index) => (
                          <Card key={index} className="bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline">Slide {index + 1}</Badge>
                                <Circle size={12} className="text-gray-400" />
                              </div>
                              
                              <h4
                                className="font-bold mb-3"
                                style={{
                                  fontSize: currentTheme.titleSize,
                                  color: currentTheme.titleColor
                                }}
                              >
                                {slide.title}
                              </h4>
                              
                              {slide.subtitle && (
                                <h5
                                  className="font-semibold mb-2"
                                  style={{
                                    fontSize: currentTheme.subtitleSize,
                                    color: currentTheme.contentColor
                                  }}
                                >
                                  {slide.subtitle}
                                </h5>
                              )}
                              
                              {slide.bullets.length > 0 && (
                                <ul className="space-y-1 mb-3">
                                  {slide.bullets.map((bullet, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start space-x-2"
                                      style={{
                                        fontSize: currentTheme.bulletSize,
                                        color: currentTheme.contentColor
                                      }}
                                    >
                                      <div className="w-1.5 h-1.5 bg-red-800 rounded-full mt-2 flex-shrink-0"></div>
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              {slide.content.length > 0 && (
                                <div className="space-y-2">
                                  {slide.content.map((text, i) => (
                                    <p
                                      key={i}
                                      style={{
                                        fontSize: currentTheme.contentSize,
                                        color: currentTheme.contentColor
                                      }}
                                      className="leading-relaxed"
                                    >
                                      {text}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selector de tema */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Tema Actual</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(themes).map(([key, theme]) => (
                        <Button
                          key={key}
                          variant={selectedTheme === key ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTheme(key)}
                        >
                          {theme.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Fragmentos rápidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Fragmentos Rápidos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(fragments).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-medium text-sm text-gray-600 mb-2 capitalize">
                            {category}
                          </h4>
                          <div className="space-y-1">
                            {Object.entries(items).map(([name, content]) => (
                              <Button
                                key={name}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => insertFragment(content)}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                {name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Subir archivos */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Subir Archivos</span>
                </CardTitle>
                <CardDescription>
                  Sube archivos Word (.docx), texto (.txt) o Markdown (.md) para extraer contenido automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Soporta: .txt, .md, .docx
                    </p>
                  </label>
                </div>

                {isProcessingFile && (
                  <div className="mt-4 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Procesando archivos...</span>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Archivos Procesados</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <Badge variant="secondary">{file.type}</Badge>
                          </div>
                          <Badge variant="default" className="bg-green-600">
                            Procesado
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Asistente IA */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Asistente IA OpenAI</span>
                </CardTitle>
                <CardDescription>
                  Mejora automáticamente tu contenido con inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!apiKey && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Necesitas configurar tu API Key de OpenAI para usar estas funciones.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="api-key">API Key de OpenAI:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {showApiKeyInput && (
                    <div className="flex space-x-2">
                      <Input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1"
                      />
                      <Button onClick={saveApiKey}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => improveContentWithOpenAI('improve')}
                    disabled={aiProcessing || !textContent.trim() || !apiKey}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Wand2 className="h-6 w-6 mb-2" />
                    <span>Mejorar Redacción</span>
                  </Button>

                  <Button
                    onClick={() => improveContentWithOpenAI('summarize')}
                    disabled={aiProcessing || !textContent.trim() || !apiKey}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Target className="h-6 w-6 mb-2" />
                    <span>Resumir Contenido</span>
                  </Button>

                  <Button
                    onClick={() => improveContentWithOpenAI('academic')}
                    disabled={aiProcessing || !textContent.trim() || !apiKey}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <Type className="h-6 w-6 mb-2" />
                    <span>Tono Académico</span>
                  </Button>

                  <Button
                    onClick={() => improveContentWithOpenAI('structure')}
                    disabled={aiProcessing || !textContent.trim() || !apiKey}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Reestructurar</span>
                  </Button>
                </div>

                {aiProcessing && (
                  <div className="flex items-center justify-center space-x-2 py-4">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Procesando con IA...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Temas */}
          <TabsContent value="themes" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temas Predefinidos</CardTitle>
                  <CardDescription>
                    Selecciona un tema profesional para tu presentación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(themes).map(([key, theme]) => (
                      <div
                        key={key}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTheme === key ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTheme(key)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{theme.name}</h4>
                            <p className="text-sm text-gray-500">
                              Título: {theme.titleSize} | Contenido: {theme.contentSize}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.titleColor }}
                            ></div>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.accentColor }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crear Tema Personalizado</CardTitle>
                  <CardDescription>
                    Diseña tu propio tema con colores y tipografías personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme-name">Nombre del Tema</Label>
                    <Input
                      id="theme-name"
                      value={customTheme.name}
                      onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mi Tema Personalizado"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title-color">Color del Título</Label>
                      <Input
                        id="title-color"
                        type="color"
                        value={customTheme.titleColor}
                        onChange={(e) => setCustomTheme(prev => ({ ...prev, titleColor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content-color">Color del Contenido</Label>
                      <Input
                        id="content-color"
                        type="color"
                        value={customTheme.contentColor}
                        onChange={(e) => setCustomTheme(prev => ({ ...prev, contentColor: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (!customTheme.name.trim()) {
                        alert('Por favor, proporcione un nombre para el tema.');
                        return;
                      }
                      
                      const themeKey = `custom_${Date.now()}`;
                      const newTheme = {
                        ...customTheme,
                        backgroundColor: '#FFFFFF',
                        accentColor: customTheme.titleColor,
                        source: 'custom'
                      };

                      const updatedThemes = {
                        ...customThemes,
                        [themeKey]: newTheme
                      };

                      setCustomThemes(updatedThemes);
                      localStorage.setItem('custom_themes', JSON.stringify(updatedThemes));
                      
                      // Agregar al objeto themes para uso inmediato
                      themes[themeKey] = {
                        name: newTheme.name,
                        titleSize: newTheme.titleSize,
                        subtitleSize: newTheme.subtitleSize,
                        contentSize: newTheme.contentSize,
                        bulletSize: newTheme.bulletSize,
                        titleColor: newTheme.titleColor,
                        contentColor: newTheme.contentColor,
                        backgroundColor: newTheme.backgroundColor,
                        accentColor: newTheme.accentColor
                      };
                      
                      setCustomTheme({
                        name: '',
                        titleColor: '#8B1538',
                        contentColor: '#2D2D2D',
                        fontFamily: 'Calibri',
                        titleSize: '36px',
                        subtitleSize: '24px',
                        contentSize: '18px',
                        bulletSize: '16px'
                      });
                      
                      alert(`Tema "${newTheme.name}" creado exitosamente!`);
                    }}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Tema
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Temas personalizados guardados */}
            {Object.keys(customThemes).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Temas Personalizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(customThemes).map(([key, theme]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{theme.name}</h4>
                          <div className="flex space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.titleColor }}
                            ></div>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.contentColor }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              themes[key] = {
                                name: theme.name,
                                titleSize: theme.titleSize,
                                subtitleSize: theme.subtitleSize,
                                contentSize: theme.contentSize,
                                bulletSize: theme.bulletSize,
                                titleColor: theme.titleColor,
                                contentColor: theme.contentColor,
                                backgroundColor: theme.backgroundColor || '#FFFFFF',
                                accentColor: theme.accentColor || theme.titleColor
                              };
                              setSelectedTheme(key);
                              alert(`Tema "${theme.name}" aplicado!`);
                            }}
                          >
                            Aplicar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres eliminar este tema?')) {
                                const updatedThemes = { ...customThemes };
                                delete updatedThemes[key];
                                
                                setCustomThemes(updatedThemes);
                                localStorage.setItem('custom_themes', JSON.stringify(updatedThemes));
                                
                                if (selectedTheme === key) {
                                  setSelectedTheme('academico');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* QuickWizard Modal */}
      {showQuickWizard && (
        <QuickWizard 
          onClose={() => setShowQuickWizard(false)}
          parseTextContent={parseTextContent}
        />
      )}
    </div>
  );
};

export default PowerPointGenerator;

