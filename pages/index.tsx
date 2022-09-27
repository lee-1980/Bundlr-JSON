import type { NextPage } from 'next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Box, Button, Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { useBundler } from '@/state/bundlr.context';
import { chainId, useAccount, useNetwork } from 'wagmi';
import FundWallet from '@/components/FundWallet';
import UploadFile from '@/components/UploadFile';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const { data } = useAccount();
  const { activeChain } = useNetwork();
  const { initialiseBundlr, bundlrInstance, balance } = useBundler();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  // check wallet connection
  if (!data) {
    return (
      <div className='justify-center items-center h-screen flex '>
        <VStack gap={8}>
          <Text className='text-4xl font-bold'>
            Connect your wallet first
          </Text>
          <ConnectButton />
        </VStack>
      </div>
    )
  }
  // check if the current network is polygonMumbai
  if (activeChain && activeChain.id !== chainId.polygonMumbai) {
    return (
      <div className='justify-center items-center h-screen flex '>
        <VStack gap={8}>
          <Text className='text-4xl font-bold'>
            Opps, wrong network!! Switch to Polygon Mumbai Testnet
          </Text>
          <ConnectButton />
        </VStack>
      </div>
    )
  }
  // check the bundlr network instance
  if (!bundlrInstance) {
    return (
      <div className='justify-center items-center h-screen flex '>
        <VStack gap={8}>
          <ConnectButton />
          <Text className='text-4xl font-bold'>
            Let's initialise Bundlr now
          </Text>
          <Button className='mt-10' onClick={initialiseBundlr}>Initialise Bundlr</Button>
        </VStack>
      </div>
    )
  }
  // Check the balance deposited into bundlr node
  if (!balance || Number(balance) <= 0) {
    return (
      <div className='justify-center items-center h-screen flex '>
        <VStack gap={8}>
          <ConnectButton />
          <Text className='text-4xl font-bold'>
            Opps, out of funds!, let's add some
          </Text>
          <FundWallet />
        </VStack>
      </div>
    )
  }

  // main home page
  return (
    <div className='justify-center items-center h-screen flex'>
      <Stack direction={['column', 'row']} justifyContent={'space-around'} width={'full'} alignItems={'center'}>
        <VStack gap={8}>
          <ConnectButton />
          <FundWallet />
        </VStack>
        <VStack gap={8}>
          <Text fontSize={'3xl'}>
            Select JSON To Upload
          </Text>
          <UploadFile />
        </VStack>
      </Stack>
    </div>
  );
};
export default Home;
