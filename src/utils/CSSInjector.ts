/**
 * Injects CSS styles into the document to ensure consistent rendering for the game canvas.
 * 
 * The injected CSS includes:
 * - Reset for margins and paddings.
 * - Fullscreen scaling for the canvas element.
 * - Hidden overflow for the HTML and body elements.
 */
export function injectCSS(): void {
    const style = document.createElement('style');
    style.type = 'text/css';

    // CSS rules for consistent layout
    style.innerHTML = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }

        canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
        }
    `;

    // Append the style element to the document head
    document.head.appendChild(style);
}
