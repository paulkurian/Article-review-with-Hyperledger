[//]: # (SPDX-License-Identifier: CC-BY-4.0)

## Hyperledger Fabric Samples

Please visit the [installation instructions](http://hyperledger-fabric.readthedocs.io/en/latest/install.html)
to ensure you have the correct prerequisites installed. Please use the
version of the documentation that matches the version of the software you
intend to use to ensure alignment.

## Download Binaries and Docker Images

The [`scripts/bootstrap.sh`](https://github.com/hyperledger/fabric-samples/blob/release-1.3/scripts/bootstrap.sh)
script will preload all of the requisite docker
images for Hyperledger Fabric and tag them with the 'latest' tag. Optionally,
specify a version for fabric, fabric-ca and thirdparty images. Default versions
are 1.4.0, 1.4.0 and 0.4.14 respectively.

```bash
./scripts/bootstrap.sh [version] [ca version] [thirdparty_version]
```

## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

##Setting up the Hyperledger Fabric network

Open basic-network as cwd

Run: ./generate

Then set the secret key value in the path FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/<Secret-Key> in docker-compose.yml file (present in basic network) as the name of the secret key file in crypto-config/peerOrganizations/org1.example.com/ca

Run ./article.sh

Now the Hyperledger-Fabric network will be set up


##Setting up the server for the Web Application

Open article/javasript as cwd
NOTE: You will make use of the following libraries - js-md5, express, express-session, body-parse, googleapis, jquery, fabric-network
NOTE: You will need node, and npm installed. Node Version used:  8.11.1, npm version used: 5.3.0

Run on terminal: node enrollAdmin.js

Run on terminal: node final.js 

Now the server will have been set up.

Log on to localhost:3000 on your browser to use the web app.










  
 

