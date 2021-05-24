import React, { useState, useRef } from 'react';

import { Redirect } from "react-router-dom";
import APIQueries from "../classes/APIQueries";
import { SHA256 } from "crypto-js";

// Bootstrap Components
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

// Styles
import Styles from "../styles/styles.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const SignUp = () => {
    const [ signedUpMsg, setSignedUpMsg ] = useState("");
    const [ SignedUpIn, setSignedUp ] = useState(false);

    const userEmail = useRef();
    const userPass = useRef();
    const userConfirmationPass = useRef();

    const handleSignUp = () => {
        const email = userEmail.current.value; 
        const pass = userPass.current.value; 
        const confirmationPass = userConfirmationPass.current.value; 
        const emailRegex = /^([A-z.0-9]+)@([A-z0-9]+)\.([A-z0-9.]+)$/;

        if (!email || !pass || !confirmationPass) {
            setSignedUpMsg("Invalid Field Values!");
            return; 
        } else if (!emailRegex.test(email)) {
            setSignedUpMsg("Poorly Formatted Email!");
            return; 
        } else if (pass !== confirmationPass) {
            setSignedUpMsg("Passwords Don't Match");
            return; 
        } else if (pass.length < 8) {
            setSignedUpMsg("Weak Password!");
            return; 
        } else {
            setSignedUpMsg("");
        }

        const hashedPass = SHA256(confirmationPass).toString();
        const apiQueries = new APIQueries();
        apiQueries.signUp(email, hashedPass)
            .then((res) => res.json())
            .then(({ success, code }) => {
                if (success) {
                    setSignedUp(true);
                } else {
                    switch(code) {
                        case "USER-EXISTS": {
                            setSignedUpMsg("Account Already Exists");
                            return; 
                        } 
                        default:  setSignedUpMsg("Error Signing Up!");
                    }
                }
            }).catch(() => {
                setSignedUpMsg("Error Signing Up!");
            });
    }

    return ( !SignedUpIn ? (
            <section className={Styles.form_section}>
                <Form className={Styles.form_wrapper}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Control ref={userEmail} className={Styles.form_input} autoComplete="off" type="email" placeholder="example@gmail.com" />
                    </Form.Group>
    
                    <Form.Group controlId="formBasicPassword">
                        <Form.Control ref={userPass} className={Styles.form_input} autoComplete="off" type="password" placeholder="Password" />
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                        <Form.Control ref={userConfirmationPass} className={Styles.form_input} autoComplete="off" type="password" placeholder="Confirm Password" />
                    </Form.Group>
                    { signedUpMsg ? (
                        <Alert className={Styles.alert_err} variant="danger" style={{ whiteSpace: "nowrap" }}>
                        { signedUpMsg }
                        </Alert>
                    ) : "" } 
                    <Button className={Styles.access_vault} onClick={handleSignUp} >Create Vault</Button>
                </Form>
            </section>
        ) : <Redirect to="/" />
    )
}

export default SignUp; 