import { ethers } from "ethers";

const poolABI = ["deployPoolWithHook((address,address,uint24,int24,address),uint160,bytes,bytes,bytes32) public"];

const contractAddress = "";
const provider = new ethers.JsonRpcProvider("");
const signer = new ethers.Wallet("", provider);
const poolContract = new ethers.Contract(contractAddress, poolABI, signer);

async function deployPool() {
  const hookBytecode = "";
  const randomNumber = Math.floor(Math.random() * 1000000); 
  const randomSalt = `salt${randomNumber}`;
  const hookSalt = ethers.keccak256(ethers.toUtf8Bytes(randomSalt));
  const computedAddress = ethers.getCreate2Address(contractAddress, hookSalt, ethers.keccak256(hookBytecode));
  console.log("computedAddress", computedAddress);

  const fee = 3000;
  const tickSpacing =  60;
  let currency0Address = "0xC999e906e081133475b1f54fB29dd8551EAc56b0";
  let currency1Address = "0x2AA0D9a09ca1F639Ca850628349f8EFaff6B5513"

  const key = {
    currency0: currency0Address,
    currency1: currency1Address,
    fee: fee,
    tickSpacing: tickSpacing,
    hooks: computedAddress
  }
  const hookData = "";
  const hoodSalt = ethers.ZeroHash;
  const sqrtprice = "79228162514264337593543950336";
  const tx = await poolContract.deployPoolWithHook(key, hookBytecode, sqrtprice, hookData, hookBytecode, hoodSalt);
}

// Вызов функции
deployPool().catch(console.error);
