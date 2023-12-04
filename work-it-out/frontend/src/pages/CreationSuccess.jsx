import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function CreationSuccess() {

    const navigate = useNavigate();
    const user = useSelector(state => state.authenticated);
  
    useEffect(() => {
      if(user) {
        navigate('/');
      }
    }, [user]);

    const [searchParams, setSearchParams] = useSearchParams()

  return(
    <>
    {
        (searchParams.get('passwordreset')) ? <h2 style={{ color : 'white'}}>Password reset! Check Email for reset link!</h2> :  <h2 style={{ color : 'white'}}> Account Successfully created! Check Email for verification link!</h2>
    }
    </>

  );
}

export default CreationSuccess;