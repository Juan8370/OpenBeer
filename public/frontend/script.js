// Variables globales
let currentPage = '1';
let transactionData = null;
let configData = null;

// Elementos DOM
const homePage = document.querySelector('.home-page');
const servicePage = document.getElementById('service-page');
const finalPage = document.getElementById('final-page');
const errorContainer = document.getElementById('errorMessage');

// Manejo de errores global
window.addEventListener('error', function(e) {
  console.error('Error capturado:', e.error);
  showError('Error en la aplicación: ' + e.message);
});

// Función para mostrar errores
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
  
  // Ocultar el error después de 5 segundos
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 5000);
}

// Función para cambiar de página
function changePage(page) {
  // Ocultar todas las páginas
  homePage.style.display = 'none';
  servicePage.style.display = 'none';
  finalPage.style.display = 'none';
  
  // Mostrar la página correspondiente
  switch(page) {
    case '1':
      homePage.style.display = 'flex';
      break;
    case '2':
      servicePage.style.display = 'block';
      updateServicePage();
      break;
    case '3':
      finalPage.style.display = 'block';
      updateFinalPage();
      break;
    default:
      homePage.style.display = 'flex';
  }
  
  currentPage = page;
  
  // Ajustar el scroll para ver el contenido correctamente
  window.scrollTo(0, 0);
}

// Actualizar página de servicio
// Actualizar página de servicio
// Actualizar página de servicio
// Actualizar página de servicio
function updateServicePage() {
  if (!transactionData) return;
  
  const quantity = transactionData.mlAcumulados || 0;
  const price = transactionData.costoTotal || 0;
  
  // Actualizar valores
  document.getElementById('service-qty').textContent = `${quantity} ml`;
  document.getElementById('service-price').textContent = `$${price.toLocaleString('es-CO')}`;
  
  // Actualizar barra de progreso (asumiendo un máximo de 500ml)
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = Math.min((quantity / 1000) * 100, 100);
  progressBar.style.width = `${progressPercent}%`;
  
  // Actualizar mensaje de estado según el progreso
  const statusMessage = document.querySelector('.status-message p');
  if (progressPercent < 30) {
    statusMessage.textContent = "Iniciando el servicio de su cerveza...";
  } else if (progressPercent < 300) {
    statusMessage.textContent = "Sirviendo su cerveza. ¡Pronto estará lista!";
  } else if (progressPercent < 700) {
    statusMessage.textContent = "¡Casi listo! Terminando de servir...";
  } else {
    statusMessage.textContent = "¡Servicio completado! Disfrute su cerveza.";
  }
}



// Actualizar página final
function updateFinalPage() {
  if (!transactionData) return;
  
  document.getElementById('final-qty').textContent = `${transactionData.mlAcumulados} ml`;
  document.getElementById('final-value').textContent = `${transactionData.costoTotal.toLocaleString('es-CO')} $`;
  document.getElementById('final-balance').textContent = `${transactionData.saldoRestante.toLocaleString('es-CO')} $`;
}

// Cargar configuración desde home.json
async function loadConfig() {
  try {
    const response = await fetch('/config/home.json');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    configData = await response.json();
    
    // Actualizar la UI con los datos de configuración
    document.getElementById('page-title').textContent = configData.title;
    document.getElementById('beer-name').textContent = configData.beerName;
    document.getElementById('beer-description').textContent = configData.description;
    document.getElementById('qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(configData.qrData)}`;
    
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    showError('Error al cargar la configuración: ' + error.message);
  }
}

// Obtener datos de transacción desde la API
async function fetchTransactionData() {
  try {
    const response = await fetch('http://localhost:5500/api/transaction', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    transactionData = await response.json();
    
    // Cambiar de página si es necesario
    if (transactionData.page && transactionData.page !== currentPage) {
      changePage(transactionData.page);
    }
    
    // Actualizar la página actual si está visible
    if (currentPage === '2') {
      updateServicePage();
    } else if (currentPage === '3') {
      updateFinalPage();
    }
    
  } catch (error) {
    console.error('Error al obtener datos de transacción:', error);
    showError('Error de conexión con el servidor: ' + error.message);
  }
}

// Inicializar la aplicación
async function initApp() {
  try {
    // Cargar configuración
    await loadConfig();
    
    // Obtener datos iniciales de transacción
    await fetchTransactionData();
    
    // Establecer polling para actualizar datos periódicamente
    setInterval(fetchTransactionData, 1000);
    
  } catch (error) {
    showError('Error al inicializar la aplicación: ' + error.message);
  }
}

// Función para generar burbujas dinámicamente
function generateBubbles() {
  const bubblesContainer = document.querySelector('.bubbles');
  const bubbleCount = 25; // Número de burbujas que quieres generar
  
  // Limpiar burbujas existentes
  bubblesContainer.innerHTML = '';
  
  // Generar nuevas burbujas
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Establecer estilos inline para variedad
    const size = Math.random() * 30 + 15; // Tamaño entre 15px y 45px
    const left = Math.random() * 100; // Posición horizontal aleatoria
    const duration = Math.random() * 10 + 10; // Duración entre 10s y 20s
    const delay = Math.random() * 8; // Retardo entre 0s y 8s
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;
    
    bubblesContainer.appendChild(bubble);
  }
}

// Llamar a la función cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
  generateBubbles();
  // El resto de tu código de inicialización...
});

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);