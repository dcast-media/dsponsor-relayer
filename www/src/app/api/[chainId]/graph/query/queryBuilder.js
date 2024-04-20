function createQueryPart(key, value) {
    if (key === 'block') {
        return `${key}: { number: ${value} }`;
    } else if (key === 'orderDirection' || key === 'orderBy') {
        return `${key}: "${value}"`;
    } else {
        return `${key}: ${value}`;
    }
}

function queryBuilder(queryParams) {
    const queryKeys = ['first', 'skip', 'orderDirection', 'block', 'where', 'orderBy']
    let queryParts = queryKeys
        .filter(key => queryParams[key])
        .map(key => createQueryPart(key, queryParams[key]));

    if (queryParts.length === 0) {
        queryParts.push('first: 10');
    }

    const query = `
    query {
      adOffers(
        ${queryParts.join(',\n')}
      ) {
        id
        disable
        metadataURL
        name
        initialCreator
        validators
        admins
        creationTimestamp
        adParameters {
          id
        }
        nftContract {
          id
          maxSupply
          prices {
            currency
            amount
            enabled
          }
          tokens {
            tokenId
            setInAllowList
            mint {
              to
              blockTimestamp
              tokenData
            }
            currentProposals {
              token {
                tokenId
              }
              adParameter {
                id
              }
              acceptedProposal {
                id
                data
              }
              pendingProposal {
                id
                data
              }
              rejectedProposal {
                id
                data
                rejectReason
              }
            }
            allProposals {
              token {
                tokenId
              }
              adParameter {
                id
              }
              data
              status
              rejectReason
              creationTimestamp
              lastUpdateTimestamp
            }
          }
        }
      }
    }
  `;

    return query;
}

export default queryBuilder;