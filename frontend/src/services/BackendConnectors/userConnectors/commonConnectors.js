const { ethers } = require("ethers");
const dygnifyToken = require("../../../artifacts/contracts/protocol/old/TestUSDCToken.sol/TestUSDCToken.json");
const Sentry = require("@sentry/react");
const sixDecimals = 6;

export const getEthAddress = async () => {
	Sentry.captureMessage("getEthAddress", "info");

	try {
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		// Prompt user for account connections
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const result = await signer.getAddress();
		return { result, success: true };
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const requestAccount = async (metaMask) => {
	Sentry.captureMessage("requestAccount", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			let provider = window.ethereum;
			// edge case if MM and CBW are both installed
			if (window.ethereum.providers?.length) {
				window.ethereum.providers.forEach(async (p) => {
					if (metaMask === true) {
						if (p.isMetaMask) provider = p;
					} else {
						if (p.isCoinbaseWallet) {
							provider = p;
						}
					}
				});
			}
			await provider.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x13882" }], // chainId must be in hexadecimal numbers
			});
			await provider.request({
				method: "eth_requestAccounts",
				params: [],
			});

			return { success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "please connect your wallet",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};




export const isConnected = async () => {
	Sentry.captureMessage("isConnected", "info");
	try {
	  if (window.ethereum) {
		let chainId = await window.ethereum.request({ method: 'eth_chainId' });
		console.log("Initial chainId:", chainId);
		if (chainId !== '0x13882') {
		  await window.ethereum.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: "0x13882" }],
		  });
		  chainId = await window.ethereum.request({ method: 'eth_chainId' });
		  console.log("Switched chainId:", chainId);
		}
		if (chainId === '0x13882') {
		  const provider = new ethers.providers.Web3Provider(window.ethereum);
		  await provider.send("eth_requestAccounts", []);
		  return { success: true };
		}
	  } else {
		localStorage.setItem("Wallet-Check", false);
		return {
		  success: false,
		  msg: "Please Install Wallet",
		};
	  }
	} catch (error) {
	  console.error("Error in isConnected:", error); // Log error details
	  Sentry.captureException(error);
	  return {
		success: false,
		msg: "Please Open Metamask and Connect",
	  };
	}
  };
  
  

export const convertDate = (epochTimestamp) => {
	function pad(s) {
		return s < 10 ? "0" + s : s;
	}
	//epoch gives timestamp in seconds we need to convert it in miliseconds
	var d = new Date(epochTimestamp * 1000);
	return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/");
};

export const getUserWalletAddress = async () => {
	Sentry.captureMessage("getUserWalletAddress", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			await requestAccount();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const address = await signer.getAddress();
			return { address, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getWalletBal = async (address) => {
	Sentry.captureMessage("getWalletBal", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			await requestAccount();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			// console.log({ provider });
			const contract = new ethers.Contract(
				process.env.REACT_APP_TEST_USDCTOKEN,
				dygnifyToken.abi,
				provider
			);
			const signer = provider.getSigner();
			const bal = await contract.balanceOf(
				address ? address : await signer.getAddress()
			);
			return {
				balance: ethers.utils.formatUnits(bal, sixDecimals),
				success: true,
			};
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getGasPrice = async () => {
	try {
		if (typeof window.ethereum !== "undefined") {
			await requestAccount();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			let gasPrice = await provider.getGasPrice();
			return {
				balance: ethers.utils.formatUnits(gasPrice, sixDecimals),
				success: true,
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};
