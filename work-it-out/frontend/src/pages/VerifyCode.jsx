import { useEffect, useState } from "react";
import VerificationInput from "react-verification-input";
import CountDownTimer from "../components/CountDownTimer";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UPDATE_USER } from "../store/types";

export default function VerifyCode() {

    const {state} = useLocation();
    const navigate = useNavigate();
    // recieve prop proving code was sent 
    // if prop is false redirect to login

    const params = useParams();

    let TWO_MINS_IN_MS = 2 * 60 * 1000;
    let NOW_IN_MS = new Date().getTime();
  
    let dateTimeAfterTwoMinutes = NOW_IN_MS + TWO_MINS_IN_MS
    const [time, setTime] = useState(dateTimeAfterTwoMinutes);
    const [returnData, setData] = useState();
    const [message, setMessage] = useState();
    const [disabled, setDisabled] = useState(false);
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    const dispatch = useDispatch();

    const disableInput = () => {
        if(!expired) {
            setTimeout(() => {
                setExpired(true);
            },0)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setFailed(true);
            setDisabled(true);
            setMessage('Phone verification failed!');
        },10 * 60 * 1000);
    })

    useEffect(() => {

        if(!state || !state.codeSent || !state.phonenumber) {
            navigate('/');
        }else if(state && state.data){
            setData(JSON.stringify(state.data));
        }   

        if(message) {
            setTimeout(() =>{
                setMessage('');
            }, 2E3)
        }else if(failed) {
            const callback = (state && state.callback) ? state.callback : '/';
            navigate(callback, {replace : true});
        }
    }, [message])

    useEffect(() => {
        if(expired) {
            setDisabled(true);
        }else{
            setDisabled(false);
        }
    }, [expired]);

    useEffect(() => {
        setTimeout(() => {
            setExpired(false);
        },3E3);
    },[time]);

    const handleSubmit = (data) => {
        const id = params.id;
        if(disabled) return;

        setDisabled(true);
        axios.post(`http://localhost:3001/user/verifycode`, { phonenumber : state.phonenumber, code : data }).then(res => {
            setLoading(false);
            if(res.status === 200) {
                setDisabled(false);
                if(state.callback && returnData){
                    navigate(state.callback, {replace : true, state : {successData : returnData}});
                }else{
                    console.log(res.data);
                    if(res.data.user) {
                        // display that new email was saved
                        dispatch({type : UPDATE_USER, payload : res.data})
                        setMessage("Sucess!");
                    }
                    navigate('/', {replace : true});
                }
            }
          }).catch(err => {
            // invalid code
            console.log(err);
            setDisabled(false);
            setMessage(err.response.data.message);
          });
    }

    function resendCode(){
        if((new Date().getTime() > time)) {
            // resend code
            if (loading) return;
            setLoading(true);
            const id = params.id;
            axios.post(`http://localhost:3001/user/resendcode`, {id :  id }).then(res => {
                if(res.status === 200) {
                    TWO_MINS_IN_MS = 2 * 60 * 1000;
                    NOW_IN_MS = new Date().getTime();
                  
                    dateTimeAfterTwoMinutes =  NOW_IN_MS + TWO_MINS_IN_MS
                    setTime(dateTimeAfterTwoMinutes);
                    setLoading(false);
                }
              }).catch(err => {
                // invalid code
                setMessage("Error resending code");
              });

        }else {
            setMessage('Wait 2 minutes before resending');
        }
    }

    return (
        <div>
            <label>Verification code was sent to your device, input here.</label>
            <label>Code is valid for two minutes.</label>
            <label>Do not reload page or will redirect.</label>
            <div style={disabled ? { pointerEvents : "none", opacity : "0.4"} : {}}>
            <VerificationInput 
            onComplete={handleSubmit}
            placeholder="_"
            length={6}
            validChars="0-9"
            />
            </div>
            <CountDownTimer targetDate={time} useCallback={disableInput}/>
            <button onClick={resendCode}>Resend Code</button>
            {message && <p>{message}</p>}
        </div>
    )
};