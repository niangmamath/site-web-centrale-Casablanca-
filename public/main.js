import { Application } from 'https://cdn.skypack.dev/@splinetool/runtime';

const canvas = document.getElementById('spline-container');
const app = new Application(canvas);
app.load('https://prod.spline.design/r2J2nCR3nL842a-d/scene.splinecode');
