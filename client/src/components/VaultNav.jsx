import React, { useState } from 'react';

// Components
import UploadFile from "./UploadFile";

// Bootstrap Components
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Button from "react-bootstrap/Button";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";

const VaultNav = ({ handleUploadFile }) => {
    const queryDirectory = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== "");

    return (
        <nav className={Styles.vault_nav}>
            <div className={Styles.breadcrumb_container}>
                {
                    queryDirectory.length ? (
                        <Breadcrumb>
                            { queryDirectory.map((segment, idx) => {
                                return (
                                    <Breadcrumb.Item 
                                        active={idx === queryDirectory.length - 1} 
                                        key={idx} 
                                        href={`/vault?dir=${queryDirectory.slice(0, idx + 1).join("/").substring(2)}`}>
                                        {`${ idx === 0 ? "Root: " : segment.replace(/%20/g, ' ') }`}
                                    </Breadcrumb.Item>
                                )
                            })}
                        </Breadcrumb>
                    ) : null
                }
            </div>
            <div>
                <Button className={Styles.upload_button} onClick={() => {
                    handleUploadFile();
                }}>Upload File</Button>
            </div>
        </nav>
    )
}

export default VaultNav; 