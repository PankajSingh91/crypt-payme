export const getEthPriceInInr = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
      );
      const data = await response.json();
      return data.ethereum.inr;
    } catch (error) {
      console.error("Failed to fetch ETH price:", error);
      return null;
    }
  };
  