import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from 'axios';
import { UPDATE_USER } from '../store/types';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';


export default function UpdateEmail() {
  const [error, setError] = useState("");
  const {state} = useLocation();

    const [loading, setLoading] = useState(false);
    const [successData, setData] = useState();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const emailRequired = errors.email && errors.email.type === "required";
    const emailPattern = errors.email && errors.email.type === "pattern";


    const newemailRequired = errors.newEmail && errors.newEmail.type === "required";
    const newemailPattern = errors.newEmail && errors.newEmail.type === "pattern";

    const dispatch = useDispatch();

    const navigate = useNavigate();

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
          setError("New Email updated.");
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


   function saveEmail(data) {

    const {email, newEmail} =  data;

      if( email !== user.email){
        setError("Current email not correct.");
        return;
      }else if (newEmail === user.email) {
        setError("Use a new email to change to.");
        return;
      }
      if (loading) return;

      setLoading(true);
      // 2FA authenticate
      if(user.accountStatus >= 3) {
        const data = {email : newEmail};
        axios.post(`http://localhost:3001/user/sendcode`, {id :  user._id, phonenumber : user.phoneNumber }).then(res => {
          if(res.status === 200) {
              navigate(`/verifycode/${user._id}`, {state : {codeSent: true, phonenumber :user.phoneNumber, data : data, callback : '/updateemail', replace : true}});
            }
        }).catch(err => {
          console.log(err);
          console.log(err.message);
        });
      }else{
       axios.put(`http://localhost:3001/user/${user._id}`, {email : newEmail}, {withCredentials : true}).then(res => {
         setLoading(false);
         if(res.data.user) {
           // display that new email was saved
           dispatch({type : UPDATE_USER, payload : res.data})
           setError("New Email updated.");
         }
       }).catch(err => {
         setLoading(false);
         setError(err.response.data.message);
       });
      }

    }

  return(
    <div className="login-wrapper">
      <h1>Please Save new Email</h1>
      <form onSubmit={handleSubmit(saveEmail)}>
      <label style={{ color : 'white'}}>
          <p>Current Email</p>
          <input
            type="text"
            {...register("email", {
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address"
              }
            })}
          />
        </label>
        {emailRequired && <p  className='form-label-required'>This field is required</p>}
        {emailPattern && <p  className='form-label-required'>Invalid Email Address</p>}
      <label style={{ color : 'white'}}>
          <p>New Email</p>
          <input
            type="text"
            {...register("newEmail", {
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "invalid email address"
              }
            })}
          />
        </label>
        {newemailRequired && <p  className='form-label-required'>This field is required</p>}
        {newemailPattern && <p  className='form-label-required'>Invalid Email Address</p>}
        <div>
        <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
        </div>
      </form>
      {error && <p className='form-label-required'>${error}</p>}
    </div>
  )
}