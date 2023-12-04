import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useNavigation } from "react-router-dom"
import CanvasComponent from "../components/canvasComponent";

export default function Performance() {

    const [showImports, setShowImports] = useState(false);

    const importList = [{ type : 'manual', title : 'Manually'}];

    const navigate = useNavigate();

    useEffect(() => {
        window.close();
    })

    function useImport(method) {
        window.close();
        navigate('/import', {state : {method : method}});
    }

    return (
        <div>
            <button onClick={() => setShowImports(!showImports)}>Import Data</button>
            {showImports ? (
            <div>
            <p>Imports from:</p>
            <ul>
                {importList.map((obj) => (
                <div key={obj.type} onClick={() => useImport(obj.type)}> 
                <li>Import {obj.title}</li>
                </div>
                ))}
            </ul>
            </div>
        ) : null} 
        <div>
        <CanvasComponent type={'scatter'} purpose={'progressWeights'}/>
        <CanvasComponent type={'scatter'} purpose={'progressReps'} />
        <CanvasComponent type={'bar'} purpose={'maxReps'} />
        <CanvasComponent type={'pie'} purpose={'frequency'} />

        </div>
        </div>
    )
}