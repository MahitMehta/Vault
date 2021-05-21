import React, { useEffect, useRef } from 'react';
import { gsap } from "gsap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faTimes } from "@fortawesome/free-solid-svg-icons";

// Styles 
import Styles from "../styles/styles.module.scss";

// Bootstrap Components
import Alert from "react-bootstrap/Alert";

const PageAlert = ({ isAlert, error, message, alertDone }) => {
    const AlertElement = useRef();

    useEffect(() => {
        if (!isAlert) return;

        gsap
        .fromTo(AlertElement.current, 
            { y: -100, opacity: 0, pointerEvents: "none"}, 
            { y: 0, opacity: 1, pointerEvents: "initial", duration: 0.25}).eventCallback("onComplete", () => {
                setTimeout(alertCloseHandler, 2.5 * 1000);
            });
    });

    const alertCloseHandler = () => {
        gsap.to(AlertElement.current, 0.25, 
            { y: -100, opacity: 0, pointerEvents: "none" }).eventCallback("onComplete", () => {
                alertDone();
            });
    }

    const alertCloseHandlerDisappear = () => {
        gsap.to(AlertElement.current, 0.25, 
            { y: -100, opacity: 0, pointerEvents: "none" })
    }

    return (
        <Alert ref={AlertElement} className={Styles.alert} variant={ error && error !== null ? "danger" : "success" }>
            <div onClick={() => {
                alertCloseHandlerDisappear();
            }} className={Styles.alert_close_icon}>
                {/* <FontAwesomeIcon icon={faTimes} /> */}
            </div>
            { message ? message : "There was an Error!"}
        </Alert>
    )
}

export default PageAlert; 