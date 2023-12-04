import PhoneInput, {isPossiblePhoneNumber} from 'react-phone-number-input';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import "react-phone-number-input/style.css";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Button from 'react-bootstrap-button-loader';


export default function SMSForm() {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const user = useSelector(state => state.user);

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm()
    
    const onSubmit = (data) => {
        if(loading) return;

        setLoading(true);
        axios.post(`http://localhost:3001/user/sendcode`, {id :  user._id, phonenumber : data['phone-input'] }).then(res => {
            setLoading(false);
            if(res.status === 200) {
                setLoading(false);
                navigate(`/verifycode/${user._id}`, {state : {codeSent: true, phonenumber : data['phone-input']}});
            }
          }).catch(err => {
            console.log(err.message);
            setLoading(false);
          });
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='sms-form'>
            <h1>Phone number</h1>
                <Controller
                name="phone-input"
                control={control}
                rules={{ validate: (value) => isPossiblePhoneNumber(`${value}`)}}
                render={({ field: { onChange, value } }) => (
                    <PhoneInput
                    value={value}
                    onChange={onChange}
                    defaultCountry="CA"
                    id="phone-input"
                    />
                )}
                />
                {errors["phone-input"] && (
                <p className="error-message">Invalid Phone Number.</p>
                )}            
            <Button type='submit' style={{backgroundColor : 'green'}} loading={loading}>Submit</Button>
        </form>
        </div>
    )
};