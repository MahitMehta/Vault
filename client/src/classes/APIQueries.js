class APIQueries {
    constructor(token="") {
        this.token = token; 
    }

    async logoutAdmin(baseDirectory, userEmail) {
        const endpoint = `/api/auth/logoutAdmin?baseDirectory=${baseDirectory}&token=${this.token}`;

        const payLoad = JSON.stringify({
            email: userEmail,
        });

        const userAuth = await fetch(endpoint, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": payLoad
        });

        return userAuth; 
    }

    async loginAdmin(userEmail, pass) {
        const endpoint = "/api/auth/loginAdmin";

        const encodedCredentials = btoa(`${userEmail}:${pass}`);
        const token = `Basic ${encodedCredentials}`;
        const userAuth = await fetch(endpoint, {
            "credentials": "include",
            "method": "POST",
            "headers": {
                "Authorization": token
            }
        });
        return userAuth; 
    }

    async signUp(userEmail, pass) {
        const endpoint = "/api/auth/signup";

        const encodedCredentials = btoa(`${userEmail}:${pass}`);
        const token = `Basic ${encodedCredentials}`;
        const userAuth = await fetch(endpoint, {
            "credentials": "include",
            "method": "POST",
            "headers": {
                "Authorization": token
            }
        });
        return userAuth; 
    }

    async loadFolders(baseDirectory, directory, userId) {
        const encryptedUserId = btoa(userId);
        const endpoint = `/api/aws/getAllFolders?baseDirectory=${baseDirectory}&directory=${directory}&userId=${encryptedUserId}&token=${this.token}`;  
        const request = fetch(endpoint, {
            "credentials": 'same-origin',
            "method": "GET",
            "headers": {
                'Accept': 'application/json'
            }
        });


        return request; 
    }

    async validateLogin(baseDirectory) {
        const endpoint = `/api/auth/validateLogin?baseDirectory=${baseDirectory}&token=${this.token}`;

        const response = fetch(endpoint, {
            "credentials": "include",
            'method': "GET",
        });

        return response; 
    }

    async loadAWSBuckets(bucketName, location) {
        const endpoint = "/api/aws/createBucket";

        const body = {
            "name": bucketName,
            "location": location
        }

        const bucketRequest = await fetch(endpoint, {
            "credentials": "include",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(body)
        });
        return bucketRequest; 
    }


    async createFolder(folderName, userId, baseDirectory, directory) {
        const endpoint = `/api/aws/createFolder?baseDirectory=${baseDirectory}&directory=${directory}&token=${this.token}`;
    
        const body = {
            "name": folderName,
            "userId": userId,
        }

        const folderRequest = await fetch(endpoint, {
            "credentials": "include",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(body)
        });
        return folderRequest; 
    }

    async loadFiles(directory, baseDirectory) {
        const endpoint = `/api/aws/getAllFiles?baseDirectory=${baseDirectory}&directory=${directory}&token=${this.token}`;

        const filesRequest = await fetch(endpoint, {
            "credentials": "include",
            "method": "GET"
        });
        return filesRequest; 
    }

    async uploadFiles(files, fileName, baseDirectory, directory) {
        const endpoint = `/api/aws/uploadFiles?baseDirectory=${baseDirectory}&directory=${directory}&fname=${fileName}&token=${this.token}`;

        const filesPost = await fetch(endpoint, {
            "credentials": "include",
            "method": "POST",
            "body": files
        });
        return filesPost; 
    }
}

export default APIQueries;