import { getValidatedAds } from "@/queries/ads";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenIds = searchParams.get("tokenIds")?.length
    ? searchParams.get("tokenIds").split(",")
    : undefined;
  const tokenDatas = searchParams.get("tokenData")?.length
    ? searchParams.get("tokenData").split(",")
    : undefined;
  const adParameterIds = searchParams.get("adParameterIds")?.length
    ? searchParams.get("adParameterIds").split(",")
    : undefined;

  const result = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    tokenIds,
    tokenDatas,
    adParameterIds
  });

  if (!result) {
    return new Response("No offer found", {
      status: 401
    });
  }

  return new Response(JSON.stringify(Object.assign(result), null, 4), {
    headers: {
      "content-type": "application/json",
      "CDN-Cache-Control": "public, s-maxage=600, stale-while-revalidate=60"
    }
  });
}

export const revalidate = 900; // 15 minutes
