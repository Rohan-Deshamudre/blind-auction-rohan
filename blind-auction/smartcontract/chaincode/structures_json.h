#pragma once

#include <stdbool.h>
#include <stdint.h>
#include <string>

typedef struct blind_auction {
    std::string type;
    std::string itemSold;
    std::string seller;
    int price;
    std::string orgs[];
    std::map<std::string, std::string> hidden_bid;
    std::map<std::string, std::string> full_bid;    
    std::string winningBidder;
    std::string state;


} blind_auction_t;

typedef struct hidden_bid {
    std::string hash;
    std::string organisation;
} hidden_bid_t;

typedef struct full_bid {
    std::string type;
    int price;
    std::string organisation;
    std::string bidder;
} full_bid_t;

int unmarshal_auction(blind_auction_t* auction, const char* bytes, uint32_t len);
int unmarshal_bid(full_bid_t* bids, const char* bytes, uint32_t len);
std::string marshal_auction(blind_auction_t* auction);
std::string marshal_bid(full_bid_t* bid);