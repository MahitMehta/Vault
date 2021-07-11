import React, { useEffect, useState, useCallback } from "react";
import APIQueries from "../classes/APIQueries";
import { Redirect } from "react-router-dom";

// Components
import CreateBucket from "./CreateFolder";
import PageAlert from "./Alert";
import VaultNav from "./VaultNav";
import AWSObject from "./AWSObject";
import FileView from "./FileView";

// Bootstrap Components
import Button from "react-bootstrap/Button";

// Styles
import Styles from "../styles/styles.module.scss";
import UploadFile from "./UploadFile";

const Vault = () => {
    const [ isAlert, setIsAlert ] = useState(false); 
    const [ alertData, setAlertData ] = useState({});

    const [ loadedFolders, setLoadedFolders ] = useState(false);
    const [ loadedFoldersUL, setLoadedFoldersUL ] = useState([]);
    const [ createBucket, setCreateBucket ] = useState(false);

    if (window.location.href.split("dir=").length <= 1) {
        window.location.href = `${window.location.origin}/vault?dir=`;
    }

    const [ directory ] = useState(['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== ""));
    const [ files, setFiles ] = useState([]);
    const [ noFiles, setNoFiles ] = useState(false);
    const [ uploadFile, setUploadFile ] = useState(false);
    const [ validLogin, setValidLogin ] = useState(false);
    const [ loginInvalid, setLoginInvalid ] = useState(false);
    const [ folders, setFolders ] = useState([]);
    const [ showFileView, setShowFileView ] = useState(false);
    const [ currentFileInfo, setCurrentFileInfo ] = useState({});
    const [ showFolders, setShowFolders] = useState(false);

    const handleLoadFiles = useCallback(() => {
        const token = sessionStorage.getItem('access-token');
        if (!token) {
            setValidLogin(false);
            setLoginInvalid(true);
            return; 
        }

        const apiQueries = new APIQueries(token);
        const tempDirectory = [].concat(directory);
        const currentDirectory = directory.length && directory.length !== 1 ? `${tempDirectory.join("-")}/` : "BASE";
        const userData = JSON.parse(atob(sessionStorage.getItem('user'))); 
        const baseDirectory = userData.folderName; 
    
        apiQueries.loadFiles(currentDirectory, baseDirectory, userData.userId)
            .then(res => res.json())
            .then(data => {
                if (data.data.length) {
                    setFiles(data.data);
                }
            }).catch(() => {
                setNoFiles(true);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directory, folders]);

    const handleLoadFolders = useCallback(() => {
        const token = sessionStorage.getItem('access-token');
        if (!token) {
            setValidLogin(false);
            setLoginInvalid(true);
            return; 
        }

        const apiQueries = new APIQueries(token);

        // let adjustedDir = directory; 
        // if (directory[0] === "/") adjustedDir.shift();
        
        const queryDirectory = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== "");
        const currentDirectory = queryDirectory.length && queryDirectory.length !== 1 ? `${queryDirectory.join("-").substring(2)}/` : "BASE";
        const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
    
        const baseDirectory = user.folderName; 
        const userId = user.userId; 
        apiQueries.loadFolders(baseDirectory, currentDirectory, userId)
            .then(res => res.json())
            .then(({ directories }) => {
                if (directories.length) {
                    const dirs = directories.map(dir => {
                        const dirSplitted = dir.split('/');
                        dirSplitted.pop();
                        const dirName = dirSplitted.pop();
                        return dirName; 
                    });
                    setLoadedFolders(true);
                    setLoadedFoldersUL(dirs)
                } else {
                    setLoadedFolders(true);
                    setLoadedFoldersUL([])
                }
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ directory, folders ]);

    const handleValidLogin = () => {
        const token = sessionStorage.getItem('access-token');
        if (!token) {
            setValidLogin(false);
            setLoginInvalid(true);
            return; 
        }

        const apiQueries = new APIQueries(token);

        const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
        const baseDirectory = user.folderName; 
        apiQueries.validateLogin(baseDirectory)
            .then(res => res.json())
            .then(({ access }) => {
                if (access) {
                    setValidLogin(true);
                    setLoginInvalid(false);
                } else {
                    setValidLogin(false);
                    setLoginInvalid(true);
                }
            }); 
    }

    useEffect(() => {
        if (!validLogin && !loginInvalid) {
            handleValidLogin();
        }

        if (!files.length && !noFiles) {
            handleLoadFiles();
        } 

        if (validLogin) {
            handleLoadFolders();
        }
    }, [loadedFolders, files, noFiles, handleLoadFiles, validLogin, loginInvalid, handleLoadFolders]);

    const desktop = () => {
        if (window.innerWidth > 800) {
            return true; 
        }
        return false; 
    }

    const setMenu = () => {
        if (window.innerWidth > 800 && !showFolders) {
            setShowFolders(true);
            return true; 
        }
        return false; 
    }

    useEffect(() => {
        window.addEventListener("resize", setMenu);
        setMenu();
    })

    const alertHandler = () => {
        setIsAlert(true);
    }
    return (
        !loginInvalid ? (
            <React.Fragment>
                <PageAlert isAlert={isAlert} error={alertData.error} message={alertData.message} alertDone={() => {
                    setIsAlert(false);
                    setAlertData({});
                }} />
                <UploadFile showCreateBucket={uploadFile} handleBucketClose={(success) => {
                    if (success) {
                        handleLoadFiles();
                        setAlertData({ message: "File(s) Succesfully Uploaded!" })
                        alertHandler();
                        setIsAlert(false);
                    }
                    setUploadFile(false);
                }    
                } directory={directory}
                    handleFalseLogin={() => {
                        setValidLogin(false);
                        setLoginInvalid(true);
                    }} />;
                <CreateBucket 
                    showCreateBucket={createBucket} 
                    handleFalseLogin={() => {
                        setValidLogin(false);
                        setLoginInvalid(true);
                    }}
                    handleBucketClose={(success) => {
                    if (success) {
                        setFolders(['tempFolder'].concat(folders));
                        setAlertData({ message: "Folder Succesfully Created!" })
                        alertHandler();
                    }
                    setCreateBucket(false)}
                } directory={directory} />;
                <FileView 
                    fileName={ currentFileInfo.fileName }
                    showFileView={showFileView}
                    hideFileView={() => {
                        setShowFileView(false);
                    }}
                    handleFalseLogin={() => {
                        setValidLogin(false);
                        setLoginInvalid(true);
                    }}
                    setAlert={(message) => {
                        setAlertData({ message, error: true })
                        alertHandler();
                    }}
                />
        
                { validLogin ? (
                        <main className={Styles.vault_display}>
                        <section className={Styles.buckets} style={showFolders ? { transform: `translate(0px, ${showFolders && desktop() ? "0px" : "80px"})`, padding: "15px"} : { transform: `translate(-230px, ${setMenu() ? "0px" : "80px"})`, padding: "15px"} }>
                        <Button onClick={() => setCreateBucket(true)}>Create Folder</Button>
                        <ul className={Styles.bucket_list}>
                            { loadedFoldersUL.map((folder, idx ) => {
                                return (
                                    <li key={idx} className={Styles.loaded_folder} onClick={() => {
                                            const origin = window.location.origin; 
                                            const dir = window.location.href.split('dir=')[1];
                                            window.location.href = `${origin}/vault?dir=${directory.filter(dir => dir !== "/").join('/')}${dir ? "/" : ""}${folder}`;
                                            // setFiles([]);
                                            // setDirectory(directory.concat(folder));
                                        }}>
                                    { folder }
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                    <section className={Styles.bucket_files}>
                        <VaultNav handleUploadFile={() => {
                            setUploadFile(true);
                        }} showFolders={() => {
                            setShowFolders(!showFolders);
                        }} />
                        <div className={Styles.objectContainer}>
                            { files.filter(file => {
                                const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
                                const baseDirectory = user.folderName;
                                const searchKey = "";
                                return file.startsWith(`${baseDirectory}/${searchKey}`);
                            }).map((file, idx) => {
                                
                                return <AWSObject key={idx} file={file} handleClick={(fname) => {
                                    setCurrentFileInfo({ fileName: fname })
                                    setShowFileView(true);
                                }}/>
                            })}
                        </div>
                        { loadedFoldersUL.length || files.length ? null : (
                            <p className={Styles.no_buckets}>Create a New Folder.</p>
                        )}
                    </section>
                    </main>
                ) : null }
            </React.Fragment>
        ) : <Redirect to="/" />
    )
}

export default Vault; 