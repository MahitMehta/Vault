import React, { useRef, useState } from 'react';
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

const Login = () => { 

    const [ loginMsg, setLoginMsg ] = useState("");
    const [ loggedIn, setLoggedIn ] = useState(false);

    const loginEmail = useRef();
    const loginPass = useRef();

    const loginHandler = () => {
        const email = loginEmail.current.value; 
        const pass = loginPass.current.value; 
        if (!email || !pass) {
            setLoginMsg("Access Denied!");
            setLoggedIn(false);
            return;
        }

        const apiQueriesObj = new APIQueries();

        const hashedPass = SHA256(pass).toString();

        apiQueriesObj.loginAdmin(email, hashedPass)
        .then(res => res.json())
        .then(({ access, user, token }) => {
            if (!access) {
                setLoginMsg("Access Denied!");
            } else {
                sessionStorage.setItem("access-token", token);
                sessionStorage.setItem("user", user);
                setLoginMsg("");
                setLoggedIn(access);
            }
        })
        .catch(_ => {
            setLoginMsg("Access Denied!");
            setLoggedIn(false);
        })
    }

    return !loggedIn ? (
        <section className={Styles.form_section}>
            <Form className={Styles.form_wrapper}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Control className={Styles.form_input} ref={loginEmail} autoComplete="off" type="email" placeholder="example@gmail.com" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Control className={Styles.form_input} ref={loginPass} autoComplete="off" type="password" placeholder="Password" />
                    {/* <Form.Text className="text-muted" style={{ cursor: "pointer" }}>
                        Forgot Password?
                    </Form.Text> */}
                </Form.Group>
                { loginMsg ? (
                    <Alert className={Styles.alert_err} variant="danger">
                    { loginMsg }
                    </Alert>
                ) : "" } 
                <Button className={Styles.access_vault} onClick={loginHandler}>Access Vault</Button>
            </Form>
            <a href="/createAccount" className={Styles.createAccount}>Create Account</a>
        </section>
    ) : <Redirect to="/vault" />
}

export default Login; 