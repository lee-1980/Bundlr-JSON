import { WebBundlr } from '@bundlr-network/client';
import { useToast } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { providers, utils } from 'ethers';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export interface IBundlrHook {
    initialiseBundlr: () => Promise<void>;
    fundWallet: (_: number) => void;
    balance: string;
    files: string[],
    uploadFile: (file: Buffer) => Promise<any>;
    bundlrInstance: WebBundlr;
}

const BundlrContext = createContext<IBundlrHook>({
    initialiseBundlr: async () => { },
    fundWallet: (_: number) => { },
    balance: '',
    files: [],
    uploadFile: async (_file) => { },
    bundlrInstance: null
});


// Bundlr Context for bundlr network instance through all components
const BundlrContextProvider = ({ children }: any): JSX.Element => {
    const toast = useToast()
    const [bundlrInstance, setBundlrInstance] = useState<WebBundlr>();
    const [balance, setBalance] = useState<string>('');
    const [owner, setOwner] = useState<string>('');
    const [files, setFiles] = useState<string[]>([]);


    useEffect(() => {
        if (bundlrInstance) {
            fetchBalance();
            fetchUploadedFiles();
        }
    }, [bundlrInstance])

    // initializing the Bundlr using devnetwork

    const initialiseBundlr = async () => {
        const provider = new providers.Web3Provider(window.ethereum as any);
        await provider._ready();
        const bundlr = new WebBundlr(
            "https://devnet.bundlr.network",
            "matic",
            provider,
            {
                providerUrl:
                    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
            }
        );
        await bundlr.ready();
        setBundlrInstance(bundlr);
        /** this owner is not real Wallet Address, Arweave network use their own address instead of Wallet address. we need to fetch this value from first transaction and save it to database. */
        /**
         *  query{
                    transaction(id: "your-transaction-id"){
                       owner
                    }
                }
         *  this owner value will stay the same for all the transactions
         */
        // setOwner();
    }


    async function fundWallet(amount: number) {
        try {
            if (bundlrInstance) {
                if (!amount) return
                const amountParsed = parseInput(amount)
                if (amountParsed) {
                    toast({
                        title: "Adding funds please wait",
                        status: "loading"
                    })
                    let response = await bundlrInstance.fund(amountParsed)
                    console.log('Wallet funded: ', response)
                    toast({
                        title: "Funds added",
                        status: "success"
                    })
                }
                fetchBalance()
            }
        } catch (error) {
            console.log("error", error);
            toast({
                title: error.message || "Something went wrong!",
                status: "error"
            })
        }
    }

    function parseInput(input: number) {
        const conv = new BigNumber(input).multipliedBy(bundlrInstance!.currencyConfig.base[1])
        if (conv.isLessThan(1)) {
            console.log('error: value too small')
            toast({
                title: "Error: value too small",
                status: "error"
            })
            return
        } else {
            return conv
        }
    }


    async function fetchBalance() {
        if (bundlrInstance) {
            const bal = await bundlrInstance.getLoadedBalance();
            console.log("bal: ", utils.formatEther(bal.toString()));
            setBalance(utils.formatEther(bal.toString()));
        }
    }

    async function fetchUploadedFiles() {
        if (bundlrInstance && owner) {
            const client = new ApolloClient({
                uri: 'https://arweave.dev/graphql',
                cache: new InMemoryCache()
            });


            const {data} = await client.query({
                query: gql` query { 
                               transactions (owners: [${owner}}]) {
                                 edges {
                                     node {
                                         id
                                     }
                                 }
                               }
                            }`
            });
            /** Example Response from Arweave */
            // {
            //     "data": {
            //     "transactions": {
            //         "edges": [
            //             {
            //                 "node": {
            //                     "id": "03Cs43yIZgFdbtIm_bxbAk5FwRJDfcfW7ahwIWUfLz8"
            //                 }
            //             },
            //             {
            //                 "node": {
            //                     "id": "9LvsJm2fKQrJHQ-HRLHAJYn-gGLBEgbFp6lK3KrXWkY"
            //                 }
            //             }
            //         ]
            //     }
            // }
            // }
            /** Note Arweave GraphQL doesn't work in this version, because bundlr Devnet doesn't support this. ---- */

            let idList = [];
            data?.transactions?.edges.map((node) => {
                idList.push(node?.node.id)
            })
            setFiles(idList);
        }
    }

    async function uploadFile(file) {
        try {
            let tx = await bundlrInstance.uploader.upload(file, [{ name: "Content-Type", value: "image/png" }])
            return tx;
        } catch (error) {
            toast({
                title: error.message || "Something went wrong!",
                status: "error"
            })
        }
    }

    return (
        <BundlrContext.Provider value={{ initialiseBundlr, fundWallet, balance, files, uploadFile, bundlrInstance }}>
            {children}
        </BundlrContext.Provider>
    )
}

export default BundlrContextProvider;


export const useBundler = () => {
    return useContext(BundlrContext);
}