import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { normalizeString, stringToUint256 } from "@/utils";

export const getValidatedAdsForTokensQuery = /* GraphQL */ `
  query getValidatedAds($adOfferId: String, $tokenIds: [BigInt!]) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferSelectedTokensFragment
    }
    adProposals(
      first: 1000
      where: {
        adOffer_: { id: $adOfferId }
        token_: { tokenId_in: $tokenIds }
        status: CURRENT_ACCEPTED
      }
    ) {
      ...AdProposalFragment
    }
  }
`;

const getValidatedAdsForOfferQuery = /* GraphQL */ `
  query getValidatedAds($adOfferId: String) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferFragment
    }
    adProposals(first: 1000, where: { adOffer_: { id: $adOfferId }, status: CURRENT_ACCEPTED }) {
      ...AdProposalFragment
    }
  }
`;

export async function getValidatedAds(chainId, adOfferId, tokenIds, tokenDatas) {
  const chainName = config[chainId]?.chainName;
  const appURL = config[chainId]?.appURL;

  if (tokenDatas && tokenDatas.length) {
    tokenDatas = tokenDatas.map((t) => normalizeString(t));
    tokenIds = tokenIds && tokenIds.length ? tokenIds : tokenDatas.map((t) => stringToUint256(t));
  }

  const variables = {
    adOfferId
  };
  const query =
    tokenIds && tokenIds.length ? getValidatedAdsForTokensQuery : getValidatedAdsForOfferQuery;

  if (tokenIds && tokenIds.length) {
    variables.tokenIds = tokenIds;
  }

  const graphResult = await executeQuery(chainId, query, variables);

  if (
    !graphResult ||
    !graphResult.data ||
    !graphResult.data.adProposals ||
    !graphResult.data.adOffers[0]
  ) {
    return null;
  }

  const result = {};
  const { adParameters, nftContract } = graphResult.data.adOffers[0];
  const { allowList, prices: defaultPrices } = nftContract;

  const getTokenMintValue = (token) => {
    const isMinted = token?.mint?.blockTimestamp && token?.mint?.blockTimestamp > 0;
    const isInAllowlist = allowList ? token?.setInAllowList : true;
    const tokenCanBeMinted = !isMinted && isInAllowlist;

    return tokenCanBeMinted
      ? token?.tokenPrices?.length
        ? token.tokenPrices
        : defaultPrices?.length
          ? defaultPrices
          : null
      : null;
  };

  /**
   * Provide validated ads data
   */

  graphResult.data.adProposals.forEach((ad) => {
    const { token } = ad;
    const { tokenId } = token;
    if (!result[tokenId]) {
      result[tokenId] = {};
    }
    result[tokenId][ad.adParameter.id] = { state: "CURRENT_ACCEPTED", data: ad.data };
  });

  /**
   * Fulfill data for each token id
   */

  if (!tokenIds) {
    tokenIds = graphResult.data.adOffers[0].nftContract.tokens.map((t) => t.tokenId);
  }

  if (tokenIds && tokenIds.length > 0) {
    for (let i = 0; i < tokenIds.length; i++) {
      const _tokenId = tokenIds[i];
      if (!result[_tokenId]) {
        result[_tokenId] = {};
      }

      const token = graphResult.data.adOffers[0].nftContract.tokens.find(
        (t) => t.tokenId === _tokenId
      );

      const tokenData = token?.mint?.tokenData
        ? token.mint.tokenData
        : tokenDatas && tokenDatas.length && tokenDatas[i]
          ? tokenDatas[i]
          : undefined;
      if (tokenData) {
        result[_tokenId]._tokenData = tokenData;
      }

      let link = `${appURL}/${chainName}/offer/${adOfferId}/${_tokenId}`;
      if (tokenData) {
        link += `?tokenData=${tokenData}`;
      }
      result[_tokenId]._buy = {
        link,
        mint: getTokenMintValue(token),
        secondary:
          token?.marketplaceListings.find(
            (l) =>
              l.startTime < Date.now() / 1000 &&
              l.endTime > Date.now() / 1000 &&
              l.status === "CREATED"
          ) || null
      };

      for (const { adParameter } of adParameters) {
        if (!result[_tokenId][adParameter.id]) {
          const state = result[_tokenId]._buy.mint?.length
            ? "BUY_MINT"
            : result[_tokenId]._buy.secondary
              ? "BUY_MARKET"
              : "UNAVAILABLE";
          result[_tokenId][adParameter.id] = {
            state,
            data: await getDefaultAdData(
              state,
              chainId,
              adOfferId,
              _tokenId,
              tokenData,
              adParameter,
              result[_tokenId]._buy
            )
          };
        }
      }
    }
  }

  return Object.assign({ _tokenIds: tokenIds, _tokenData: tokenDatas }, result);
}

export async function getDefaultAdData(
  state,
  chainId,
  adOfferId,
  tokenId,
  tokenData,
  adParameter,
  buyInfos
) {
  const {
    base
    // variants
  } = adParameter;

  let data = null;

  if (base === "imageURL") {
    if (state === "BUY_MINT" || state === "BUY_MARKET") {
      data = `${config[chainId].assetsURL}/available.webp`;
    } else if (state === "UNAVAILABLE") {
      data = `${config[chainId].assetsURL}/reserved.webp`;
    }
    // test
    // const random = Math.floor(Math.random() * 1000);
    // data = `https://www.placehold.it/500x${random}`;
  } else if (base === "linkURL") {
    data = buyInfos.link;
  }

  return data;
}

export async function getAdDataForToken(
  chainId,
  adOfferId,
  tokenId,
  adParameterId,
  defaultAdParameterKey
) {
  const adParameterKey = adParameterId ? adParameterId : defaultAdParameterKey;

  const result = await getValidatedAds(chainId, adOfferId, [tokenId]);

  if (!result || !result[tokenId]) {
    return null;
  }

  let foundAdParameterKey = Object.keys(result[tokenId]).find((key) => key === adParameterKey);

  if (!foundAdParameterKey) {
    foundAdParameterKey = Object.keys(result[tokenId]).find((key) => key.includes(adParameterKey));
  }

  if (!foundAdParameterKey) {
    return null;
  }

  return result[tokenId][foundAdParameterKey].data;
}
