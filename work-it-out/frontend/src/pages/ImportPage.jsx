import { useLocation, useNavigate } from "react-router-dom"
import ManualImport from "../components/ManualImport";
import { useEffect } from "react";

export default function ImportPage() {

    const navigate = useNavigate();

    const {state} = useLocation();

    useEffect(() => {
        if(!state || !state.method) {
            navigate('/performance');
        }
    })

    return (
        <div>
            {state && (state.method === 'manual') && <ManualImport/>}
        </div>
    )
}