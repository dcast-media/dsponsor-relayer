/** @jsxImportSource frog/jsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */

import config from "@/config";
import DSponsorAdminABI from "@/config/abis/DSponsorAdmin.js";
import DSponsorMarketplaceABI from "@/config/abis/DSponsorMarketplace.js";
import { getRandomAdData } from "@/queries/ads";
import { getEthQuote } from "@/queries/uniswap/quote";
import { isValidUrl } from "@/utils";
import { getAddress, ethers } from "ethers";
import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { createSystem } from "frog/ui";
import { revalidateTag } from "next/cache";

const { Box, Heading, Text, VStack, Image, vars } = createSystem();

const actions = {
  MINT: "Mint",
  BUY: "Buy",
  BID: "Bid"
};

const app = new Frog({
  basePath: "/",
  initialState: {
    txs: {}
  },
  ui: { vars }
});

app.frame("/api/:chainId/ads/:offerId/frames", async (c) => {
  const { inputText, buttonValue, deriveState } = c;
  const { offerId, chainId } = c.req.param();
  let { items, ratio, tokenIds, tokenDataInput, tokenDatas } = c.req.query();

  items = items && items.length > 0 ? items.split(",") : ["sale", "sponsor"];
  ratio = ratio === "1:1" ? "1:1" : "1.91:1";
  tokenIds = tokenIds && tokenIds.length > 0 ? tokenIds.split(",") : undefined;
  tokenDatas =
    tokenDatas && tokenDatas.length > 0
      ? tokenDatas.split(",")
      : inputText && inputText.length > 0
        ? [inputText]
        : undefined;

  const {
    randomAd,
    _adParameterIds,
    _tokenIds,
    _validatedAds
    // _randomTokenId
  } =
    (await getRandomAdData({
      chainId,
      adOfferId: offerId,
      tokenIds,
      tokenDatas,
      adParameterIds: [`imageURL-${ratio}`, "linkURL"],
      options: {
        populate: true
      }
    })) || {};

  const [imageURL, linkURL] = _adParameterIds;
  ratio =
    imageURL.split("-")[1] === "1:1" || imageURL.split("-")[1] === "1.91:1"
      ? imageURL.split("-")[1]
      : "1.91:1";

  let image;
  const intents = [];

  if (inputText) {
    intents.push(
      <Button value="tokenDataInput" action={`/api/${chainId}/ads/${offerId}/frames`}>
        ⬅️ Back
      </Button>
    );
  }

  if (tokenDataInput || buttonValue == "tokenDataInput") {
    items = ["none"];
    image = `${config[chainId].relayerURL}/cover.jpg`;
    intents.push(<TextInput placeholder={tokenDataInput ? tokenDataInput : "..."} />);
    intents.push(<Button action={`/api/${chainId}/ads/${offerId}/frames`}>Lookup</Button>);
    intents.push(<Button.Link href={`${config[chainId].appURL}`}>Marketplace</Button.Link>);
  }

  ////////////////// SALE LOGIC /////////////////
  if (items.includes("sale")) {
    const txId = new Date().valueOf();

    const mintTokenId = Object.keys(_validatedAds).find((tokenId) => {
      return _validatedAds[tokenId]?._buy?.mint?.length > 0;
    });

    if (mintTokenId) {
      image = _validatedAds[mintTokenId][imageURL].data;

      const action = actions.MINT;
      const contractAddress = getAddress(config[chainId].smartContracts.DSPONSOR_ADMIN.address);
      const { mint } = _validatedAds[mintTokenId]._buy || {};
      const { currency, mintPriceStructure } = mint[0] || {};
      const { totalAmount } = mintPriceStructure || {};
      const quote = await getEthQuote(
        chainId,
        getAddress(currency),
        totalAmount /* , slippagePerCent = 0.3 */
      );
      const { amountInEthWithSlippage: value } = quote;

      const mintParams = {
        tokenId: mintTokenId,
        // to --> to add in app.transaction
        currency,
        tokenData: "",
        offerId,
        adParameters: [],
        adDatas: [],
        referralAdditionalInformation: "frame"
      };

      deriveState((previousState) => {
        previousState.txs[txId] = {
          contractAddress,
          action,
          params: { args: [mintParams] },
          totalAmount,
          value
        };
      });

      intents.push(
        <Button.Transaction
          action={`/api/${chainId}/ads/${offerId}/frames/${mintTokenId}/txres/${txId}`}
          target={`/api/${chainId}/ads/${offerId}/frames/${mintTokenId}/txdata/${txId}`}
        >
          {action}
        </Button.Transaction>
      );
      intents.push(
        <Button.Link href={_validatedAds[mintTokenId][linkURL].data}>Details</Button.Link>
      );
    } else {
      const secondaryTokenId = Object.keys(_validatedAds).find((tokenId) => {
        return !!_validatedAds[tokenId]?._buy?.secondary;
      });

      if (secondaryTokenId) {
        const {
          id: listingId,
          listingType,
          lister,
          buyoutPricePerToken,
          bidPriceStructure,
          currency
        } = _validatedAds[secondaryTokenId]._buy.secondary;
        const { minimalBidPerToken } = bidPriceStructure || {};

        const amount = listingType === "Direct" ? buyoutPricePerToken : minimalBidPerToken;

        const {
          amountInEthFormatted,
          shield3Decisions,
          amountInEthWithSlippage: value
        } = await getEthQuote(chainId, getAddress(currency), amount, 0.3);

        const action = listingType === "Direct" ? actions.BUY : actions.BID;

        const shield3BlockingDecision = shield3Decisions?.find(
          (decision) => decision?.decision === "Block"
        );

        if (shield3BlockingDecision) {
          image = (
            <Box grow alignVertical="center" backgroundColor="background" padding="32">
              <VStack gap="4">
                <Heading>Shield3 Protection</Heading>
                <Text color="text200" size="20">
                  Cannot {action} due to {shield3BlockingDecision?.name}
                </Text>
              </VStack>
            </Box>
          );
        } else {
          image = _validatedAds[secondaryTokenId][imageURL].data;

          const bidParams = [
            listingId,
            minimalBidPerToken,
            "to change in app.transaction",
            "frame"
          ];
          const buyParams = [
            {
              listingId,
              // buyFor --> to change in app.transaction
              quantity: 1,
              currency,
              totalPrice: buyoutPricePerToken,
              referralInformation: "frame"
            }
          ];

          const args = listingType === "Direct" ? buyParams : bidParams;
          const totalAmount = listingType === "Direct" ? buyoutPricePerToken : minimalBidPerToken;

          const contractAddress = getAddress(
            config[chainId].smartContracts.DSPONSOR_MARKETPLACE.address
          );

          deriveState((previousState) => {
            previousState.txs[txId] = {
              contractAddress,
              action,
              params: { lister, args },
              totalAmount,
              value
            };
          });

          intents.push(
            <Button.Transaction
              action={`/api/${chainId}/ads/${offerId}/frames/${secondaryTokenId}/txres/${txId}`}
              target={`/api/${chainId}/ads/${offerId}/frames/${secondaryTokenId}/txdata/${txId}`}
            >
              {action} (≈ {amountInEthFormatted} ETH)
            </Button.Transaction>
          );
        }

        intents.push(
          <Button.Link href={_validatedAds[secondaryTokenId][linkURL].data}>Details</Button.Link>
        );
      }
    }
  }
  ////////////////// END SALE LOGIC /////////////////

  if (
    items.includes("sponsor") &&
    randomAd &&
    _tokenIds.length > 0 &&
    randomAd[linkURL].state === "CURRENT_ACCEPTED"
  ) {
    image = randomAd[imageURL].data;
    intents.push(<Button.Link href={randomAd[linkURL].data}>Visit</Button.Link>);
  }

  if (!image && intents.length === 0 && _validatedAds._tokenIds.length > 0) {
    const tokenId = _validatedAds._tokenIds[0];
    image = _validatedAds[tokenId][imageURL].data;
    intents.push(<Button.Link href={_validatedAds[tokenId][linkURL].data}>Details</Button.Link>);
  }

  let contentType;
  try {
    if (isValidUrl(image)) {
      const imageResponse = await fetch(image, {
        method: "HEAD",
        cache: "force-cache",
        next: { tags: [`head-${image}`] }
      });
      contentType = imageResponse.headers.get("Content-Type");
    }
  } catch (error) {
    console.error("error fetching image", image);
  }

  if (contentType && ["image/jpeg", "image/png", "image/gif", "image/bmp"].includes(contentType)) {
    image = (
      <Box>
        <Image src={image} alt="frameImg" objectFit="contain" width="100%" height="100%" />
      </Box>
    );
  }

  if (!image) {
    /*
    image = (
      <Box grow alignVertical="center" backgroundColor="background" padding="32">
        <VStack gap="4">
          <Heading>DSponsor Ad Space</Heading>
          <Text color="text200" size="20">
            (No ad space image information to provide)
          </Text>
        </VStack>
      </Box>
    );
    */
    image = `${config[chainId].relayerURL}/reserved-1.91-1.png`;
    ratio = "1.91:1";
  }
  if (intents.length === 0) {
    intents.push(
      <Button.Link href={`${config[chainId].appURL}/${chainId}/offer/${offerId}`}>
        Offer details
      </Button.Link>
    );
  }

  const browserLocation =
    _tokenIds && _tokenIds.length == 1 && !tokenDataInput
      ? `${config[chainId].appURL}/${chainId}/offer/${offerId}/${_tokenIds[0]}`
      : `${config[chainId].appURL}/${chainId}/offer/${offerId}`;

  return c.res({
    title: "SiBorg Ads",
    browserLocation,
    headers: {
      "cache-control": "max-age=0"
    },
    image,
    imageAspectRatio: ratio,
    intents
  });
});

