const fs = require('fs');
const file = 'src/layouts/Layout.astro';
let content = fs.readFileSync(file, 'utf8');

// Remove original AdSense script
content = content.replace(/<script async src="https:\/\/pagead2.googlesyndication.com\/pagead\/js\/adsbygoogle.js\?client=ca-pub-8838724534778502" crossorigin="anonymous"><\/script>\s*/, '');

// Inject delayed AdSense loading script at the end of body
const delayedScript = `
        <script type="text/javascript">
          (function() {
            var adsLoaded = false;
            function loadAds() {
              if (adsLoaded) return;
              adsLoaded = true;
              var script = document.createElement('script');
              script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8838724534778502";
              script.async = true;
              script.crossOrigin = "anonymous";
              document.head.appendChild(script);
              
              ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function(event) {
                window.removeEventListener(event, loadAds, {passive: true});
              });
            }
            
            ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function(event) {
              window.addEventListener(event, loadAds, {passive: true});
            });
            
            setTimeout(loadAds, 5000);
          })();
        </script>
`;

content = content.replace(/<\/body>/, delayedScript + '\n    </body>');

fs.writeFileSync(file, content);
