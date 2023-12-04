import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {useForm} from 'react-hook-form';
import Button from 'react-bootstrap-button-loader';


import axios from 'axios';

export default function PasswordReset({ props }) {
  const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams()
    const [successData, setData] = useState();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [resetComplete, setResetComplete] = useState(false);

    const passwordRequired = errors.password && errors.password.type === "required";
    const passwordLength = errors.password && errors.password.type === "minLength";
    const passwordPattern = errors.password && errors.password.type === "pattern";

    const confirmpasswordRequired = errors.confirmPassword && errors.confirmPassword.type === "required";
    const confirmpasswordMatch = errors.confirmPassword && errors.confirmPassword.type === "validate";

    const { token } = useParams();
    const {state} = useLocation();

    const navigate = useNavigate();
    const user = useSelector(state => state.authenticated);
  
    useEffect(() => {
      if(user) {
        navigate('/');
      }
    }, [user]);

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
        axios.post('http://localhost:3001/user/passwordresetconfirm', data).then(res => {
          setLoading(false);
          if(res.status === 200) {
              setResetComplete(true);
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

    function checkNumber(id, cb) {
      if (!id) return cb(null, new Error("id Missing"));
      axios.get(`http://localhost:3001/user/${id}/phonenumber/`, { withCredentials: true }).then(res => {
        if(res.data.phoneNumber) {
          return cb(res.data.phoneNumber, null);
        }
        return cb(null, null);
      }).catch(err => {
        console.log(err.response.data);
        if(err.response.data && err.response.data.message) {
          setError(err.response.data.message);
          return cb(null, err.response.data.message);
        }else {
          setError('Error retrieving user information');
        }
        return cb(null, 'Error retrieving user information');
      });
    }

   function resetpassword(data) {
    const {password} = data;

    const id = searchParams.get('id');
    const email = searchParams.get('email');

      if (loading) return;

       setLoading(true);
      
      checkNumber(id, (phonenumber, err) => {
        if(err) {
          setLoading(false);
          setError(err);
          return;
        }else {
          if(!phonenumber) {
            axios.post('http://localhost:3001/user/passwordresetconfirm', {id : id, token : token, password : password }).then(res => {
              setLoading(false);
              if(res.status === 200) {
                  setResetComplete(true);
              }
            }).catch(err => {
              setLoading(false);
              setError(err.response.data.message);
            });
          }else {
            const data = {id : id, token : token, password : password};
            axios.post(`http://localhost:3001/user/sendcode`, {id :  id, phonenumber : phonenumber }).then(res => {
              if(res.status === 200) {
                  navigate(`/verifycode/${id}`, {state : {codeSent: true, phonenumber :phonenumber, data : data, callback : `/resetpassword/${token}?id=${id}&email=${email}`}, replace : true});
                }
            }).catch(err => {
              console.log(err);
              console.log(err.message);
            });
          }
        }
      })
    }

  return(
    <>
    {
     resetComplete ?    
     <h2 style={{ color : 'white'}}> Password reset complete, try logging in now.</h2>    
    : 
     <div className="login-wrapper">
    <h1>Please Reset Password</h1>
    <form onSubmit={handleSubmit(resetpassword)}>
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
      {confirmpasswordMatch && <p className='form-label-required'>This field must match password field</p>}
      <div>
      <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
      </div>
    </form>
    {error && <p className='form-label-required' >${error}</p>}
  </div>
    }

    </>

  )
}