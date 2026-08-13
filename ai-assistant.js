(function() {
  'use strict';

  var conversationHistory = [];

  // =========================================================
  // XSS-SAFE MARKDOWN RENDERER
  // =========================================================
  function renderMarkdownToHTML(text) {
    if (!text) return '';

    // 1. Escape HTML entities to prevent XSS vulnerabilities
    var escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    var lines = escaped.split('\n');
    var htmlLines = [];
    var inUnorderedList = false;
    var inOrderedList = false;

    function closeLists() {
      if (inUnorderedList) {
        htmlLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      if (!line) {
        closeLists();
        continue;
      }

      // Horizontal Rule: --- or *** or ___
      if (/^(---|[*]{3,}|_{3,})$/.test(line)) {
        closeLists();
        htmlLines.push('<hr class="ai-divider">');
        continue;
      }

      // Headings: ### H3, ## H2, # H1
      if (/^###\s+(.+)$/.test(line)) {
        closeLists();
        var h3Content = line.replace(/^###\s+/, '');
        htmlLines.push('<h4 class="ai-heading-3">' + inlineFormatting(h3Content) + '</h4>');
        continue;
      }
      if (/^##\s+(.+)$/.test(line)) {
        closeLists();
        var h2Content = line.replace(/^##\s+/, '');
        htmlLines.push('<h3 class="ai-heading-2">' + inlineFormatting(h2Content) + '</h3>');
        continue;
      }
      if (/^#\s+(.+)$/.test(line)) {
        closeLists();
        var h1Content = line.replace(/^#\s+/, '');
        htmlLines.push('<h2 class="ai-heading-1">' + inlineFormatting(h1Content) + '</h2>');
        continue;
      }

      // Unordered List: - item or * item
      if (/^[-*]\s+(.+)$/.test(line)) {
        if (inOrderedList) {
          htmlLines.push('</ol>');
          inOrderedList = false;
        }
        if (!inUnorderedList) {
          htmlLines.push('<ul class="ai-bullet-list">');
          inUnorderedList = true;
        }
        var ulContent = line.replace(/^[-*]\s+/, '');
        htmlLines.push('<li>' + inlineFormatting(ulContent) + '</li>');
        continue;
      }

      // Ordered List: 1. item or 2. item
      if (/^\d+\.\s+(.+)$/.test(line)) {
        if (inUnorderedList) {
          htmlLines.push('</ul>');
          inUnorderedList = false;
        }
        if (!inOrderedList) {
          htmlLines.push('<ol class="ai-num-list">');
          inOrderedList = true;
        }
        var olContent = line.replace(/^\d+\.\s+/, '');
        htmlLines.push('<li>' + inlineFormatting(olContent) + '</li>');
        continue;
      }

      // Regular paragraph line
      closeLists();
      htmlLines.push('<p class="ai-paragraph">' + inlineFormatting(line) + '</p>');
    }

    closeLists();
    return htmlLines.join('');
  }

  function inlineFormatting(str) {
    return str
      .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
      .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
  }

  // =========================================================
  // EV / AUTOMOTIVE DOMAIN SCOPE GUARD
  // =========================================================
  function isEVRelatedQuery(query) {
    if (!query || typeof query !== 'string') return false;
    var q = query.toLowerCase().trim();

    // Explicit non-EV triggers that must be rejected (unless explicit EV context is present)
    var nonEVTriggers = [
      /\b(ipl|cricket|world cup|football|messi|ronaldo|virat|kohli|dhoni|match|trophy|tournament|olympics)\b/,
      /\b(prime minister|pm|president|election|bjp|congress|politics|minister)\b/,
      /\b(python|javascript|java|c\+\+|coding|code|program|developer|algorithm)\b/,
      /\b(recipe|cook|baking|biryani|pizza|burger|ingredient|kitchen|food)\b/,
      /\b(joke|riddle|funny story|sing a song|poem)\b/,
      /\b(capital of|taylor swift|movie|actor|actress|cinema|bollywood|hollywood|netflix|song)\b/,
      /\b(weather today|temperature today|forecast today|climate today)\b/,
      /\b(bitcoin|crypto|nifty|sensex|stock market)\b/
    ];

    var hasExplicitEVContext = /\b(ev|electric|charger|charging|battery|tata|nexon|mg|byd|mahindra|hyundai|kia|zeon|statiq|chargzone|plugshare|wallbox|kwh|kw|ccs2)\b/.test(q);

    for (var i = 0; i < nonEVTriggers.length; i++) {
      if (nonEVTriggers[i].test(q) && !hasExplicitEVContext) {
        return false;
      }
    }

    // Clear EV & Automotive Keywords/Phrases
    var evPatterns = [
      /\b(ev|evs|electric|plugin|phev|bev)\b/,
      /\b(car|cars|vehicle|suv|sedan|hatchback|automobile|auto|motor|driving|commute)\b/,
      /\b(battery|batteries|degradation|lifespan|bms|lfp|nmc|cell|cells|pack)\b/,
      /\b(charge|charging|charger|chargers|fast charge|dc charge|ac charge|ccs|ccs2|gbt|type 2|socket|wallbox|plugshare|tata power|zeon|statiq|chargezone|blusmart|jio-bp)\b/,
      /\b(range|arai|kms|km|mileage|efficiency|wh\/km|kwh\/100km)\b/,
      /\b(cost|running cost|price|budget|subsidy|fame|tax|road tax|exemption|insurance|emi|finance|resale|value|petrol|diesel|fuel|hybrid)\b/,
      /\b(tata|nexon|tiago|tigor|curvv|punch|harrier|mg|zs|comet|windsor|byd|atto|seal|e6|mahindra|xuv400|be05|hyundai|ioniq|kona|kia|ev6|ev9|tesla|model 3|model y|citroen|ec3|bmw|i4|ix|audi|etron|mercedes|eqb|eqs|maruti|evx|toyota|skoda|volvo|ex30|xc40)\b/,
      /\b(regenerative|regen|braking|motor|torque|horsepower|hp|kw|kwh|adas|ota|software|infotainment)\b/,
      /\b(maintenance|servicing|service|warranty|tyre|tyres|fire|safety|crash|ncap)\b/,
      /\b(policy|policies|incentive|incentives|subsidy|subsidies|infrastructure|station|stations|grid|solar|green energy|carbon|emissions)\b/
    ];

    for (var j = 0; j < evPatterns.length; j++) {
      if (evPatterns[j].test(q)) {
        return true;
      }
    }

    // Ambiguous queries ("How long does charging take?", "Is fast charging bad?", "How much does insurance cost?")
    var ambiguousAllowed = [
      /\b(charging|charge|battery|power|socket|plug|voltage|electricity|bill|unit|units|kwh)\b/,
      /\b(commute|daily drive|trip|route|highway|distance|speed|acceleration)\b/,
      /\b(subsidy|incentive|rebate|registration|rto|number plate)\b/,
      /\b(buying|buy|recommend|suggestion|best|top|upcoming|launch|launches|variant|variants)\b/
    ];

    for (var k = 0; k < ambiguousAllowed.length; k++) {
      if (ambiguousAllowed[k].test(q)) {
        return true;
      }
    }

    return false;
  }

  function init() {
    var container = document.querySelector('.ai-assistant-container');
    var trigger = document.getElementById('ai-trigger');
    var chatWindow = document.getElementById('ai-chat-window');
    var closeBtn = document.getElementById('ai-chat-close');
    var input = document.getElementById('ai-chat-input');
    var sendBtn = document.getElementById('ai-send-btn');
    var chatBody = document.getElementById('ai-chat-body');
    var label = document.getElementById('ai-label');

    if (!trigger || !chatWindow) return;

    var isOpen = false;
    var labelTimer = null;
    var typingIndicator = null;
    var validationTimer = null;

    conversationHistory = [];

    // Inline EV Car Wale validation message element
    var validationEl = document.createElement('div');
    validationEl.id = 'ai-input-validation';
    validationEl.className = 'ai-input-validation';
    validationEl.textContent = 'Please type something first.';

    var inputArea = chatWindow.querySelector('.ai-chat-input-area');
    if (inputArea && inputArea.parentNode) {
      inputArea.parentNode.insertBefore(validationEl, inputArea);
    }

    function showValidationError(msg) {
      if (validationEl) {
        validationEl.textContent = msg || 'Please type something first.';
        validationEl.classList.add('visible');
        clearTimeout(validationTimer);
        validationTimer = setTimeout(function() {
          validationEl.classList.remove('visible');
        }, 2500);
      }
    }

    function hideValidationError() {
      if (validationEl) {
        validationEl.classList.remove('visible');
        clearTimeout(validationTimer);
      }
    }

    function showTyping() {
      if (typingIndicator) return;
      typingIndicator = document.createElement('div');
      typingIndicator.className = 'ai-message ai-bot-message ai-typing';
      typingIndicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      chatBody.appendChild(typingIndicator);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function hideTyping() {
      if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
      }
    }

    function showLabel() {
      if (!isOpen && label) {
        label.classList.add('visible');
        clearTimeout(labelTimer);
        labelTimer = setTimeout(function() { label.classList.remove('visible'); }, 4000);
      }
    }

    setTimeout(showLabel, 2000);

    setInterval(function() {
      if (!isOpen) showLabel();
    }, 8000);

    function openChat() {
      isOpen = true;
      chatWindow.classList.add('open');
      if (label) label.classList.remove('visible');
      setTimeout(function() { if (input) input.focus(); }, 400);
    }

    function closeChat() {
      isOpen = false;
      chatWindow.classList.remove('open');
      hideValidationError();
      setTimeout(showLabel, 500);
    }

    // ONLY the X button or trigger opens/closes the assistant
    trigger.addEventListener('click', openChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // Prevent clicks/mousedown/pointerdown inside the assistant window from bubbling to global handlers
    chatWindow.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    chatWindow.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    chatWindow.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
    });

    function addMessage(text, className) {
      var msg = document.createElement('div');
      msg.className = 'ai-message ' + className;
      
      if (className.indexOf('ai-bot-message') !== -1) {
        msg.innerHTML = renderMarkdownToHTML(text);
      } else {
        msg.textContent = text;
      }

      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleSend() {
      var rawValue = input ? input.value : '';
      var userText = rawValue.trim();

      if (!userText) {
        showValidationError('Please type something first.');
        return;
      }

      hideValidationError();
      sendMessage(userText);
    }

    function sendMessage(userText) {
      addMessage(userText, 'ai-user-message');
      if (input) input.value = '';

      // Frontend EV Scope Restriction Check BEFORE API call
      if (!isEVRelatedQuery(userText)) {
        var rejectionMsg = "I'm your EV Car Wale assistant, so I can help with electric cars, EV buying, charging, batteries, running costs, technology, and other EV-related topics. Ask me something about EVs and I'll be happy to help.";
        addMessage(rejectionMsg, 'ai-bot-message');
        return;
      }

      conversationHistory.push({ role: 'user', content: userText });
      showTyping();

      var payload = { messages: conversationHistory };
      console.log('[AI Assistant Widget] Sending request to POST /api/chat:', payload);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/chat', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 30000;

      xhr.onload = function() {
        hideTyping();
        console.log('[AI Assistant Widget] Received response [HTTP ' + xhr.status + ']:', xhr.responseText);
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var reply = data.reply || 'Sorry, I didn\'t understand that. Could you rephrase?';
            conversationHistory.push({ role: 'assistant', content: reply });
            addMessage(reply, 'ai-bot-message');
          } catch (e) {
            console.error('[AI Assistant Widget Parsing Error]:', e);
            addMessage('Sorry, I had trouble processing that response. Please try again.', 'ai-bot-message');
          }
        } else {
          try {
            var errData = JSON.parse(xhr.responseText);
            addMessage(errData.error || 'Sorry, something went wrong. Please try again.', 'ai-bot-message');
          } catch (e) {
            addMessage('Sorry, something went wrong. Please try again.', 'ai-bot-message');
          }
        }
      };

      xhr.onerror = function(err) {
        hideTyping();
        console.error('[AI Assistant Widget Network Error]:', err);
        addMessage('Oops! Looks like you\'re offline. Please check your connection and try again.', 'ai-bot-message');
      };

      xhr.ontimeout = function() {
        hideTyping();
        console.warn('[AI Assistant Widget Timeout]');
        addMessage('The request timed out. Please try again.', 'ai-bot-message');
      };

      xhr.send(JSON.stringify(payload));
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleSend();
      });
    }

    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        } else {
          hideValidationError();
        }
      });
      input.addEventListener('input', function() {
        if (input.value.trim()) {
          hideValidationError();
        }
      });
    }

    chatBody.addEventListener('click', function(e) {
      var chip = e.target.closest('.ai-chip');
      if (chip) {
        hideValidationError();
        sendMessage(chip.textContent.trim());
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function showContainer() {
    if (document.getElementById('preloader')) {
      return;
    }
    var c = document.querySelector('.ai-assistant-container');
    if (c) c.classList.add('loaded');
  }
  window.showAIAssistant = function() {
    var c = document.querySelector('.ai-assistant-container');
    if (c) c.classList.add('loaded');
  };
  if (document.readyState === 'complete') {
    showContainer();
  } else {
    window.addEventListener('load', showContainer);
  }
})();
