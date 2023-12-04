import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { UPDATE_USER } from '../store/types';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';


export default function UpdatePassword() {
    const [loading, setLoading] = useState(false);
    const [successData, setData] = useState();
    const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const {state} = useLocation();
    const currentpasswordRequired = errors.currentPassword && errors.currentPassword.type === "required";
    const passwordRequired = errors.password && errors.password.type === "required";
    const passwordLength = errors.password && errors.password.type === "minLength";
    const passwordPattern = errors.password && errors.password.type === "pattern";

    const confirmpasswordRequired = errors.confirmPassword && errors.confirmPassword.type === "required";
    const confirmpasswordMatch = errors.confirmPassword && errors.confirmPassword.type === "validate";


    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    useEffect(() => {
      if(state && state.successData) {
        setData(state.successData);
        // remove state else will trigger another call on redux rerender
        window.history.replaceState({}, document.title);
      }
    });
  
    useEffect(() => {
      if(successData){
        const data = JSON.parse(successData);
        setLoading(true);
        axios.put(`http://localhost:3001/user/${user._id}`, data, {withCredentials : true}).then(res => {
          setLoading(false);
          if(res.data.user) {
            // display that new email was saved
            dispatch({type : UPDATE_USER, payload : res.data})
            setError("Password Updated");
          }
        }).catch(err => {
          setLoading(false);
          setError(err.response.data.message);
        }); 
      }
    },[successData])
  
    useEffect(() => {
      if(error) {
          setTimeout(() =>{
              setError('');
          }, 2E3)
      }
    }, [error])
  
   function savePassword(data) {

    const {password, currentPassword} = data;

      if (loading) return;
      setLoading(true);
      // 2FA authenticate
      if(user.accountStatus >= 3) {
        const data = {newPassword : password, password: currentPassword};
        axios.post(`http://localhost:3001/user/sendcode`, {id :  user._id, phonenumber : user.phoneNumber }).then(res => {
          if(res.status === 200) {
              navigate(`/verifycode/${user._id}`, {state : {codeSent: true, phonenumber :user.phoneNumber, data : data, callback : '/updatepassword', replace : true}});
            }
        }).catch(err => {
          console.log(err);
          console.log(err.message);
        });
      }else {
        axios.put(`http://localhost:3001/user/${user._id}`, {newPassword : password, password: currentPassword}, {withCredentials : true}).then(res => {
          setLoading(false);
          if(res.data.user) {
            // display that new email was saved
            dispatch({type : UPDATE_USER, payload : res.data})
            setError("Password Updated");
          }
        }).catch(err => {
          setLoading(false);
          setError(err.response.data.message);
        });
      }

    }

  return(
    <div className="login-wrapper">
      <h1>Please Save new Password</h1>
      <form onSubmit={handleSubmit(savePassword)}>
      <label style={{ color : 'white'}}>
          <p>Current Password</p>
          <input type="password" {...register("currentPassword", {
            required: true,            
          })}/>
        </label>
        {currentpasswordRequired && <p  className='form-label-required'>This field is required</p>}
        <label style={{ color : 'white'}}>
        <p>Password</p>
        <input type="password" {...register("password", {
            required: true,
            minLength: 8,
            pattern : {
              value : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/i,
            }
          })}/>
      </label>
      {passwordRequired && <p  className='form-label-required'>This field is required</p>}
      {passwordLength && <p  className='form-label-required'>Must be at least 8 characters</p>}
      {passwordPattern && <p  className='form-label-required'>Must have upper, lower, number and special char</p>}
      <label style={{ color : 'white'}}>
        <p>Confirm Password</p>
        <input type='password'
            {...register("confirmPassword", {
              required: true,
              validate: (val) => {
                if (watch('password') != val) {
                  return "Your passwords do no match";
                }
              },
            })}
            />
      </label>
      {confirmpasswordRequired && <p  className='form-label-required'>This field is required</p>}
      {confirmpasswordMatch && <p  className='form-label-required'>Must match new password</p>}
        <div>
        <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
        </div>
      </form>
      {error && <p className='form-label-required'>${error}</p>}
    </div>
  )
}