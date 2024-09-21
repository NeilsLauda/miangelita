window.onload = function() {
    var canvas = document.getElementById('roseCanvas');
    var ctx = canvas.getContext('2d');
    var audio = document.getElementById('backgroundMusic');

    // Ajustar el tamaño del canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetWidth; // Mantener proporción cuadrada
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var width = canvas.width;
    var height = canvas.height;
    var messageBox = document.getElementById('messageBox');

    var petalMessages = [
        '15 meses juntos. Cada día a tu lado es un regalo.',
        'Nuestro aniversario es el 4. Un día que cambió mi vida.',
        'Amo cómo me respetas y me amas. Eres única.',
        'Gracias por tu paciencia y comprensión infinita.',
        'A pesar de ser molestoso, me aguantas y eso vale oro.',
        'Te amo más cada día. Mi amor por ti no deja de crecer.'
    ];

    var petalPaths = [];
    var highlightedPetalIndex = -1;

    function drawRose(scaleFactor = 1) {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, scaleFactor);

        // Tallo
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(0, 300);
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Hojas
        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.quadraticCurveTo(-80, 150, -50, 100);
        ctx.quadraticCurveTo(-20, 160, 0, 200);
        ctx.fillStyle = '#228B22';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.quadraticCurveTo(80, 150, 50, 100);
        ctx.quadraticCurveTo(20, 160, 0, 200);
        ctx.fillStyle = '#228B22';
        ctx.fill();

        // Pétalos
        petalPaths = [];
        var angles = [0, 60, 120, 180, 240, 300];

        for (var i = 0; i < angles.length; i++) {
            var angle = angles[i] * Math.PI / 180;
            ctx.save();
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-40, -40, -60, -160, 0, -200);
            ctx.bezierCurveTo(60, -160, 40, -40, 0, 0);
            ctx.closePath();

            // Destacar el pétalo si está seleccionado
            if (i === highlightedPetalIndex) {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            ctx.fill();

            // Guardar el camino del pétalo para detección de eventos
            var path = new Path2D();
            path.moveTo(0, 0);
            path.bezierCurveTo(-40, -40, -60, -160, 0, -200);
            path.bezierCurveTo(60, -160, 40, -40, 0, 0);
            path.closePath();

            petalPaths.push({
                path: path,
                message: petalMessages[i],
                index: i,
                angle: angles[i]
            });

            ctx.restore();
        }

        // Centro de la rosa
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#FFA500';
        ctx.fill();

        ctx.restore();
    }

    var scale = 1;
    var growing = true;

    function animate() {
        width = canvas.width;
        height = canvas.height;
        if (growing) {
            scale += 0.001;
            if (scale >= 1.03) {
                growing = false;
            }
        } else {
            scale -= 0.001;
            if (scale <= 0.97) {
                growing = true;
            }
        }

        drawRose(scale);
        requestAnimationFrame(animate);
    }

    animate();

    // Iniciar la reproducción de audio al hacer clic en cualquier parte de la página
    document.body.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().catch(function(error) {
                console.log('Error al reproducir el audio:', error);
            });
        }
    }, { once: true });

    // Detección de clics en pétalos
    canvas.addEventListener('click', function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = (event.clientX - rect.left - width / 2) / scale;
        var y = (event.clientY - rect.top - height / 2) / scale;

        var found = false;

        for (var i = 0; i < petalPaths.length; i++) {
            var angle = petalPaths[i].angle * Math.PI / 180;
            var rotatedX = x * Math.cos(-angle) - y * Math.sin(-angle);
            var rotatedY = x * Math.sin(-angle) + y * Math.cos(-angle);

            if (ctx.isPointInPath(petalPaths[i].path, rotatedX, rotatedY)) {
                highlightedPetalIndex = i; // Guardamos el índice del pétalo seleccionado
                messageBox.innerHTML = '<h2>Carta para Ángela</h2><p>' + petalPaths[i].message + '</p>';
                found = true;
                drawRose(scale); // Redibujamos para actualizar el brillo
                break;
            }
        }

        if (!found) {
            // Centro de la rosa
            var distance = Math.sqrt(x * x + y * y);
            if (distance <= 40 / scale) {
                highlightedPetalIndex = -1; // No destacamos ningún pétalo
                messageBox.innerHTML = '<h2>Carta para Ángela</h2><p>Eres el centro de mi mundo. Te amo profundamente.</p>';
                drawRose(scale);
            } else {
                highlightedPetalIndex = -1; // No destacamos ningún pétalo
                messageBox.innerHTML = '<h2>Carta para Ángela</h2><p>Haz clic en los pétalos para leer mensajes especiales.</p>';
                drawRose(scale);
            }
        }
    });
}
