import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';

import axios from 'axios';

export default function ResetPasswordRequest({ props }) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const emailRequired = errors.email && errors.email.type === "required";
    const emailPattern = errors.email && errors.email.type === "pattern";

    const navigate = useNavigate();
    
    const user = useSelector(state => state.authenticated);
  
    useEffect(() => {
      if(user) {
        navigate('/');
      }
    }, [user]);


   function resetpassword(data) {

      if (loading) return;

    const {email}  = data;

       setLoading(true);
      axios.post('http://localhost:3001/user/passwordreset', {email : email}).then(res => {
        setLoading(false);
        if(res.status === 200) {
          navigate("/creationsuccess?passwordreset=1");
        }
      }).catch(err => {
        setLoading(false);
        setError(err.response.data.message);
      });

    }

  return(
    <div className="login-wrapper">
      <h1>Please Enter Email</h1>
      <form onSubmit={handleSubmit(resetpassword)}>
      <label style={{ color : 'white'}}>
          <p>Email for password reset</p>
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
          {emailRequired && <p  className='form-label-required'>This field is required</p>}
          {emailPattern && <p  className='form-label-required'>Invalid Email Address</p>}
        </label >
        <div>
        <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
        </div>
      </form>
      {error && <p className='form-label-required' >${error}</p>}
    </div>
  )
}