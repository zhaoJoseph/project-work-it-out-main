import React, { useState } from "react";
import { useCountdown } from "./CountDown";
import './Countdown.css';

const Expired = () => {
    return (
        <div>
            <span>Code expired please create another code.</span>
        </div>
    )
}

const DateTimeDisplay = ({ value, type, }) => {
    return (
      <div className="display">
        <p>{value}</p>
        <span>{type}</span>
      </div>
    );
};

const ShowCounter = ({ seconds, minutes }) => {
    return (
        <div className="show-counter">
            <DateTimeDisplay value={seconds} type={'Mins'} />
            <DateTimeDisplay value={minutes} type={'Seconds'} />
        </div>
      );
}

const CountDownTimer = ({targetDate, useCallback}) => {
    const [seconds, minutes] = useCountdown(targetDate);
    if (minutes + seconds <= 0) {
          useCallback(minutes + seconds);
        return <Expired />;
      } else {
        return (
          <ShowCounter
            minutes={minutes}
            seconds={seconds}
          />
        );
      }
}

export default CountDownTimer;