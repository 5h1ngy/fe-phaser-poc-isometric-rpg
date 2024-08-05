import Core from "./Core";
console.log('main, ln:2')
import '../style.css'

(async function () {
    const engine = new Core();

    await engine.init({ width: Core.SCREEN_WIDTH, height: Core.SCREEN_HEIGHT })

    await engine.loadScene();
    await engine.run();

    document.body.appendChild(engine.canvas);

})()