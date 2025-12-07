const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- THE THEME VAULT (Data Source) ---
const PRESETS = {
  whatsapp: [
    { name: "1. Classic Green", bg: "#25D366", shape: "50%", shadow: "0 4px 10px rgba(0,0,0,0.3)" },
    { name: "2. Corporate Blue", bg: "#007bff", shape: "12px", shadow: "0 4px 10px rgba(0,0,0,0.2)" },
    { name: "3. Dark Mode", bg: "#333333", shape: "50%", shadow: "0 4px 15px rgba(0,0,0,0.5)" },
    { name: "4. Instagram Gradient", bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", shape: "50%", shadow: "0 5px 15px rgba(200,0,0,0.3)" },
    { name: "5. Neon Cyberpunk", bg: "#00f3ff", shape: "0px", shadow: "0 0 15px #00f3ff" },
    { name: "6. Royal Gold", bg: "linear-gradient(to right, #BF953F, #FCF6BA)", shape: "50%", shadow: "0 4px 10px #BF953F" },
    { name: "7. Minimal Grey", bg: "#bdc3c7", shape: "5px", shadow: "none" },
    { name: "8. Danger Red", bg: "#ff0000", shape: "50%", shadow: "0 4px 10px rgba(255,0,0,0.3)" },
    { name: "9. Forest Green", bg: "#1e5128", shape: "10px", shadow: "0 4px 10px rgba(0,0,0,0.4)" },
    { name: "10. Midnight Purple", bg: "#4a00e0", shape: "50%", shadow: "0 5px 15px rgba(74,0,224,0.4)" }
  ],
  slider: [
    { name: "1. Standard White", border: "3px solid white", shadow: "0 10px 30px rgba(0,0,0,0.3)" },
    { name: "2. Thick Black Frame", border: "10px solid black", shadow: "none" },
    { name: "3. Neon Glow", border: "2px solid #00f3ff", shadow: "0 0 20px #00f3ff" },
    { name: "4. Soft Shadow", border: "5px solid white", shadow: "0 20px 50px rgba(0,0,0,0.1)" },
    { name: "5. Brutalist", border: "4px solid #000", shadow: "8px 8px 0px #000" },
    { name: "6. Minimalist", border: "none", shadow: "0 4px 10px rgba(0,0,0,0.1)" },
    { name: "7. Golden Frame", border: "5px solid gold", shadow: "0 4px 15px gold" },
    { name: "8. Retro Dashed", border: "4px dashed #333", shadow: "none" },
    { name: "9. Glassmorphism", border: "1px solid rgba(255,255,255,0.5)", shadow: "0 8px 32px rgba(31,38,135,0.37)" },
    { name: "10. Dark Outline", border: "5px solid #222", shadow: "0 5px 15px rgba(0,0,0,0.5)" }
  ],
  exit_intent: [
    { name: "1. Standard Alert", bg: "white", text: "black", border: "none" },
    { name: "2. Urgent Red", bg: "#ff4757", text: "white", border: "none" },
    { name: "3. Midnight Blue", bg: "#2f3542", text: "white", border: "1px solid #57606f" },
    { name: "4. Gold Luxury", bg: "#e1b12c", text: "black", border: "4px solid #fff" },
    { name: "5. Matrix Terminal", bg: "black", text: "#00ff00", border: "2px solid #00ff00" },
    { name: "6. Clean Grey", bg: "#f1f2f6", text: "#2f3542", border: "1px solid #ccc" },
    { name: "7. Soft Pink", bg: "#ffeaa7", text: "#d63031", border: "none" },
    { name: "8. High Contrast", bg: "black", text: "white", border: "4px solid yellow" },
    { name: "9. Ocean Blue", bg: "linear-gradient(to right, #2980b9, #6dd5fa)", text: "white", border: "none" },
    { name: "10. Transparent Blur", bg: "rgba(255,255,255,0.9)", text: "black", border: "1px solid rgba(0,0,0,0.1)" }
  ],
  feedback: [
    { name: "1. Classic Emojis", style: "emoji" },
    { name: "2. Star Rating", style: "stars" },
    { name: "3. Thumbs Up/Down", style: "thumbs" },
    { name: "4. Dark Mode", style: "dark" },
    { name: "5. Text Only", style: "text" },
    { name: "6. Neon Bar", style: "neon" },
    { name: "7. Minimal Line", style: "minimal" },
    { name: "8. Floating Bubble", style: "bubble" },
    { name: "9. Full Width Red", style: "red" },
    { name: "10. Full Width Green", style: "green" }
  ],
  cookie: [
    { name: "1. Bottom Black Banner", pos: "bottom", style: "dark" },
    { name: "2. Top Yellow Alert", pos: "top", style: "warning" },
    { name: "3. Floating Corner Box", pos: "bottom-right", style: "card" },
    { name: "4. Minimal White", pos: "bottom", style: "light" },
    { name: "5. Full Screen Overlay", pos: "center", style: "overlay" },
    { name: "6. Blue Info Bar", pos: "top", style: "info" },
    { name: "7. Retro Pixel", pos: "bottom", style: "pixel" },
    { name: "8. Glass Effect", pos: "bottom", style: "glass" },
    { name: "9. Danger Red", pos: "bottom", style: "danger" },
    { name: "10. Subtle Grey", pos: "bottom-right", style: "subtle" }
  ]
};

let db = {
  whatsapp: { enabled: true, phone: "1234567890", presetIndex: 0 },
  slider: { enabled: true, before: "https://www.w3schools.com/howto/img_5terre.jpg", after: "https://www.w3schools.com/howto/img_5terre_wide.jpg", presetIndex: 0 },
  exit_intent: { enabled: true, text: "Wait! Get 50% OFF", presetIndex: 0 },
  feedback: { enabled: true, question: "How was your experience?", presetIndex: 0 },
  cookie: { enabled: true, text: "We use cookies.", presetIndex: 0 }
};

// --- DASHBOARD (With Real-Time JS Preview) ---
app.get('/', (req, res) => {
  const host = req.get('host');
  
  // Helper to generate dropdown options
  const generateOptions = (type, selectedIdx) => {
    return PRESETS[type].map((p, i) => 
      `<option value="${i}" ${selectedIdx == i ? 'selected' : ''}>${p.name}</option>`
    ).join('');
  };

  res.send(`
    <html>
      <head>
        <title>SaaS Theme Visualizer</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: white; padding: 40px; }
          .container { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .full-width { grid-column: span 2; }
          h1 { text-align: center; color: #38bdf8; margin-bottom: 30px; }
          
          .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; display: flex; flex-direction: column; }
          .card h3 { margin-top: 0; color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px; }
          
          label { display: block; margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; }
          select, input[type="text"] { width: 100%; padding: 10px; margin-top: 5px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 6px; }
          
          /* LIVE PREVIEW BOX STYLES */
          .preview-stage { 
            margin-top: 20px; 
            height: 120px; 
            background: #0f172a; 
            border: 2px dashed #334155; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            position: relative; 
            overflow: hidden;
          }
          
          .btn-save { grid-column: span 2; background: #38bdf8; color: #0f172a; padding: 20px; font-weight: bold; font-size: 18px; border: none; cursor: pointer; border-radius: 8px; margin-top: 20px; }
          .btn-save:hover { background: #0ea5e9; }
          .test-link { grid-column: span 2; text-align: center; margin-top: 20px; color: #38bdf8; font-weight: bold; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>🎨 Visual SaaS Dashboard</h1>
        
        <form action="/save" method="POST" class="container">
          
          <div class="card">
            <h3>💬 WhatsApp</h3>
            <div style="margin-bottom:10px"><input type="checkbox" name="wa_enabled" ${db.whatsapp.enabled ? 'checked' : ''}> Enable Widget</div>
            
            <label>Select Theme</label>
            <select id="wa_select" name="wa_preset" onchange="renderPreview('whatsapp')">
              ${generateOptions('whatsapp', db.whatsapp.presetIndex)}
            </select>
            
            <label>Phone Number</label>
            <input type="text" name="wa_phone" value="${db.whatsapp.phone}">

            <label>Live Preview:</label>
            <div class="preview-stage" id="wa_preview"></div>
          </div>

          <div class="card">
            <h3>📸 Before/After Slider</h3>
            <div style="margin-bottom:10px"><input type="checkbox" name="slider_enabled" ${db.slider.enabled ? 'checked' : ''}> Enable Widget</div>
            
            <label>Select Theme</label>
            <select id="slider_select" name="slider_preset" onchange="renderPreview('slider')">
              ${generateOptions('slider', db.slider.presetIndex)}
            </select>
            
            <label>Before Image URL</label>
            <input type="text" name="slider_before" value="${db.slider.before}">

            <label>Live Preview:</label>
            <div class="preview-stage" id="slider_preview"></div>
          </div>

          <div class="card">
            <h3>💸 Exit Intent</h3>
            <div style="margin-bottom:10px"><input type="checkbox" name="exit_enabled" ${db.exit_intent.enabled ? 'checked' : ''}> Enable Widget</div>
            
            <label>Select Theme</label>
            <select id="exit_select" name="exit_preset" onchange="renderPreview('exit_intent')">
              ${generateOptions('exit_intent', db.exit_intent.presetIndex)}
            </select>
            
            <label>Offer Text</label>
            <input type="text" name="exit_text" value="${db.exit_intent.text}">

            <label>Live Preview:</label>
            <div class="preview-stage" id="exit_preview"></div>
          </div>

          <div class="card">
            <h3>⭐ Feedback Bar</h3>
            <div style="margin-bottom:10px"><input type="checkbox" name="fb_enabled" ${db.feedback.enabled ? 'checked' : ''}> Enable Widget</div>
            
            <label>Select Theme</label>
            <select id="fb_select" name="fb_preset" onchange="renderPreview('feedback')">
              ${generateOptions('feedback', db.feedback.presetIndex)}
            </select>

            <label>Live Preview:</label>
            <div class="preview-stage" id="fb_preview"></div>
          </div>

          <button type="submit" class="btn-save">💾 SAVE ALL CHANGES</button>
          <a href="/test" target="_blank" class="test-link">🚀 OPEN LIVE TEST SITE</a>

        </form>

        <script>
          // We inject the Preset Data into the browser
          const PRESETS = ${JSON.stringify(PRESETS)};

          function renderPreview(type) {
            const select = document.getElementById(type + '_select');
            const previewBox = document.getElementById(type + '_preview');
            const index = select.value;
            const style = PRESETS[type][index];

            previewBox.innerHTML = ''; // Clear box

            if (type === 'whatsapp') {
              const btn = document.createElement('div');
              btn.innerHTML = '💬';
              btn.style.cssText = "width:50px; height:50px; text-align:center; line-height:50px; font-size:24px; color:white;";
              btn.style.background = style.bg;
              btn.style.borderRadius = style.shape;
              btn.style.boxShadow = style.shadow;
              previewBox.appendChild(btn);
            }
            
            if (type === 'slider') {
              const box = document.createElement('div');
              box.style.cssText = "width:80%; height:60%; background:#333; position:relative; overflow:hidden;";
              box.style.border = style.border;
              box.style.boxShadow = style.shadow;
              box.innerHTML = '<div style="position:absolute; left:0; top:0; height:100%; width:50%; background:#555; border-right:1px solid white;"></div>';
              previewBox.appendChild(box);
            }

            if (type === 'exit_intent') {
              const popup = document.createElement('div');
              popup.innerText = "WAIT!";
              popup.style.cssText = "padding:10px 20px; font-weight:bold; font-size:12px;";
              popup.style.background = style.bg;
              popup.style.color = style.text;
              popup.style.border = style.border;
              previewBox.appendChild(popup);
            }

            if (type === 'feedback') {
              const bar = document.createElement('div');
              bar.innerHTML = "How was it? 😡 😐 😍";
              bar.style.cssText = "padding:5px 10px; background:white; color:black; border-radius:5px; font-size:12px;";
              if(style.style === 'dark') { bar.style.background = '#000'; bar.style.color = '#fff'; }
              if(style.style === 'stars') bar.innerHTML = "Rating: ⭐⭐⭐⭐⭐";
              previewBox.appendChild(bar);
            }
          }

          // Run on load to show initial state
          window.onload = function() {
            renderPreview('whatsapp');
            renderPreview('slider');
            renderPreview('exit_intent');
            renderPreview('feedback');
          };
        </script>
      </body>
    </html>
  `);
});

// --- SAVE LOGIC ---
app.post('/save', (req, res) => {
  db.whatsapp.enabled = req.body.wa_enabled === 'on';
  db.whatsapp.presetIndex = parseInt(req.body.wa_preset);
  db.whatsapp.phone = req.body.wa_phone;

  db.slider.enabled = req.body.slider_enabled === 'on';
  db.slider.presetIndex = parseInt(req.body.slider_preset);
  db.slider.before = req.body.slider_before;

  db.exit_intent.enabled = req.body.exit_enabled === 'on';
  db.exit_intent.presetIndex = parseInt(req.body.exit_preset);
  db.exit_intent.text = req.body.exit_text;

  db.feedback.enabled = req.body.fb_enabled === 'on';
  db.feedback.presetIndex = parseInt(req.body.fb_preset);

  res.redirect('/');
});

// --- LOADER (UNCHANGED) ---
app.get('/loader.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const finalConfig = {
    whatsapp: { ...db.whatsapp, style: PRESETS.whatsapp[db.whatsapp.presetIndex] },
    slider: { ...db.slider, style: PRESETS.slider[db.slider.presetIndex] },
    exit_intent: { ...db.exit_intent, style: PRESETS.exit_intent[db.exit_intent.presetIndex] },
    feedback: { ...db.feedback, style: PRESETS.feedback[db.feedback.presetIndex] }
  };

  res.send(`
    (function() {
      const cfg = ${JSON.stringify(finalConfig)};

      if(cfg.whatsapp.enabled) {
        const btn = document.createElement('div');
        btn.innerHTML = '💬';
        btn.style.cssText = "position:fixed; bottom:20px; right:20px; width:60px; height:60px; text-align:center; line-height:60px; font-size:30px; cursor:pointer; color:white; z-index:9999;";
        btn.style.background = cfg.whatsapp.style.bg;
        btn.style.borderRadius = cfg.whatsapp.style.shape;
        btn.style.boxShadow = cfg.whatsapp.style.shadow;
        btn.onclick = () => window.open('https://wa.me/' + cfg.whatsapp.phone, '_blank');
        document.body.appendChild(btn);
      }

      if(cfg.slider.enabled) {
        const container = document.createElement('div');
        container.style.cssText = "position: relative; width: 600px; height: 400px; margin: 50px auto; overflow: hidden;";
        container.style.border = cfg.slider.style.border;
        container.style.boxShadow = cfg.slider.style.shadow;
        const imgAfter = document.createElement('div');
        imgAfter.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('" + cfg.slider.after + "'); background-size: cover;";
        const imgBefore = document.createElement('div');
        imgBefore.style.cssText = "position: absolute; top: 0; left: 0; width: 50%; height: 100%; background-image: url('" + cfg.slider.before + "'); background-size: cover; border-right: 2px solid white;";
        const range = document.createElement('input');
        range.type = "range";
        range.min = "0";
        range.max = "100";
        range.value = "50";
        range.style.cssText = "position: absolute; top: 50%; left: 0; width: 100%; cursor: ew-resize; opacity: 0; z-index: 10;";
        range.oninput = function() { imgBefore.style.width = this.value + "%"; };
        container.appendChild(imgAfter);
        container.appendChild(imgBefore);
        container.appendChild(range);
        const target = document.querySelector('.hero') || document.body;
        target.appendChild(container);
      }

      if(cfg.exit_intent.enabled) {
        let shown = false;
        document.addEventListener('mouseleave', (e) => {
          if(e.clientY < 0 && !shown) {
            shown = true;
            const modal = document.createElement('div');
            modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; justify-content:center; align-items:center;";
            const box = document.createElement('div');
            box.style.cssText = "padding:40px; text-align:center; max-width:400px; border-radius:10px;";
            box.style.background = cfg.exit_intent.style.bg;
            box.style.color = cfg.exit_intent.style.text;
            box.style.border = cfg.exit_intent.style.border;
            box.innerHTML = '<h2>Wait!</h2><p>' + cfg.exit_intent.text + '</p><button onclick="this.parentElement.parentElement.remove()" style="padding:10px 20px; margin-top:10px; cursor:pointer;">Close</button>';
            modal.appendChild(box);
            document.body.appendChild(modal);
          }
        });
      }

      if(cfg.feedback.enabled) {
        const bar = document.createElement('div');
        bar.style.cssText = "position:fixed; bottom:0; left:50%; transform:translateX(-50%); background:white; padding:10px 20px; border-radius:10px 10px 0 0; box-shadow:0 -2px 10px rgba(0,0,0,0.1); font-family:sans-serif; z-index:9998;";
        let content = '<span>' + cfg.feedback.question + '</span> 😡 😐 😍';
        if(cfg.feedback.style.style === 'stars') content = '<span>' + cfg.feedback.question + '</span> ⭐ ⭐ ⭐ ⭐ ⭐';
        if(cfg.feedback.style.style === 'dark') { bar.style.background = '#222'; bar.style.color = '#fff'; }
        bar.innerHTML = content;
        document.body.appendChild(bar);
      }
    })();
  `);
});

app.get('/test', (req, res) => {
  const host = req.get('host');
  res.send(`
    <html><body style="background:#ddd; font-family:sans-serif; text-align:center;">
      <div class="hero" style="padding:50px; background:white; margin:20px;"><h1>🛒 Client Store</h1></div>
      <script src="https://${host}/loader.js"></script>
    </body></html>`);
});

app.listen(3100, () => { console.log("VISUAL PREVIEWS ACTIVE"); });