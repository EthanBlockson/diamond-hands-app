# Fees

Manually set current fee in fees.js when its changed to drop unnecessary RPC calls.

Fees showed as nearly equal, because calculated based on 1 token price, to not refretch it every time on input because of real price difference because of liquidity.

But when user actually calls deposit, we calculate final fees, calling getTokenPriceV2() to provide enough ether to payable function as fee.

# Refcodes

Calling new deposit, refcode string is required. To prevent default service refcode squatting, use some random string generation every time.

# Contract calls

I use .toFixed(18) to stringify decimal numbers, instead of .toString(), because .toString() is not enough to cover up 1e-10 etc JS numbers with 18 max possible EVM decimals.

# Security

Taxable tokens (on each transfer) will broke the actual deposit token amount entry. But even if theres tax on plain transfer, e.g. 5%, deposited 100 tokens will result in 95 on actual contract balance. After withdraw, user will get 100 tokens but actual freezer balance will be 90.25. Users, its on them. If they wish to withdraw deposit while contract dont have enough tokens, they can transfer some tokens to freezer and perform the withdraw. If somebody use this breach infinitely, he'll just end up with the same amount of tokens, just made other holders lose the clear opportunity to withdraw.

# Scaling

At some chains different protocols are in popular, or different protocol versions (like V3 > V2). So at global scale, Diamond Hands must be capable to capture a token price from any DEX. This can be implemented in the next version of Diamond Protocol itself. Adding the new parameter to holding id struct: 'exchange'. Every exchange is unique contract address deployed by us, where getTokenPrice() function can be externally called. So at deposit user can pick the protocol with largest liquidity.

# Optimism network support

It have Velodrome Finance, fork of V2. But its additionaly screwed. To getPool() you have to input the additional parameter 'stable' (bool), created for stablecoin/stablecoin pairs (so it will be permanently false in our case). But router have only getAmountsOut() not getAmountOut() view function, so complexity is too high for this moment.