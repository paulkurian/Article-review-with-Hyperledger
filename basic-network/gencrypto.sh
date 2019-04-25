echo "========= Generate certificates and channel artifacts =============="

../bin/cryptogen generate --config=./crypto-config.yaml

export FABRIC_CFG_PATH=$PWD

../bin/configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block

export CHANNEL_NAME=mychannel

../bin/configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME

../bin/configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP