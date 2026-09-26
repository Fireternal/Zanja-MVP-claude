// Punto de entrada de la vitrina: la misma interfaz de la app, compilada como
// página suelta y con la API sustituida por una que guarda en el navegador.
// Ver vitrina/LEEME.md.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/app/globals.css';
import '@/app/mobile.css';
import '@/app/court.css';
import '@/app/overlays.css';
import '@/app/creator.css';
import '@/app/motion.css';
import {instalarApiLocal} from './api-local';
import Game from '@/app/page';

instalarApiLocal();
createRoot(document.getElementById('raiz')!).render(<StrictMode><Game/></StrictMode>);
