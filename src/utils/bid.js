export function getMinimalBidPerToken(
  previousPricePerToken,
  reservePricePerToken,
  minimalAuctionBps
) {
  previousPricePerToken = previousPricePerToken ? previousPricePerToken : "0";

  const requiredMinimalPricePerToken =
    BigInt(previousPricePerToken) > BigInt("0")
      ? BigInt(previousPricePerToken) +
        (BigInt(previousPricePerToken) * BigInt(minimalAuctionBps)) / BigInt("10000")
      : BigInt(reservePricePerToken);
  return requiredMinimalPricePerToken.toString();
}

export function getMinimalBuyoutPricePerToken(
  previousPricePerToken,
  buyoutPricePerToken,
  minimalAuctionBps,
  bonusRefundBps
) {
  previousPricePerToken = previousPricePerToken ? previousPricePerToken : "0";

  if (BigInt(previousPricePerToken) > BigInt("0")) {
    const requiredMinimalPricePerTokenFromBuyoutPrice =
      BigInt(buyoutPricePerToken) +
      (BigInt(previousPricePerToken) * BigInt(bonusRefundBps)) / BigInt("10000");
    const requiredMinimalPricePerTokenFromMinimalAuctionBps =
      BigInt(previousPricePerToken) +
      (BigInt(previousPricePerToken) * BigInt(minimalAuctionBps)) / BigInt("10000");
    const result =
      requiredMinimalPricePerTokenFromBuyoutPrice >
      requiredMinimalPricePerTokenFromMinimalAuctionBps
        ? requiredMinimalPricePerTokenFromBuyoutPrice
        : requiredMinimalPricePerTokenFromMinimalAuctionBps;
    return result.toString();
  } else {
    return buyoutPricePerToken.toString();
  }
}

export function computeBidAmounts(
  newBidPerToken,
  quantity,
  reservePricePerToken,
  buyoutPricePerToken,
  previousPricePerToken,
  minimalAuctionBps,
  bonusRefundBps,
  royaltyBps,
  protocolFeeBps
) {
  const totalBidAmount = BigInt(newBidPerToken) * BigInt(quantity);

  previousPricePerToken = previousPricePerToken ? previousPricePerToken : "0";

  const errors = [];

  if (BigInt(quantity) <= BigInt("0")) {
    errors.push("Quantity must be greater than 0");
  }

  if (BigInt(minimalAuctionBps) <= BigInt(bonusRefundBps)) {
    errors.push("Minimal auction bps must be greater than bonus refund bps");
  }

  const minimalBidPerToken = BigInt(
    getMinimalBidPerToken(previousPricePerToken, reservePricePerToken, minimalAuctionBps)
  );
  const minimalBuyoutPerToken = getMinimalBuyoutPricePerToken(
    previousPricePerToken,
    buyoutPricePerToken,
    minimalAuctionBps,
    bonusRefundBps
  );

  if (minimalBidPerToken > BigInt(newBidPerToken)) {
    errors.push("New bid price must be greater than or equal to the minimal price");
  }

  const refundBonusPerToken =
    (BigInt(bonusRefundBps) * BigInt(previousPricePerToken)) / BigInt("10000");

  const refundBonusAmount = BigInt(quantity) * refundBonusPerToken;

  const refundAmountToPreviousBidder =
    BigInt(quantity) * BigInt(previousPricePerToken) + refundBonusAmount;

  if (refundAmountToPreviousBidder >= totalBidAmount) {
    errors.push("Refund exceeds new bid amount");
  }

  const newPricePerToken = BigInt(newBidPerToken) - BigInt(refundBonusPerToken);
  const newAmount = newPricePerToken * BigInt(quantity);

  const newRefundBonusPerToken = (BigInt(bonusRefundBps) * newPricePerToken) / BigInt("10000");
  const newRefundBonusAmount = BigInt(quantity) * newRefundBonusPerToken;

  const protocolFeeAmount = (BigInt(newAmount) * BigInt(protocolFeeBps)) / BigInt("10000");
  const royaltyAmount = (BigInt(newAmount) * BigInt(royaltyBps)) / BigInt("10000");
  const listerAmount = BigInt(newAmount) - protocolFeeAmount - royaltyAmount;

  // note: if quantity = 1 :
  // - newBidPerToken = totalBidAmount
  // - refundBonusPerToken = refundBonusAmount
  // - newPricePerToken = newAmount
  // - newRefundBonusPerToken = newRefundBonusAmount

  if (errors.length) {
    console.error("errors on bid amounts", errors);
  }

  return {
    minimalBidPerToken: minimalBidPerToken.toString(),
    minimalBuyoutPerToken,

    newBidPerToken: newBidPerToken.toString(),
    totalBidAmount: totalBidAmount.toString(), // how much the bidder will pay => refundBonusAmount + newAmount

    /**
     * details about the price
     */
    refundBonusPerToken: refundBonusPerToken.toString(),
    refundBonusAmount: refundBonusAmount.toString(), // bonus the previous bidder will get
    refundAmountToPreviousBidder: refundAmountToPreviousBidder.toString(),

    newPricePerToken: newPricePerToken.toString(),
    newAmount: newAmount.toString(), // next bid amount

    /**
     * if another valid bid is placed...
     */
    newRefundBonusPerToken: newRefundBonusPerToken.toString(),
    newRefundBonusAmount: newRefundBonusAmount.toString(), // bonus the bidder will get

    /**
     * else if bid is successful (bidder will receive nft, no refund)
     */
    protocolFeeAmount: protocolFeeAmount.toString(), // how much the protocol will receive
    royaltyAmount: royaltyAmount.toString(), // how much the creator will receive
    listerAmount: listerAmount.toString() // how much the lister will receive
  };
}
