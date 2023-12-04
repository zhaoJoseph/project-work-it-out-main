import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap-button-loader';

function Verify() {

    const { token } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const [verifcationComplete, setVerificationComplete] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    

    function checkUserStatus(email, cb) {
        if (!email) return false;
    
        axios.get(`http://localhost:3001/user/is-verified/${email}`).then(res => {
            if(res.data) {
                return cb(res.data.verified);
            }else{
                return cb(false);
            }
        }).catch(err => {
          setError(err.response.data.message);
        });
      }

    function activateUser(event) {
        event.preventDefault();
      if(loading) return;
      setLoading(true);
        const id = searchParams.get('id');
        axios.post(`http://localhost:3001/user/${id}/activate`, {token : token}).then(res => {
            if(res.data.user) {
              checkUserStatus(res.data.user.email, (verified) => {
                if(verified) {
                  setVerificationComplete(true);
                }
                setLoading(false);
              });
            }
          }).catch(err => {
            setError(err.response.data.message);
            setLoading(false);
          });
    }
  return(
    <> 
    {verifcationComplete 
    ? <h2 style={{ color : 'white'}}> Thank you for verifying your email. You can close this and login now.</h2>
    :         
    <form onSubmit={activateUser}>
    <div>
    <Button style={{backgroundColor : 'green'}} loading={loading} type="submit">Submit</Button>
    </div>
    </form>

    }
    {error && <p className='form-label-required'>${error}</p>}
    </>
 
  );
}

export default Verify;