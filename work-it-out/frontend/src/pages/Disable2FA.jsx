import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { UPDATE_USER } from '../store/types';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';


export default function Disable2FA() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [passwordCorrect, setPasswordCorrect] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const dispatch = useDispatch();

    const user = useSelector(state => state.user);
  
    useEffect(() => {

      if(user.accountStatus < 3) {
        navigate('/', {replace : true});

      // request already sent
      }else if(user.accountStatus >= 4) {
        setPasswordCorrect(true);
      }else {
        setPasswordCorrect(false);
      }

      if(error) {
          setTimeout(() =>{
              setError('');
          }, 2E3)
      }
    }, [error, user])

    function cancelRequest() {
      axios.post(`http://localhost:3001/user/canceldisable2fa`, {id : user._id}).then(res => {
        if(res.data.user) {
          dispatch({type : UPDATE_USER, payload : res.data});
        }
      }).catch(err => {
        setLoading(false);
        setError(err.response.data.message);
      });
    }

    function updateAccountConfirm(data) {

      const {code} = data;

        if (loading) return;
        setLoading(true);
          axios.post(`http://localhost:3001/user/disable2fa`, {id : user._id, code: code}).then(res => {
            setLoading(false);
            if(res.data.user) {
              // display that new email was saved
              dispatch({type : UPDATE_USER, payload : res.data})
              setError("2FA Disabled!");
            }
          }).catch(err => {
            setLoading(false);
            setError(err.response.data.message);
          });
    }
  
   function updateAccount(data) {

    const {currentPassword} = data;

    if (loading) return;
    setLoading(true);
      axios.post(`http://localhost:3001/user/disable2farequest`, {id : user._id, password : currentPassword}).then(res => {
        setLoading(false);
        if(res.status === 200) {
          setError("Disable 2FA Request sent!");
          if(res.data.user) {
            dispatch({type : UPDATE_USER, payload : res.data});
          }
        }
      }).catch(err => {
        setLoading(false);
        setError(err.response.data.message);
      });
    }

  return(
    <>
     {
        (passwordCorrect) ? 
        <div className="login-wrapper">
         <h1>Code was sent to email</h1>
         <form onSubmit={handleSubmit(updateAccountConfirm)}>
         <label style={{ color : 'white'}}>
             <p>Enter code</p>
             <input type="password" {...register("code", {
               required: true,            
             })}/>
           </label>
           <div>
           <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
           </div>
         </form>
         <button onClick={cancelRequest}>Cancel Request</button>
         {error && <p className='form-label-required'>{error}</p>}
       </div>

         : 
         <div className="login-wrapper">
         <h1>Warning accounts are less secure without 2FA</h1>
         <form onSubmit={handleSubmit(updateAccount)}>
         <label style={{ color : 'white'}}>
             <p>Current Password</p>
             <input type="password" {...register("currentPassword", {
               required: true,            
             })}/>
           </label>
           <div>
           <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
           </div>
         </form>
         {error && <p className='form-label-required'>${error}</p>}
       </div>
    }
    </>
  )
}