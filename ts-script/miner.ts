import { ethers } from "ethers";

const BEFORE_INITIALIZE_FLAG = 1 << 13;
const AFTER_INITIALIZE_FLAG = 1 << 12;

const BEFORE_ADD_LIQUIDITY_FLAG = 1 << 11;
const AFTER_ADD_LIQUIDITY_FLAG = 1 << 10;

const BEFORE_REMOVE_LIQUIDITY_FLAG = 1 << 9;
const AFTER_REMOVE_LIQUIDITY_FLAG = 1 << 8;

const BEFORE_SWAP_FLAG = 1 << 7;
const AFTER_SWAP_FLAG = 1 << 6;

const BEFORE_DONATE_FLAG = 1 << 5;
const AFTER_DONATE_FLAG = 1 << 4;

const BEFORE_SWAP_RETURNS_DELTA_FLAG = 1 << 3;
const AFTER_SWAP_RETURNS_DELTA_FLAG = 1 << 2;
const AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 1;
const AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 0;

type FlagObject = {
  BEFORE_INITIALIZE_FLAG: boolean;
  AFTER_INITIALIZE_FLAG: boolean;

  BEFORE_ADD_LIQUIDITY_FLAG: boolean;
  AFTER_ADD_LIQUIDITY_FLAG: boolean;

  BEFORE_REMOVE_LIQUIDITY_FLAG: boolean;
  AFTER_REMOVE_LIQUIDITY_FLAG: boolean;

  BEFORE_SWAP_FLAG: boolean;
  AFTER_SWAP_FLAG: boolean;

  BEFORE_DONATE_FLAG: boolean;
  AFTER_DONATE_FLAG: boolean;

  BEFORE_SWAP_RETURNS_DELTA_FLAG: boolean;
  AFTER_SWAP_RETURNS_DELTA_FLAG: boolean;
  AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG: boolean;
  AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG: boolean;
};

function calculateFlags(flagObject: FlagObject): string {
  let combinedFlags = 0;

  if (flagObject.BEFORE_INITIALIZE_FLAG) combinedFlags |= BEFORE_INITIALIZE_FLAG;
  if (flagObject.AFTER_INITIALIZE_FLAG) combinedFlags |= AFTER_INITIALIZE_FLAG;

  if (flagObject.BEFORE_ADD_LIQUIDITY_FLAG) combinedFlags |= BEFORE_ADD_LIQUIDITY_FLAG;
  if (flagObject.AFTER_ADD_LIQUIDITY_FLAG) combinedFlags |= AFTER_ADD_LIQUIDITY_FLAG;

  if (flagObject.BEFORE_REMOVE_LIQUIDITY_FLAG) combinedFlags |= BEFORE_REMOVE_LIQUIDITY_FLAG;
  if (flagObject.AFTER_REMOVE_LIQUIDITY_FLAG) combinedFlags |= AFTER_REMOVE_LIQUIDITY_FLAG;

  if (flagObject.BEFORE_SWAP_FLAG) combinedFlags |= BEFORE_SWAP_FLAG;
  if (flagObject.AFTER_SWAP_FLAG) combinedFlags |= AFTER_SWAP_FLAG;

  if (flagObject.BEFORE_DONATE_FLAG) combinedFlags |= BEFORE_DONATE_FLAG;
  if (flagObject.AFTER_DONATE_FLAG) combinedFlags |= AFTER_DONATE_FLAG;

  if (flagObject.BEFORE_SWAP_RETURNS_DELTA_FLAG) combinedFlags |= BEFORE_SWAP_RETURNS_DELTA_FLAG;
  if (flagObject.AFTER_SWAP_RETURNS_DELTA_FLAG) combinedFlags |= AFTER_SWAP_RETURNS_DELTA_FLAG;
  if (flagObject.AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG) combinedFlags |= AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG;
  if (flagObject.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG) combinedFlags |= AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG;

  return combinedFlags.toString(2);
}

function addressToBinary(address: string) {
  const bytes = ethers.getBytes(address);
  let binaryString = "";
  for (let byte of bytes) {
    binaryString += byte.toString(2).padStart(8, "0");
  }

  return binaryString;
}

async function deployPool() {
  const helperDeployerAddress = "0x7BbB1F129c67d79074E8FD349db3146149D57902";
  const hookBytecode = "0x608060405234801561001057600080fd5b5042600081905550610105806100276000";

  const flags: FlagObject = {
    BEFORE_INITIALIZE_FLAG: false,
    AFTER_INITIALIZE_FLAG: false,
    BEFORE_ADD_LIQUIDITY_FLAG: true,
    AFTER_ADD_LIQUIDITY_FLAG: true,
    BEFORE_REMOVE_LIQUIDITY_FLAG: false,
    AFTER_REMOVE_LIQUIDITY_FLAG: true,
    BEFORE_SWAP_FLAG: true,
    AFTER_SWAP_FLAG: false,
    BEFORE_DONATE_FLAG: false,
    AFTER_DONATE_FLAG: true,
    BEFORE_SWAP_RETURNS_DELTA_FLAG: true,
    AFTER_SWAP_RETURNS_DELTA_FLAG: false,
    AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG: false,
    AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG: true,
  };
  const binFlags = calculateFlags(flags);
  console.log(binFlags);
  let found = false;
  let nonce = 0;

  while (!found) {
    const hookSalt = ethers.keccak256(ethers.toUtf8Bytes(nonce.toString()));

    const computedAddress = ethers.getCreate2Address(helperDeployerAddress, hookSalt, ethers.keccak256(hookBytecode));

    if (addressToBinary(computedAddress).endsWith(binFlags)) {
      found = true;
      console.log("Found address:", computedAddress, addressToBinary(computedAddress));
      console.log("Used salt:", hookSalt);
    }

    nonce++;
  }
}

deployPool().catch(console.error);
