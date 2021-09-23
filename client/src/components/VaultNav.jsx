import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import APIQueries from "../classes/APIQueries";

// Bootstrap Components
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Button from "react-bootstrap/Button";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";
import SearchBar from './SearchBar';

const VaultNav = ({ handleUploadFile, showFolders }) => {
    const [ showMenu, setShowMenu ] = useState(false);

    const handleLogout = () => {
        const token = sessionStorage.getItem("access-token"); 
        const user = JSON.parse(atob(sessionStorage.getItem('user')));
        const baseDirectory = user.folderName; 
        const email = user.email; 
        const apiQueries = new APIQueries(token);

        apiQueries.logoutAdmin(baseDirectory, email)
            .then(() => {
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("access-token");
            }).catch(_ => {
                console.log("Failed Logout! Token Still Valid");
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("access-token");
            }).finally(() => {
                window.location.href = `${window.location.origin}/`;
            })
    }

    const setMenu = () => {
        if (window.innerWidth <= 800) {
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    }

    useEffect(() => {
        window.addEventListener("resize", setMenu);
        setMenu();
    })

    const queryDirectory = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== "");

    return (
        <nav className={Styles.vault_main_nav}>
            <div className={Styles.vault_nav}>
            { showMenu ? (
                <div className={Styles.vault_nav_icon} onClick={() => {
                    showFolders()
                }}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
            ) : null }
            <div className={Styles.breadcrumb_container}>
                {
                    queryDirectory.length ? (
                        <Breadcrumb className={Styles.breadcrumb}>
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
            <div style={{ margin: "0px 5px" }} onClick={handleLogout}>
                <Button>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </Button>
            </div>
            </div>
            {/* <div className={Styles.vault_nav}>
                <SearchBar />
            </div> */}
        </nav>
    )
}

export default VaultNav; 