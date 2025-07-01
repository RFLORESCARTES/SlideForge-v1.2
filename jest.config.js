/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  
  // Archivos de configuración
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  
  // Patrones de archivos de prueba
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Transformaciones
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Manejo de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/dist-electron/'
  ],
  
  // Configuración de cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/test/**/*',
    '!src/**/*.stories.{js,jsx}',
    '!src/main.js',
    '!src/preload.js'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Directorio de salida de cobertura
  coverageDirectory: 'coverage',
  
  // Variables de entorno para pruebas
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Configuración adicional
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};
