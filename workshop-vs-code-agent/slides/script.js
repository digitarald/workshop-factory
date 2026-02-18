/* ============================================
   Workshop Slides — Script
   ============================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---

  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('workshop-theme', theme);
  }

  // Restore saved theme
  const saved = localStorage.getItem('workshop-theme');
  if (saved) setTheme(saved);

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Sidebar / Hamburger ---

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebarClose = sidebar.querySelector('.sidebar-close');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);
  sidebarClose.addEventListener('click', closeSidebar);

  // Close sidebar on link click (mobile)
  sidebar.querySelectorAll('.toc a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 1024) closeSidebar();
    });
  });

  // --- Copy to Clipboard ---

  document.querySelectorAll('pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code) return;

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    pre.style.position = 'relative';
    pre.appendChild(btn);

    btn.addEventListener('click', function () {
      var text = code.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for file:// protocol
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        } catch (e) {
          btn.textContent = 'Failed';
        }
        document.body.removeChild(textarea);
      });
    });
  });

  // --- Scroll Spy ---

  var tocLinks = Array.from(document.querySelectorAll('.toc-link, .toc-module-link'));
  var sections = [];

  tocLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    var target = document.querySelector(href);
    if (target) sections.push({ el: target, link: link });
  });

  var progressFill = document.getElementById('progress-fill');

  function updateScrollSpy() {
    var scrollY = window.scrollY + 120;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min((window.scrollY / docHeight) * 100, 100) : 0;
    progressFill.style.width = progress + '%';

    var active = null;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollY) {
        active = sections[i];
        break;
      }
    }

    tocLinks.forEach(function (link) {
      link.classList.remove('active');
    });

    if (active) {
      active.link.classList.add('active');
    }
  }

  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateScrollSpy();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  updateScrollSpy();

  // --- Keyboard Navigation ---

  var navigableSections = Array.from(
    document.querySelectorAll('.section, .module-header, .hero')
  );

  document.addEventListener('keydown', function (e) {
    // Ignore when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    if (e.key === 't' || e.key === 'T') {
      var current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var scrollY = window.scrollY + 120;
      var currentIdx = -1;

      for (var i = navigableSections.length - 1; i >= 0; i--) {
        if (navigableSections[i].offsetTop <= scrollY) {
          currentIdx = i;
          break;
        }
      }

      var nextIdx;
      if (e.key === 'ArrowDown') {
        nextIdx = Math.min(currentIdx + 1, navigableSections.length - 1);
      } else {
        nextIdx = Math.max(currentIdx - 1, 0);
      }

      var target = navigableSections[nextIdx];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // --- Syntax Highlighting ---

  function escapeHtml(str) {
    return str;
  }

  function highlightHTML(code) {
    // Comments
    code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="syn-comment">$1</span>');
    // Tags and attributes
    code = code.replace(
      /(&lt;\/?)([\w-]+)([\s\S]*?)(&gt;)/g,
      function (match, open, tag, attrs, close) {
        var highlighted = '<span class="syn-punctuation">' + open + '</span>' +
          '<span class="syn-tag">' + tag + '</span>';
        if (attrs) {
          attrs = attrs.replace(
            /([\w-]+)(=)(".*?")/g,
            '<span class="syn-attr">$1</span><span class="syn-punctuation">$2</span><span class="syn-string">$3</span>'
          );
          highlighted += attrs;
        }
        highlighted += '<span class="syn-punctuation">' + close + '</span>';
        return highlighted;
      }
    );
    return code;
  }

  function highlightCSS(code) {
    // Comments
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syn-comment">$1</span>');
    // Strings
    code = code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="syn-string">$1</span>');
    // Selectors (lines ending with {)
    code = code.replace(/^([^{}/\n][^{}\n]*?)(\{)/gm, '<span class="syn-selector">$1</span>$2');
    // Properties
    code = code.replace(/(?<=[\s;{])(-?[\w-]+)(\s*:\s*)/g, '<span class="syn-property">$1</span>$2');
    // Numbers with units
    code = code.replace(/\b(\d+\.?\d*)(px|rem|em|%|s|ms|vh|vw|deg|fr)?\b/g, '<span class="syn-number">$1$2</span>');
    return code;
  }

  function highlightJS(code) {
    // Comments
    code = code.replace(/(\/\/.*$)/gm, '<span class="syn-comment">$1</span>');
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syn-comment">$1</span>');
    // Strings
    code = code.replace(/(["'`])(?:(?!\1|\\).|\\.)*?\1/g, '<span class="syn-string">$&</span>');
    // Keywords
    code = code.replace(
      /\b(const|let|var|function|return|if|else|for|while|new|class|import|export|default|from|of|in|typeof|instanceof|this|null|undefined|true|false|async|await|try|catch|throw)\b/g,
      '<span class="syn-keyword">$1</span>'
    );
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');
    // Arrow functions
    code = code.replace(/=&gt;/g, '<span class="syn-punctuation">=&gt;</span>');
    return code;
  }

  function highlightMarkdown(code) {
    // Headers
    code = code.replace(/^(#{1,6}\s+.*$)/gm, '<span class="syn-tag">$1</span>');
    // Bold
    code = code.replace(/(\*\*)(.*?)(\*\*)/g, '<span class="syn-keyword">$1$2$3</span>');
    // Inline code
    code = code.replace(/(`)([^`]+)(`)/g, '<span class="syn-string">$1$2$3</span>');
    // Lists
    code = code.replace(/^(\s*[-*]\s)/gm, '<span class="syn-punctuation">$1</span>');
    code = code.replace(/^(\s*\d+\.\s)/gm, '<span class="syn-number">$1</span>');
    return code;
  }

  document.querySelectorAll('pre code[data-lang]').forEach(function (block) {
    var lang = block.getAttribute('data-lang');
    var code = block.innerHTML;

    switch (lang) {
      case 'html':
        block.innerHTML = highlightHTML(code);
        break;
      case 'css':
        block.innerHTML = highlightCSS(code);
        break;
      case 'javascript':
      case 'js':
        block.innerHTML = highlightJS(code);
        break;
      case 'markdown':
      case 'md':
        block.innerHTML = highlightMarkdown(code);
        break;
    }
  });

})();
