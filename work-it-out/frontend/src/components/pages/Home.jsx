import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LOGOUT_USER, UPDATE_USER } from '../../store/types';

function Home() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector(state => state.user);

  useEffect(() => {

    const code = searchParams.get('code');
    const scope = searchParams.get('scope');
    if(code && scope) {
      axios.post('http://localhost:3001/user/getToken', {url : `http://localhost:5173/?code=${code}&scope=${scope}`, id : user._id}, { withCredentials: true }).then(res => {
        if(res.status === 200) {
          dispatch({type : UPDATE_USER, payload : res.data});
          navigate('/');
        }else{
          navigate('/');
        }
      }).catch(err => {
        console.log(err);
      })
    }
  }); 

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
        window.location.replace(`${res.data.url}`);
      }
    }).catch(err => {
      console.log(err);
    })
  }

  function exercises() {
    navigate('/exercises');
  }

  return(
    <div>
      <h1>Home</h1>
      <button className="nav-link" onClick={logout}>Logout</button>
      <button onClick={profile}>Profile</button>
      <button onClick={exercises}>Exercises</button>
      <button onClick={performance}>Performance</button>
      {(!user.syncActive) ? <button onClick={sync}>Sync with Google Fit</button> : <p>Google Fit Sync Active</p>}
    </div>
  );
}

export default Home;