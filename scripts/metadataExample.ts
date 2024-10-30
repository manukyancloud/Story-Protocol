import { CreateIpAssetWithPilTermsResponse, IpMetadata, PIL_TYPE, StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { http } from 'viem'
import { NFTContractAddress, RPCProviderUrl, account } from './utils/utils'
import { uploadJSONToIPFS } from './utils/uploadToIpfs'
import { createHash } from 'crypto'

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README
// which contains instructions for running this metadata example.

const main = async function () {
    // 1. Set up your Story Config
    //
    // Docs: https://docs.story.foundation/docs/typescript-sdk-setup
    const config: StoryConfig = {
        account: account,
        transport: http(RPCProviderUrl),
        chainId: 'iliad',
    }
    const client = StoryClient.newClient(config)

    // 2. Set up your IP Metadata
    //
    // Docs: https://docs.story.foundation/docs/ipa-metadata-standard
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: 'My IP Asset',
        description: 'Test IP asset by Mahcubyan',
        watermarkImg: 'https://beige-swift-tick-668.mypinata.cloud/files/bafkreiabtiwkvubhnbu6xscwzkyxepll6kb5de5wy7xpk22fictcux53xi?X-Algorithm=PINATA1&X-Date=1730309765&X-Expires=30&X-Method=GET&X-Signature=66e92fdc21554de520bc2c8bdfee772304fb85d43130ca3c928a88b9dc209750',
        attributes: [
            {
                key: 'Rarity',
                value: 'Legendary',
            },
        ],
    })

    // 3. Set up your NFT Metadata
    //
    // Docs: https://eips.ethereum.org/EIPS/eip-721
    const nftMetadata = {
        name: 'Mahcubyan',
        description: 'This is a test NFT on Iliad',
        image: 'https://beige-swift-tick-668.mypinata.cloud/files/bafkreiabtiwkvubhnbu6xscwzkyxepll6kb5de5wy7xpk22fictcux53xi?X-Algorithm=PINATA1&X-Date=1730309765&X-Expires=30&X-Method=GET&X-Signature=66e92fdc21554de520bc2c8bdfee772304fb85d43130ca3c928a88b9dc209750',
    }

    // 4. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 5. Register the NFT as an IP Asset
    //
    // Docs: https://docs.story.foundation/docs/spg-functions#mint--register--attach-terms
    const response: CreateIpAssetWithPilTermsResponse = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        nftContract: NFTContractAddress,
        pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
    console.log(`View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`)
}

main()
