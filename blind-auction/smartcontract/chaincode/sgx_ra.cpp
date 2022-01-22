#include "crypto.h"
#include <string>
#include "base64.h"
#include "cc_data.h"
#include "error.h"
#include "logging.h"

ra_info* g_ra_info = NULL;

bool ra_info::create() {
    return mrenclave();
}

bool ra_info::mrenclave()
{
    try
    {
        enclave_priv_enc.Generate();                         
        enclave_pub_enc = enclave_priv_enc.GetPublicKey();  
        enclave_priv_dec.Generate();                         
        enclave_pub_dec = enclave_priv_dec.GetPublicKey();   
        chaincode_priv_dec.Generate();                      
        chaincode_pub_dec = chaincode_priv_dec.GetPublicKey();  
        state_key = pdo::crypto::skenc::GenerateKey();

        std::string key;
        key = enclave_pub_enc.Serialize();
        LOG_DEBUG("mrenclave verification key: %s", key.c_str());
        key = get_enclave_id();
        LOG_DEBUG("enclave id: %s", key.c_str());
    }
    catch (...)
    {
        LOG_ERROR("Could not create hash key");
        return false;
    }

    return true;
}

