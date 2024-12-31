export function injectCSS() {
    const style = document.createElement('style');
    style.type = 'text/css';
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
    document.head.appendChild(style);
}
