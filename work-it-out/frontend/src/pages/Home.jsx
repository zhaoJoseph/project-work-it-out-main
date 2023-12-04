import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LOGOUT_USER } from '../store/types';


function Home() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function logout() {
    axios.get('http://localhost:3001/user/signout', { withCredentials: true }).then(res => {
      if(res.status === 200) {
        console.log("Signed out!");
      }
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      dispatch({
        type: LOGOUT_USER,
      }); 
      navigate('/login');
    });

  }

  function profile() {
    navigate('/profile');
  }

  function performance() {
    navigate('/performance');
  }

  function sync() {
    axios.get('http://localhost:3001/user/googlefit', { withCredentials: true }).then(res => {
      if(res.status === 200) {
        console.log(res.data);
      }
    }).catch(err => {
      console.log(err);
    })
  }

  return(
    <div>
      <h1>Home</h1>
      <button className="nav-link" onClick={logout}>Logout</button>
      <button onClick={profile}>Profile</button>
      <button onClick={performance}>Performance</button>
      <button onClick={sync}>Sync with Google Fit</button>
    </div>
  );
}

export default Home;