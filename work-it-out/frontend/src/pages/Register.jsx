import './register.css'
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from 'axios';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';

export default function Register({ props }) {


  const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const nameRequired = errors.name && errors.name.type === "required";
    const namePattern = errors.name && errors.name.type === "pattern";
    const nameLength = errors.name && errors.name.type === "minLength";

    const emailRequired = errors.email && errors.email.type === "required";
    const emailPattern = errors.email && errors.email.type === "pattern";

    const passwordRequired = errors.password && errors.password.type === "required";
    const passwordLength = errors.password && errors.password.type === "minLength";
    const passwordPattern = errors.password && errors.password.type === "pattern";

    const confirmpasswordRequired = errors.confirmPassword && errors.confirmPassword.type === "required";
    const confirmpasswordMatch = errors.confirmPassword && errors.confirmPassword.type === "validate";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    
    const user = useSelector(state => state.authenticated);
  
    useEffect(() => {
      if(user) {
        navigate('/');
      }
    }, [user]);

   function registerUser(data) {

    const {email, name, password} = data;

    if(loading) return;

       setLoading(true);
      axios.post('http://localhost:3001/user/register', {email : email, password : password, name : name}).then(res => {
        setLoading(false);
        if(res.data.user) {
          navigate("/creationsuccess");
        }
      }).catch(err => {
        setLoading(false);
        setError(err.response.data.message);
      });

    }

  return(
    <div className="form-wrapper">
      <h1>Please Register</h1>
      <form onSubmit={handleSubmit(registerUser)}>
      <label className='form-label'>
          <p>Name</p>
          <input type="text" {...register("name", {
            required: true,
            pattern: /^[A-Za-z]+$/i,
            minLength: 2
          })}/>
          {nameRequired && <p  className='form-label-required'>This field is required</p>}
          {namePattern && <p  className='form-label-required'>Alphabetical characters only</p>}
          {nameLength && <p  className='form-label-required'>Must be at least 2 characters</p>}
        </label>
      <label  className='form-label'>
          <p>Email</p>
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
        </label>
        <label  className='form-label'>
          <p>Password</p>
          <input type="password" {...register("password", {
            required: true,
            minLength: 8,
            pattern : {
              value : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/i,
            }
          })}/>
          {passwordRequired && <p  className='form-label-required'>This field is required</p>}
          {passwordLength && <p  className='form-label-required'>Must be at least 8 characters</p>}
          {passwordPattern && <p  className='form-label-required'>Must have upper, lower, number and special char</p>}
        </label>
        <label  className='form-label'>
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
            {confirmpasswordRequired && <p  className='form-label-required'>This field is required</p>}
            {confirmpasswordMatch && <p className='form-label-required'>This field must match password field</p>}
        </label>
        <div>
          <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
        </div>
      </form>
      {error && <p className='form-label-required'>${error}</p>}
      <Link to="/login" >Sign in</Link>
    </div>
  )
}