app.frame("/api/:chainId/ads/:offerId/frames/:tokenId/txres/:txId", async (c) => {
  const { offerId, chainId, tokenId, txId } = c.req.param();
  const { transactionId, deriveState } = c;

  const state = deriveState((previousState) => {
    const aDayAgoValueOf = new Date().valueOf() - 86400000;
    for (const txTimeId of Object.keys(previousState.txs)) {
      if (Number(txTimeId) < aDayAgoValueOf) {
        delete previousState.txs[txTimeId];
      }
    }
  });

  const {
    // contractAddress,
    // action,
    params: { lister }
    // totalAmount,
    // value
  } = state.txs[txId] || {};

  const rpcURL = config?.[chainId]?.rpcURL;
  const provider = new ethers.JsonRpcProvider(rpcURL);
  const { from } = (await provider.getTransaction(transactionId)) || {};

  if (from) {
    revalidateTag(`${chainId}-userAddress-${getAddress(from)}`);
  }
  if (lister) {
    revalidateTag(`${chainId}-userAddress-${getAddress(lister)}`);
  }
  revalidateTag(`${chainId}-adOffer-${offerId}`);
  revalidateTag(`${chainId}-activity`);

  return c.res({
    image: (
      <Box grow alignVertical="center" backgroundColor="background" padding="32">
        <VStack gap="4">
          <Heading size="48">Transaction submitted 🎉</Heading>
          <Text color="text200" size="24">
            Verify your tx or check it on the app 👇
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <Button.Link href={`${config[chainId].explorerURL}/tx/${transactionId}`}>
        Transaction
      </Button.Link>,
      <Button.Link href={`${config[chainId].appURL}/${chainId}/offer/${offerId}/${tokenId}`}>
        App
      </Button.Link>
    ]
  });
});

app.transaction("/api/:chainId/ads/:offerId/frames/:tokenId/txdata/:txId", async (c) => {
  const { chainId, txId } = c.req.param();

  const { previousState, address } = c;

  const {
    contractAddress,
    action,
    params: { args },
    // totalAmount,
    value
  } = previousState.txs[txId] || {};

  if (action === actions.MINT && args && contractAddress) {
    args[0].to = address;
    return c.contract({
      abi: DSponsorAdminABI,
      chainId: `eip155:${chainId}`,
      functionName: "mintAndSubmit",
      args,
      to: contractAddress,
      value
    });
  } else if (action === actions.BUY && args && contractAddress) {
    args[0].buyFor = address;
    return c.contract({
      abi: DSponsorMarketplaceABI,
      chainId: `eip155:${chainId}`,
      functionName: "buy",
      args,
      to: contractAddress,
      value
    });
  } else if (action === actions.BID && args && contractAddress) {
    args[2] = address;
    return c.contract({
      abi: DSponsorMarketplaceABI,
      chainId: `eip155:${chainId}`,
      functionName: "bid",
      args,
      to: contractAddress,
      value
    });
  }
});

export const GET = handle(app);
export const POST = handle(app);
