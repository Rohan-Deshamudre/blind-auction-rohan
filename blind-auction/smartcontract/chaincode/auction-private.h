#include <string>
#include "shim.h"

std::string create_bid(std::string bidder, int price, std::string organisation, std::string auctionName, shim_ctx_ptr_t ctx);
std::string submit_bid(std::string organisation, std::string bidder, std::string auctionName, std::string bidId);
std::string show_bid(std::string organisation, std::string bidder, std::string auctionName, std::string bidId);
