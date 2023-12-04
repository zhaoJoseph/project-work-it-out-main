import './profile.css';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DESTROY_USER } from '../store/types';
import { useNavigate } from 'react-router-dom';

function Profile() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(state => state.user);

    function deleteAccount() {

        if(confirm("Warning this cannot be undone and will delete everything, are you sure?")){
            axios.delete(`http://localhost:3001/user/${user._id}`, {withCredentials: true}).then(res => {
                if(res.status === 200) {
                  console.log("Signed out!");
                }
                dispatch({
                  type: DESTROY_USER,
                })
                navigate('/login', {replace : true});
              });
        } 
    }

    function SMS() {
      navigate(`/activate2fa`);
    }

    function disable2fa() {
      navigate('/disable2fa');
    }

  return(
    <h2 >Profile
    <div className='profile'>
      <a href="/updateemail" className="nav-link">
      Change Email 
      </a>
      <a href="/updatepassword" className="nav-link">
      Update Password
      </a>
      <button className="nav-link" onClick={deleteAccount}>
      Delete Account
      </button>
      <button className="nav-link" onClick={SMS}>
      Activate/Update 2FA
      </button>
      {
        (user.accountStatus >= 3) &&
        <button className="nav-link" onClick={disable2fa}>
        Disable 2FA
        </button>
      }

    </div>
    </h2>
  );
}

export default Profile;