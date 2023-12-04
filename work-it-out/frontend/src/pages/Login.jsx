import React from 'react';
import './login.css';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import {useForm} from 'react-hook-form';
import { LOGIN_USER } from '../store/types';
import Button from 'react-bootstrap-button-loader';


function Login() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const {state} = useLocation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRequired = errors.email && errors.email.type === "required";
  const passwordRequired = errors.password && errors.password.type === "required";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(state => state.authenticated);
  
  useEffect(() => {
    if(user) {
      navigate('/');
    }

    // if 2fa authenticated, and state exists, dispatch login
    if(state && state.successData) {
      const data = JSON.parse(state.successData);
      dispatch({ type: LOGIN_USER, payload : data });
      navigate("/");
    }

  }, [user]);

  function checkUserStatus(email, cb) {
    if (!email) return false;

    axios.get(`http://localhost:3001/user/is-verified/${email}`, { withCredentials: true }).then(res => {
      if(res.data.verified) {
        return cb(true);
      }
      return cb(false);
    }).catch(err => {
      setError(err.response.data.message);
    });
  }

   function login(data) {
    if(loading) return;
    setLoading(true);
    const {email, password} = data;
      axios.post('http://localhost:3001/user/login', {email : email, password : password}, { withCredentials: true }).then(res => {
        if(res.data.token && res.data.user) {
          checkUserStatus(email, (verified) => {
            setLoading(false);
            if(verified) {
              if(res.data.user.accountStatus >= 3) {
                const data = res.data;
                axios.post(`http://localhost:3001/user/sendcode`, {id :  res.data.user._id, phonenumber : res.data.user.phoneNumber }).then(res => {
                  if(res.status === 200) {
                      navigate(`/verifycode/${data.user._id}`, {state : {codeSent: true, phonenumber :data.user.phoneNumber, data : data, callback : '/login'}, replace : true});
                    }
                }).catch(err => {
                  console.log(err);
                  console.log(err.message);
                });
              }else{
                dispatch({ type: LOGIN_USER, payload : res.data });
                navigate("/");
              }
            }else{
              setLoading(false);
              setError("Verify your account before logging in.");
            }
          
          });
        }
      }).catch(err => {
        setLoading(false);
        setError(err.response.data.message);
      });

    }
  return(
    <div className="login-wrapper">
       <h1>Please Log In</h1>
      <form onSubmit={handleSubmit(login)}>
        <label>
          <p>Email</p>
          <input
            type="text"
            {...register("email", {
              required: true,
            })}
          />
        </label>
        {emailRequired && <p  className='form-label-required'>This field is required</p>}
        <label>
          <p>Password</p>
          <input type="password" {...register("password", {
            required: true,            
          })}/>
        </label>
        {passwordRequired && <p  className='form-label-required'>This field is required</p>}
        <div>
        <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
        </div>
      </form>
      {error && <p className='form-label-required' >${error}</p>}
      <Link to="/forgotpassword" >Forgot password?</Link>
      <Link to="/register" >Sign up</Link>
    </div>
  )
}
export default Login;