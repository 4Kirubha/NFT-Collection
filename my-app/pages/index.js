import Head from "next/head";
import {providers,Contract,utils} from "ethers";
import Web3Modal from "web3modal";
import React,{ useEffect,useState,useRef} from "react";
import styles from "../styles/Home.module.css"
import { NFT_ADDRESS,ABI } from "../constants";

export default function Home(){
  const[walletConnected,setWalletConnected] = useState(false);
  const[preSaleStarted,setPreSaleStarted] = useState(false);
  const[preSaleEnded,setPreSaleEnded] = useState(false);
  const[loading,setLoading] = useState(false);
  const[tokenIdsMinted,setTokenIdsMinted] = useState(0);
  const[isOwner,setIsOwner] = useState(false);
  const web3ModalRef = useRef();

    const getSignerOrProvider = async(needSigner = false) => {
      const provider = await  web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();

      if(chainId != 11155111){
        window.alert("Change the network to Sepolia");
        throw new Error("Change network to Sepolia");
      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    };

    async function preSaleMint(){
      try{
        const signer = await getSignerOrProvider(true);
        const nftContract = new Contract(NFT_ADDRESS,ABI,signer);
        const tx = await nftContract.preSaleMint({value: utils.parseEther("0.01")})
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You successfully minted a Krypto Koin")
      }catch(err){
        console.error(err);
      }
    }

    async function publicMint(){
      try{
        const signer = await getSignerOrProvider(true);
        const nftContract = new Contract(NFT_ADDRESS,ABI,signer);
        const tx = await nftContract.mint({value: utils.parseEther("0.01")});
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You successfully minted a Krypto Koin")
      }catch(err){
        console.error(err);
      } 
    }

    async function connectWallet(){
      try{
        await getSignerOrProvider();
        setWalletConnected(true);
      }catch(err){
        console.error(err);
      }
    }

    async function startPreSale() {
      try{
      const signer = await getSignerOrProvider(true);
      const nftContract = new Contract(NFT_ADDRESS,ABI,signer);
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPresaleStarted();
      }catch(err){
        console.error(err);
      }
    }

    async function checkIfPresaleStarted(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _preSaleStarted = await nftContract.preSaleStarted();
        if(!_preSaleStarted){
          await getOwner();
        }
        setPreSaleStarted(_preSaleStarted);
        return _preSaleStarted;
      }catch(err){
        console.error(err);
        return false;
      }
    }

    async function checkIfPresaleEnded(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _preSaleEnded = await nftContract.preSaleEnded();
        const hasEnded = _preSaleEnded.lt(Math.floor(Date.now()/1000));
        if(hasEnded){
          setPreSaleEnded(true);
        }else{
          setPreSaleEnded(false);
        }
        return hasEnded;
      }catch(err){
        console.error(err);
        return false;
      }
    }

    async function getOwner(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _owner = await nftContract.owner();
  
        const signer = await getSignerOrProvider(true);
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()){
          setIsOwner(true);
        }
      }catch(err){
      console.error(err.message);
      }
    }

    async function getTokenIdsMinted(){
      try{
        const provider = await getSignerOrProvider();
        const nftContract = new Contract(NFT_ADDRESS,ABI,provider);
        const _tokenIds = await nftContract.tokenIds();
        setTokenIdsMinted(_tokenIds.toString());
      }catch(err){
        console.error(err);
      }
    }

    useEffect(() =>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network:"sepolia",
          providerOptions:{},
          disableInjectedProvider: false,
        });

        connectWallet();
      

      const _preSaleStarted = checkIfPresaleStarted();
      if(_preSaleStarted){
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();

      const preSaleEndedInterval = setInterval(async function(){
        const _preSaleStarted = await checkIfPresaleStarted();
        if(_preSaleStarted){
          const _preSaleEnded = await checkIfPresaleEnded();
          if(_preSaleEnded){
            clearInterval(preSaleEndedInterval);
          }
        }
      },5*1000);

      setInterval(async function(){
        await getTokenIdsMinted();
      },5*1000)
      }
    },[walletConnected])

    function renderButton(){
      if(!walletConnected){
        return (<button onClick={connectWallet} className={styles.button}>Connect your wallet</button>);
      }
      if(loading){
        return (<button className={styles.button}>Loading...</button>);
      }
      if(isOwner && !preSaleStarted){
        return (<button onClick={startPreSale} className={styles.button}>Start Presale</button>);
      }
      if(!preSaleStarted){
        return (<button className={styles.button}>Presale hasn't started yet</button>);
      }
      if(preSaleStarted && !preSaleEnded){
        return (<div>
          <div className={styles.description}>
            Presale started!,If you're in whitelisted,Mint your Krypto Koins🥳
          </div>
          <button onClick={preSaleMint} className={styles.button}>Presale mint🚀</button>
        </div>);
      }
      if(preSaleStarted && preSaleEnded){
        return (<button onClick={publicMint} className={styles.button}>Public mint 🚀</button>);
      }
    }
   return (
      <div>
        <Head>
          <title>Krypto Koin</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Krypto Koins!</h1>
            <div className={styles.description}>
              It&#39;s an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./cryptodevs/0.svg" />
          </div>
        </div>
  
        <footer className={styles.footer}>
          Made with &#10084; by Krypto Koins
        </footer>
      </div>
    );
  }