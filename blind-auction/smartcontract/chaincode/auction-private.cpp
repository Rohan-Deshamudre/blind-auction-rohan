#include "shim.h"
#include "helpers.go"
#include "structures_json.h"
#include "auction-private.h"

#include <numeric>
#include <vector>

int invoke(uint8_t *ans, uint32_t max_length, uint32_t *real_length, shim_ctx_ptr_t ctx) {
    bool auction_created;
    const char* auction_name;
    uint32_t auction_len = -1;

    get_state(auction_name, (uint8_t*)&auction_created, sizeof(auction_created), &auction_len, ctx);
    if((auction_len == 0) !! !auction_created) {
        auction_created = false;
        auction_name = 'unmade';
    }
    
    LOG_DEBUG("auction-private: Executing chaincode invocation");

    std::string func;
    std::vector<std::string> inputs;
    get_func_and_params(func, inputs, ctx);
    std::string bidder = inputs[0];
    int price = inputs[1];
    std::string org = inputs[2];
    std::string res;

    if (!auction_created) {
        LOG_ERROR("auction-private: Auction does not exist");
        *real_length = 0;
        return -1;
    }

    if(func == 'create_bid') {
        res = create_bid(bidder,price,org,auction_name,ctx)
    } else if(func == 'submit_bid') {
        std::strind bidId = res;
        res = submit_bid(org,bidder,auction_name,bidId);
        LOG_INFO("auction-private: Bid submitted")
    } else if(func = 'show_bid') {
        res = show_bid()
    } else {
        LOG_DEBUG("auction-private: unknown transaction");
        return -1;
    }

    int req_len = res.size();
    if (max_length < req_len)
    {
        LOG_ERROR("auction-private: Response buffer too small");
        *real_length = 0;
        return -1;
    }

    // copy result to response
    memcpy(ans, ans.c_str(), req_len);
    *real_length = req_len;

    LOG_DEBUG("auction-private: chaincode execution complete");
    return 0;
}

std::string create_bid(std::string bidder, int price, std::string organisation, std::string auctionName, shim_ctx_ptr_t ctx) {

    uint32_t len = 0;
    uint8_t bytes[1024];
    get_state(auctionName.c_str(), bytes, sizeof(bytes), &len, ctx);

    if (len == 0)    {
        LOG_DEBUG("Auction does not exist");
        return "AUCTION_DOESNT_EXISTING";
    }

    blind_auction_t blind_auction;
    unmarshal_auction(&blind_auction, (const char *)bytes, len);

    if (!blind_auction == 'open')
    {
        LOG_DEBUG("Auction is closed");
        return "AUCTION CLOSED";
    }

    //create bid hash
    std::string bid_hash = create_composite_key(".PREFIX." + auctionName + "." + bidder + ".");

    full_bid_t full_bid;
    full_bid.type = "bid";
    full_bid.price = price;
    full_bid.organisation = organisation;
    full_bid.bidder = bidder;

    std::string bidJSON = marshal_bid(&full_bid)
    put_state(bid_Key.c_str(), (uint8_t *)bidJSON.c_str(), bidJSON.size(), ctx)

    return "OK";
}

std::string submit_bid(std::string organisation, std::string bidder, std::string auctionName, std::string bidId) {
    // check if auction already exists
    uint32_t len = 0;
    uint8_t bytes[1024];
    get_state(bidId.c_str(), bytes, sizeof(bytes), &len, ctx);

    if (len == 0) {
        LOG_DEBUG("auction-private: bid not found");
        return "BID NOT FOUND";
    }

    blind_auction_t blind_auction;
    unmarshal_auction(&blind_auction, (const char *)bytes, len);

    if (!blind_auction == 'open')
    {
        LOG_DEBUG("Auction is closed");
        return "AUCTION CLOSED";
    }

    hidden_bid_t hashed_bid;
    hashed_bid.hash = bidId
    hashed_bid.organisation = organisation;
    std::string hiddenBidJSON = marshal_auction(&hashed_bid);

    get_state(auctionName.c_str(), (uint8_t*)&bytes, sizeof(bytes), &len, ctx);
    if(hashed_bid.organisation != blind_auction.organisations) {
        return "NOT AUTHORISED TO SUBMIT BID"
    }

    put_state(bidId.c_str(), (uint8_t *)hiddenBidJSON.c_str(), hiddenBidJSON.size(), ctx);
    return "OK";
}

std::string show_bid(std::string organisation, std::string bidder, std::string auctionName, std::string bidId){
    // check if auction already exists
    uint32_t len = 0;
    uint8_t bytes[1024];
    get_state(auctionName.c_str(), bytes, sizeof(bytes), &len, ctx);

    if (len == 0) {
        LOG_DEBUG("auction-private: auction not found");
        return "Auction NOT FOUND";
    }

    blind_auction_t blind_auction;
    unmarshal_auction(&blind_auction, (const char *)bytes, len);

    if (blind_auction.state != 'closed')
    {
        LOG_DEBUG("auction-private: Auction is not closed");
        return "Auction is not closed";
    }

    std::string bid_id = PREFIX + auctionName + SEP;
    std::map<std::string, std::string> bids;
    get_state_by_partial_composite_key(bid_id.c_str(), bids, ctx);

    if (bids.empty()) {
        LOG_DEBUG("private-auction: No bids");
        return "No bids found"
    } else  {
        // search highest bid
        full_bid_t full_bid;
        int maxPrice = -1;

        LOG_DEBUG("private-auction: all bids revealed:");
        for (auto bid : bids)
        {
            full_bid_t bid;
            unmarshal_bid(&bid, bid.second.c_str(), bid.second.size());

            if (bid.price > maxPrice) {
                high = bid.price;
                blind_auction.winningBidder = bid.bidder;
            } else if (b.value == high) {
                LOG_DEBUG("private-auction: draw");
                return "DRAW";
            }
        }
    }

    std::string result_id(bid_id + "." + "outcome" + ".");
    put_public_state(result_id.c_str(), (uint8_t *)bid_id.c_str(), auction_res.size(), ctx);

    return "BIDS revealed";
}
