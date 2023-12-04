import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import 'chartjs-adapter-moment';
import Chart from 'chart.js/auto'

export default function CanvasComponent({type, purpose}) {
    const canvasRef = useRef();
    const [worker, setWorker] = useState();

    const user = useSelector(state => state.user);

    useEffect(() => {
        if(!worker) {
            const newWorker = new Worker(new URL('../workers/chart.worker.js', import.meta.url))
            setWorker(newWorker);
        }

    });
    useEffect(() => {
        if(worker && canvasRef && user ) {
            const config = {
                type: type,
                data: {},
            };
            try{
                worker.postMessage(
                    { config, id : user._id, purpose : purpose});
            }catch(err) {
                console.log(err);
                worker.terminate();
            }

            worker.onmessage = function (event) {
            if(event.data.type === 'chartRendered') {
                // Chart rendering is complete; you can handle the OffscreenCanvas here
                const config = JSON.parse(event.data.data);
        
                // Convert the OffscreenCanvas to a regular canvas
                const canvas = document.createElement('canvas');
                canvas.height = 500;
                canvas.width = 800;
                // Render the chart in the main thread
                const chartCanvas = canvasRef.current;
                const cxt = canvas.getContext('2d');
                chartCanvas.parentNode.replaceChild(canvas, chartCanvas);
                const newChart = new Chart(cxt, config);
              };
        }}

      
        return(() => {
            if(worker) {
                worker.terminate();
            }
        });
    }, [worker, canvasRef, user])
  
    return <canvas id='canvas' ref={canvasRef} width={1000} height={600}></canvas>;
}