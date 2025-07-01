import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Download, FileText, Palette, Clock, BookOpen, Plus, Zap, ChevronRight, Circle, Triangle, Square, Brain, RefreshCw, FileUp, Wand2, Type, BarChart3, Target, Trash2 } from 'lucide-react';
import * as mammoth from 'mammoth';

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

  // Integración con OpenAI
  const improveContentWithOpenAI = async (improvementType) => {
    if (!textContent.trim()) {
      alert('Por favor, ingrese contenido antes de usar el asistente IA.');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      alert('API key de OpenAI no configurada. Revise su archivo .env');
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

  // Funciones para manejo de templates y temas personalizados
  const handleTemplateUpload = async (file) => {
    if (!file) return;
    
    setAnalyzingTemplate(true);
    
    try {
      // Simular análisis de template
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const templateInfo = {
        name: file.name.replace('.pptx', '').replace(/[^a-zA-Z0-9]/g, ' '),
        colors: [
          '#8B1538',
          '#2D2D2D', 
          '#C41E3A',
          '#F5F5F5',
          '#666666'
        ],
        font: 'Calibri',
        originalFile: file.name
      };
      
      setExtractedTemplate(templateInfo);
      
    } catch (error) {
      console.error('Error analizando template:', error);
      alert('Error al analizar el template. Por favor, intente con otro archivo.');
    } finally {
      setAnalyzingTemplate(false);
    }
  };

  const saveExtractedTheme = () => {
    if (!extractedTemplate || !extractedTemplate.name.trim()) {
      alert('Por favor, proporcione un nombre para el tema.');
      return;
    }

    const newTheme = {
      name: extractedTemplate.name,
      titleSize: '36px',
      subtitleSize: '24px', 
      contentSize: '18px',
      bulletSize: '16px',
      titleColor: extractedTemplate.colors[0],
      contentColor: extractedTemplate.colors[1],
      accentColor: extractedTemplate.colors[2],
      backgroundColor: extractedTemplate.colors[3] || '#FFFFFF',
      fontFamily: extractedTemplate.font,
      source: 'template',
      originalFile: extractedTemplate.originalFile
    };

    const themeKey = `template_${Date.now()}`;
    const updatedThemes = {
      ...customThemes,
      [themeKey]: newTheme
    };

    setCustomThemes(updatedThemes);
    localStorage.setItem('custom_themes', JSON.stringify(updatedThemes));
    
    setExtractedTemplate(null);
    alert(`Tema "${newTheme.name}" guardado exitosamente!`);
  };

  const saveCustomTheme = () => {
    if (!customTheme.name.trim()) {
      alert('Por favor, proporcione un nombre para el tema.');
      return;
    }

    const themeKey = `custom_${Date.now()}`;
    const newTheme = {
      ...customTheme,
      source: 'custom'
    };

    const updatedThemes = {
      ...customThemes,
      [themeKey]: newTheme
    };

    setCustomThemes(updatedThemes);
    localStorage.setItem('custom_themes', JSON.stringify(updatedThemes));
    
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
  };

  const applyCustomTheme = (themeKey) => {
    const theme = customThemes[themeKey];
    if (!theme) return;

    const compatibleTheme = {
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

    themes[themeKey] = compatibleTheme;
    setSelectedTheme(themeKey);
    
    alert(`Tema "${theme.name}" aplicado!`);
  };

  const deleteCustomTheme = (themeKey) => {
    if (confirm('¿Estás seguro de que quieres eliminar este tema?')) {
      const updatedThemes = { ...customThemes };
      delete updatedThemes[themeKey];
      
      setCustomThemes(updatedThemes);
      localStorage.setItem('custom_themes', JSON.stringify(updatedThemes));
      
      if (selectedTheme === themeKey) {
        setSelectedTheme('academico');
      }
    }
  };

  // Funciones originales de parsing
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
    const textarea = document.getElementById('textContent');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textContent.substring(0, start) + '\n\n' + content + '\n\n' + textContent.substring(end);
      setTextContent(newText);
    }
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

  const currentTheme = themes[selectedTheme];

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-32 w-96 h-96 bg-gradient-to-br from-red-800/5 to-red-900/10 rounded-full transform rotate-12"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-gray-600/5 to-gray-800/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-800/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-600/15 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-gray-800/20 rounded-full"></div>
      </div>

      {/* Header revolucionario */}
      <header className="relative z-10">
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-red-800 text-white">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <FileText size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-red-800" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-light tracking-wide">PowerPoint</h1>
                  <p className="text-red-100 text-lg font-light">Generator Studio AI</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <div className="text-right">
                  <div className="text-2xl font-light">OpenAI-Powered</div>
                  <div className="text-red-200 text-sm">Presentaciones Profesionales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Onda decorativa */}
        <div className="h-12 bg-gradient-to-r from-red-800 via-red-900 to-red-800">
          <svg className="w-full h-full" viewBox="0 0 1200 48" fill="none">
            <path d="M0,20 C300,40 600,0 1200,20 L1200,48 L0,48 Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </header>

      {/* Navegación de tabs moderna */}
      <div className="max-w-7xl mx-auto px-8 -mt-6 relative z-10">
        <div className="flex space-x-1 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
          {[
            { id: 'create', label: 'Crear', icon: FileText },
            { id: 'upload', label: 'Subir Archivos', icon: Upload },
            { id: 'ai', label: 'Asistente IA', icon: Brain },
            { id: 'themes', label: 'Temas', icon: Palette }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl transition-all duration-300 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Tab: Crear */}
        {activeTab === 'create' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              
              {/* Alertas de AI */}
              {aiSuggestions && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        IA aplicó mejoras: {aiSuggestions.type === 'improve' ? 'Redacción' : 
                          aiSuggestions.type === 'summarize' ? 'Resumen' : 
                          aiSuggestions.type === 'academic' ? 'Tono Académico' : 'Estructura'}
                      </h4>
                      <p className="text-sm text-blue-700 mb-2">
                        Procesado a las {aiSuggestions.timestamp}
                      </p>
                      <button
                        onClick={() => setAiSuggestions(null)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card de entrada de texto */}
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-800 to-red-900 rounded-2xl flex items-center justify-center">
                          <FileText size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">Contenido de tu Presentación</h3>
                          <p className="text-gray-600">Escribe, pega o sube tu contenido</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Formato Inteligente + IA</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Títulos:</strong> Líneas cortas para títulos de diapositiva</div>
                            <div><strong>Subtítulos:</strong> Líneas numeradas (ej: "1. Introducción")</div>
                            <div><strong>Viñetas:</strong> Líneas que empiecen con -, *, • o números</div>
                            <div><strong>IA:</strong> Usa el asistente OpenAI para mejorar automáticamente</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        id="textContent"
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Ejemplo:

Introducción al Proyecto de Investigación

1. Objetivos Principales
- Desarrollar una metodología eficiente
- Implementar mejores prácticas
- Evaluar resultados obtenidos

Este proyecto busca establecer un marco de trabajo que permita optimizar los procesos actuales..."
                        className="w-full h-96 p-6 border-2 border-gray-200 rounded-2xl font-mono text-sm resize-none focus:border-red-500 focus:outline-none transition-all duration-300 bg-gradient-to-br from-gray-50 to-white"
                      />
                      
                      <div className="absolute bottom-6 right-6 flex space-x-2">
                        <button
                          onClick={() => setTextContent(prev => prev + '\n\nNueva Diapositiva\n\n')}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-all duration-200 shadow-sm"
                        >
                          + Slide
                        </button>
                        <button
                          onClick={() => setTextContent(prev => prev + '\n- ')}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-all duration-200 shadow-sm"
                        >
                          + Viñeta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de generación */}
              <div className="relative">
                <button
                  onClick={generatePresentation}
                  disabled={isGenerating || !textContent.trim()}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-red-800 via-red-900 to-red-800 hover:from-red-900 hover:via-red-800 hover:to-red-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-8 px-8 rounded-3xl transition-all duration-500 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-2xl border border-red-700"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-4">
                    {isGenerating ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-2xl">Generando Presentación...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={32} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-2xl">Generar Presentación PowerPoint</span>
                        <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>

                {generatedSlides.length > 0 && (
                  <button
                    onClick={downloadAsText}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
                  >
                    <Download size={24} />
                    <span>Descargar como Archivo</span>
                  </button>
                )}
              </div>

              {/* Vista previa */}
              {generatedSlides.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                          <FileText size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">Vista Previa</h3>
                          <p className="text-gray-600">{generatedSlides.length} diapositivas generadas</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-medium">
                        {themes[selectedTheme].name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {generatedSlides.map((slide, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                          style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-medium">
                              Slide {index + 1}
                            </div>
                            <Circle size={16} className="text-gray-400" />
                          </div>
                          
                          <h4
                            className="font-bold mb-4"
                            style={{
                              fontSize: currentTheme.titleSize,
                              color: currentTheme.titleColor
                            }}
                          >
                            {slide.title}
                          </h4>
                          
                          {slide.subtitle && (
                            <h5
                              className="font-semibold mb-3"
                              style={{
                                fontSize: currentTheme.subtitleSize,
                                color: currentTheme.contentColor
                              }}
                            >
                              {slide.subtitle}
                            </h5>
                          )}
                          
                          {slide.bullets.length > 0 && (
                            <ul className="space-y-2 mb-4">
                              {slide.bullets.map((bullet, i) => (
                                <li
                                  key={i}
                                  className="flex items-start space-x-3"
                                  style={{
                                    fontSize: currentTheme.bulletSize,
                                    color: currentTheme.contentColor
                                  }}
                                >
                                  <div className="w-2 h-2 bg-red-800 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {slide.content.length > 0 && (
                            <div className="space-y-3">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Selector de temas */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Palette size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Temas</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  {Object.entries(themes).map(([key, theme]) => (
                    <label key={key} className="group block cursor-pointer">
                      <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selectedTheme === key
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="theme"
                            value={key}
                            checked={selectedTheme === key}
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{theme.name}</div>
                            <div className="text-sm text-gray-500">Título: {theme.titleSize}</div>
                          </div>
                          <div 
                            className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                            style={{ backgroundColor: theme.titleColor }}
                          ></div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Biblioteca de fragmentos */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Biblioteca</h3>
                    </div>
                    <button className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Plus size={16} className="text-green-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                  {Object.entries(fragments).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-gray-700 mb-3 capitalize text-sm tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(items).map(([name, content]) => (
                          <div
                            key={name}
                            onClick={() => insertFragment(content)}
                            className="group p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-100"
                          >
                            <div className="font-medium text-sm text-gray-800 capitalize mb-1">{name}</div>
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {content.substring(0, 60)}...
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ChevronRight size={14} className="text-green-600 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Subir Archivos */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Subir Archivos</h3>
                    <p className="text-gray-600">Sube documentos Word, PDF, TXT para extraer contenido</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div 
                  className="border-3 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileUp size={40} className="text-white" />
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    Arrastra archivos aquí o haz click para seleccionar
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <FileText size={24} className="text-red-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-red-800">PDF</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <FileText size={24} className="text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-800">Word</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <FileText size={24} className="text-gray-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-800">TXT</div>
                    </div>
                  </div>

                  <p className="text-gray-500">
                    Formatos soportados: PDF, DOCX, TXT, MD
                  </p>

                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                {isProcessingFile && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Procesando archivos...</h4>
                        <p className="text-blue-600 text-sm">Extrayendo texto y limpiando contenido</p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Archivos Procesados</h4>
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{file.name}</div>
                              <div className="text-sm text-gray-600">
                                {(file.size / 1024).toFixed(1)} KB • {file.type.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                            ✓ Procesado
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Ir a Crear Presentación
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Asistente IA */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Brain size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Asistente OpenAI</h3>
                    <p className="text-gray-600">Mejora automáticamente tu contenido con GPT-4</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                
                {!textContent.trim() && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Brain size={40} className="text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">
                      Necesitas contenido para usar IA
                    </h4>
                    <p className="text-gray-600 mb-8">
                      Primero agrega contenido en la pestaña "Crear" o "Subir Archivos"
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      Ir a Crear Contenido
                    </button>
                  </div>
                )}

                {textContent.trim() && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Wand2 size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Mejorar Redacción</h4>
                            <p className="text-sm text-gray-600">Hacer más claro y profesional</p>
                          </div>
                        </div>
                        <button
                          onClick={() => improveContentWithOpenAI('improve')}
                          disabled={aiProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300"
                        >
                          {aiProcessing ? 'Procesando...' : 'Mejorar Texto'}
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Target size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Resumir Contenido</h4>
                            <p className="text-sm text-gray-600">Condensar manteniendo lo esencial</p>
                          </div>
                        </div>
                        <button
                          onClick={() => improveContentWithOpenAI('summarize')}
                          disabled={aiProcessing}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300"
                        >
                          {aiProcessing ? 'Procesando...' : 'Resumir'}
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Type size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Tono Académico</h4>
                            <p className="text-sm text-gray-600">Ajustar a formato formal</p>
                          </div>
                        </div>
                        <button
                          onClick={() => improveContentWithOpenAI('academic')}
                          disabled={aiProcessing}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300"
                        >
                          {aiProcessing ? 'Procesando...' : 'Ajustar Tono'}
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <BarChart3 size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Reorganizar Estructura</h4>
                            <p className="text-sm text-gray-600">Optimizar orden y flujo</p>
                          </div>
                        </div>
                        <button
                          onClick={() => improveContentWithOpenAI('structure')}
                          disabled={aiProcessing}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300"
                        >
                          {aiProcessing ? 'Procesando...' : 'Reorganizar'}
                        </button>
                      </div>
                    </div>

                    {aiProcessing && (
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                          <div>
                            <h4 className="font-semibold text-purple-800">OpenAI está procesando...</h4>
                            <p className="text-purple-600 text-sm">Analizando y mejorando tu contenido con GPT-4</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Vista Previa del Contenido</h4>
                      <div className="bg-white rounded-xl p-4 max-h-60 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                          {textContent.substring(0, 1000)}{textContent.length > 1000 ? '...' : ''}
                        </pre>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        {textContent.length} caracteres • {textContent.split('\n').filter(line => line.trim()).length} líneas
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Temas */}
        {activeTab === 'themes' && (
          <div className="space-y-8">
            
            {/* Clonador de Templates */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Clonar Template PowerPoint</h3>
                    <p className="text-gray-600">Extrae el estilo de una presentación existente</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  
                  <div>
                    <div 
                      className="border-3 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer"
                      onClick={() => document.getElementById('templateInput').click()}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileUp size={32} className="text-white" />
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Subir Template PowerPoint
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        Sube un archivo .pptx para extraer su diseño
                      </p>

                      <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium inline-block">
                        .PPTX únicamente
                      </div>

                      <input
                        id="templateInput"
                        type="file"
                        accept=".pptx"
                        onChange={(e) => handleTemplateUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </div>

                    {analyzingTemplate && (
                      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-2xl p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                          <div>
                            <h4 className="font-semibold text-purple-800">Analizando template...</h4>
                            <p className="text-purple-600 text-sm">Extrayendo colores, fuentes y diseño</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {extractedTemplate ? (
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4">Template Extraído</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del tema</label>
                            <input
                              type="text"
                              value={extractedTemplate.name}
                              onChange={(e) => setExtractedTemplate(prev => ({...prev, name: e.target.value}))}
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              placeholder="Mi tema corporativo"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Colores detectados</label>
                            <div className="flex space-x-2">
                              {extractedTemplate.colors.map((color, index) => (
                                <div key={index} className="relative group">
                                  <div 
                                    className="w-12 h-12 rounded-lg border-2 border-white shadow-md cursor-pointer"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  ></div>
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {color}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fuente principal</label>
                            <div className="bg-white p-3 rounded-lg border border-gray-300">
                              <span className="font-medium" style={{ fontFamily: extractedTemplate.font }}>
                                {extractedTemplate.font}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => saveExtractedTheme()}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                          >
                            Guardar como Tema Personalizado
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Palette size={32} className="text-gray-400" />
                        </div>
                        <h4 className="text-gray-600 font-medium mb-2">Sube un template para comenzar</h4>
                        <p className="text-gray-500 text-sm">El análisis aparecerá aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Creador de Temas Personalizado */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Crear Tema Personalizado</h3>
                    <p className="text-gray-600">Diseña tu propio tema desde cero</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Tema</label>
                      <input
                        type="text"
                        value={customTheme.name}
                        onChange={(e) => setCustomTheme(prev => ({...prev, name: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Mi tema personalizado"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Principal</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={customTheme.titleColor}
                            onChange={(e) => setCustomTheme(prev => ({...prev, titleColor: e.target.value}))}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customTheme.titleColor}
                            onChange={(e) => setCustomTheme(prev => ({...prev, titleColor: e.target.value}))}
                            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Contenido</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={customTheme.contentColor}
                            onChange={(e) => setCustomTheme(prev => ({...prev, contentColor: e.target.value}))}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customTheme.contentColor}
                            onChange={(e) => setCustomTheme(prev => ({...prev, contentColor: e.target.value}))}
                            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#333333"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuente Principal</label>
                      <select
                        value={customTheme.fontFamily}
                        onChange={(e) => setCustomTheme(prev => ({...prev, fontFamily: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="Calibri">Calibri</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño Título</label>
                        <select
                          value={customTheme.titleSize}
                          onChange={(e) => setCustomTheme(prev => ({...prev, titleSize: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="28px">28px - Pequeño</option>
                          <option value="32px">32px - Mediano</option>
                          <option value="36px">36px - Grande</option>
                          <option value="40px">40px - Extra Grande</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño Contenido</label>
                        <select
                          value={customTheme.contentSize}
                          onChange={(e) => setCustomTheme(prev => ({...prev, contentSize: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="14px">14px - Pequeño</option>
                          <option value="16px">16px - Mediano</option>
                          <option value="18px">18px - Grande</option>
                          <option value="20px">20px - Extra Grande</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => saveCustomTheme()}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Guardar Tema Personalizado
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Vista Previa</h4>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div
                        className="font-bold mb-4"
                        style={{
                          fontSize: customTheme.titleSize,
                          color: customTheme.titleColor,
                          fontFamily: customTheme.fontFamily
                        }}
                      >
                        Título de Ejemplo
                      </div>
                      
                      <div
                        className="font-medium mb-3"
                        style={{
                          fontSize: customTheme.subtitleSize,
                          color: customTheme.contentColor,
                          fontFamily: customTheme.fontFamily
                        }}
                      >
                        1. Subtítulo de Ejemplo
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: customTheme.titleColor }}></div>
                          <span
                            style={{
                              fontSize: customTheme.bulletSize,
                              color: customTheme.contentColor,
                              fontFamily: customTheme.fontFamily
                            }}
                          >
                            Primera viñeta de ejemplo
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: customTheme.titleColor }}></div>
                          <span
                            style={{
                              fontSize: customTheme.bulletSize,
                              color: customTheme.contentColor,
                              fontFamily: customTheme.fontFamily
                            }}
                          >
                            Segunda viñeta de ejemplo
                          </span>
                        </li>
                      </ul>
                      
                      <p
                        style={{
                          fontSize: customTheme.contentSize,
                          color: customTheme.contentColor,
                          fontFamily: customTheme.fontFamily
                        }}
                        className="leading-relaxed"
                      >
                        Este es un párrafo de ejemplo que muestra cómo se verá el contenido con tu tema personalizado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestión de Temas Guardados */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                      <BookOpen size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Mis Temas</h3>
                      <p className="text-gray-600">Gestiona tu colección de temas</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {Object.keys(customThemes).length} temas guardados
                  </div>
                </div>
              </div>

              <div className="p-8">
                {Object.keys(customThemes).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Palette size={32} className="text-gray-400" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-2">No tienes temas personalizados</h4>
                    <p className="text-gray-500 text-sm">Crea tu primer tema o clona uno existente</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(customThemes).map(([key, theme]) => (
                      <div key={key} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">{theme.name}</h4>
                          <button
                            onClick={() => deleteCustomTheme(key)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div
                            className="font-bold text-sm mb-2"
                            style={{ 
                              color: theme.titleColor,
                              fontFamily: theme.fontFamily 
                            }}
                          >
                            Título
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.titleColor }}></div>
                            <span className="text-xs" style={{ color: theme.contentColor }}>Viñeta</span>
                          </div>
                          <div className="text-xs leading-relaxed" style={{ color: theme.contentColor }}>
                            Contenido de ejemplo...
                          </div>
                        </div>

                        <div className="flex space-x-2 mb-4">
                          <div 
                            className="w-6 h-6 rounded border-2 border-white shadow-sm"
                            style={{ backgroundColor: theme.titleColor }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded border-2 border-white shadow-sm"
                            style={{ backgroundColor: theme.contentColor }}
                          ></div>
                        </div>

                        <button
                          onClick={() => applyCustomTheme(key)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Aplicar Tema
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PowerPointGenerator;