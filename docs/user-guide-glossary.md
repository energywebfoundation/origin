# Glossary of Terms

## Ask

With **asks**, sellers offer to sell a specific set of [Energy Attribute Certificates (EACs)](#energy-attribute-certificate) with a specific volume for a specific price. Users can define the volume and price when creating the ask. Asks are tied directly to the EACs that the seller owns and that are in the seller’s Exchange Inbox. Every EAC in the system is represented by the “asset” data structure that holds the EAC information, such as device ID and generation time. An ask is tied to one specific asset which means that it can only contain certificates from one device and a specific generation time frame. Users can only create asks for asset volumes that are currently in the active part of their Exchange Inbox. The one-to-one connection between ask and asset ensures that sellers can only offer EACs that they actually own and have locked on the Exchange.  

By creating an ask, the specified EACs are offered for sale and the order becomes visible on the Exchange(./user-guide-exchange.md). The corresponding asset volumes are moved to the locked part of the Exchange Inbox. Locking the asset volume ensures that the EACs cannot be withdrawn from the exchange or offered for sale in a second ask. As a result, all buyers on the Exchange can be sure on a technical level that asks are backed by the correct amount of EACs. 

The ask that appears on the Exchange only includes price, volume, and underlying EAC information. It does not disclose any information about the user that created the bid. All orders that are created on the Exchange are anonymous. This is possible because the Exchange operator keeps all the ownership information in the back-end and order matching is done through the operator’s system. 

Asks that are not bought or matched can be canceled. Canceling an ask moves the offered asset value back to the active part of the Exchange Inbox. The underlying EACs can now be withdrawn again or be used to create another bid. Canceled asks can also be reactivated but only if the matching asset volume is available in the user’s Exchange Inbox. **Once made, asks cannot be updated**. To change parts of the ask like the price, the ask has to be canceled and a new ask has to be created.  

### Requirements:
- Every ask must be connected to exactly one renewable energy device
- The ask volume cannot be larger than the asset volume in the active part of the Exchange Inbox
- Once created, the ask has to appear on the Exchange without disclosing any user information
- The asset volume corresponding to the ask has to be moved to the locked part of the Exchange Inbox
- Only asks that have not been matched or bought can be canceled
- An ask can only be reactivated if the user has a matching amount of asset volume in the active part of the user Exchange Inbox

## Bid  

**Bids** are the buy offers that are posted by buyers to express their desire to buy [Energy Attribute Certificates (EACs)](#energy-attribute-certificate) on the Exchange. Unlike [asks](#ask), bids are not tied to specific EACs. Bids are entirely defined by the buyer’s needs, which vary in terms of their respective proof of impact needs. Bids include a maximum price, a volume, and a requirement specification that we call “product”. The maximum price is the highest price that a buyer is willing to pay per EAC. The volume defines the amount of EACs (i.e., the volume of MWh) that a buyer wants to buy.     

The buyer can define the characteristics that the underlying EAC of an ask has to fulfill in order to be matched. In our reference implementation, the product allows the buyer to define the device type, such as solar or wind, device vintage (i.e., the installation date), the location or grid region, and the MWh generation time frame. But it would be possible to expand this to many other characteristics to meet buyers’ needs. **All of these product specifications are entirely optional**, and so the buyer can simply choose to specify “any” to express that a given characteristic is not important to increase the number of possible product matches.   

As the bid is not tied to  an EAC, any registered user can always create a bid without any requirements from the system. But users should be aware that **creating a bid means signaling a commercially binding intent to actually buy EACs if they are matched with an ask.** To only be __notified__ when a matching ask is found, users can choose to create a notification instead of a bid. The notification includes all the same criteria as the bid with one exception: The user does not have to define an EAC volume. This allows the user to create notifications solely based on the product specification and price without having to commit to a specific volume. The idea behind this is that buyers can already monitor the market without having to know exact electricity consumption data—increasing market transparency.   

Like asks, bids appear anonymously on the Exchange once created. Only the Exchange operator knows which bid was created by which user. If the bid is matched, it is instantly removed from the Exchange. If not, it is visible on the Exchange with the expectation that a matching ask will be created in the future. Buyers can choose to cancel bids that have not been matched to remove them from the Exchange. Users can also choose to cancel notifications. Bids cannot be updated. To change parts of the bid like the price, the ask has to be canceled and a new bid has to be created.    

### Requirements:    
- Only registered users can create a bid
- Buyers have to specify maximum price and volume to create a bid
- Buyers should be able to define device type, device vintage, location or grid region, and time frame, if not selected the system default should be “any”
- Buyers have to specify a maximum price to create a notification
- When created, the bid with the right specifications should appear on the Exchange
- Only bids that have not been matched can be removed
- When removed, the bid should disappear from the Exchange

## Certificate Bundle  
Bundles are products that are compiled from a number of different EACs that are offered to buyers as one entity. 
 
One of the main characteristics of [Energy Attribute Certificates (EACs)](#energy-attribute-certificate) is that one certificate originates from exactly one specific device and one time-frame (see [Certificate structure](https://energyweb.atlassian.net/wiki/spaces/OD/pages/883916918/Certificate+structure)). In order to offer certificates from multiple devices and/or multiple time-frames while still adhering to this principle, sellers have to create certificate bundles. The Origin SDK includes the bundles-feature that lets sellers choose a number of different EACs and offer them as a bundled product. 

The main difference between buying regular EACs and buying EACs in bundles is that bundles define available EAC packages. The buyer can only buy EACs in the defined ratios of the bundle. If the bundle defines 20% Solar Farm, 30% Hydro Plant and 50% Wind Farm, the buyer can only buy multiples of 2 solar + 3 hydro + 5 wind. The price is defined per MWh. With an example price of $1per MWh the bundle offerings would look as follows:  

- 2 solar + 3 hydro + 5 wind: $10
- 4 solar + 6 hydro + 10 wind: $20
- 6 solar + 9 hydro + 15 wind: $30

etc. 

This way, the ratio stays intact and the EACs are sold in the bundle that was defined by the seller. 

There are a number of reasons why sellers might choose to bundle their EACs. The goal is mainly to increase the price per certificate that can be achieved considering the overall inventory of the seller. One strategy is to couple high-value EACs like solar with lower value EACs like big hydro. By offering both technologies as a bundle, it is hoped that on average a higher price per certificate can be achieved. Meaning that the high value solar increases the hydro certificate price in such a way that a higher return can be achieved compared to selling both EACs individually.  

In the most extreme case, it is hoped to at least receive a very small price per certificate for EACs that would otherwise be hard or impossible to sell at all. Because of the nature of EAC markets, the probability to sell an EAC for a good price decreases with time. Sustainability reports are mostly done for the previous year and organizations like RE100 forbid companies to use EACs for reporting that are older than one year. In order to sell all of the EACs that they have in the inventory, sellers can bundle EACs that have not been sold or that they already expect to be hard to sell and, this way, make them more attractive for buyers before they lose all of their value.  

Sellers can also use bundles for targeted marketing of their EACs. Bundles allow sellers to sell a story that can result in a price premium. They could, for example, bundle all EACs from one region and offer this to buyers from that region. Or they could bundle EACs from one technology but multiple generation devices, for example, multiple different solar farms and market this to buyers that are especially interested in this technology. The goal here is also to increase the price per certificate by making the packaged offering more attractive.  

## Energy Attribute Certificate  

Energy Attribute Certificates (EACs) describe global instruments which certify that a specific unit (historically 1 MWh, but sometimes 1 KWh) of electricity was produced from a renewable source.  

Globally there are various EAC systems to claim the use of renewable or low-carbon energy. Some well-known standards include Guarantees of Origin (EU), I-RECs (global), and RECs (US/Canada).  

- Redeemed EAC: an EAC that has been bough by someone can't be resold to anyone else
- Claimed or Cancelled EAC: other nomenclature for 'Redeemed EACs'
- Bundled Certificates: contracts that sell consumable energy + EACs together
- Unbundled (products): contracts that sell only energy OR EACs, not both together  

## Demand

Buyers that have periodically recurring EACs demands can define such a **demand** in the system. By creating a demand, buyers tell the system to automatically create a [bid](#bid) with the __same criteria__ once every defined time period. If the user, for example, defines a monthly recurring demand with a specific volume, price and product, the system will automatically create a bid with the defined specifications at the beginning of every month. Every bid that is automatically created holds information about the demand it originates from.   

Users must define the duration of the demand, meaning how long a demand should be in place. Users must define a start and endpoint to choose a duration. A monthly demand can (e.g. have a duration of a year), which would mean that a bid is created every month for a year. In order to continue the automatic creation of bids after the duration is over, a new demand has to be created.  

There is one thing that slightly complicates automatic bid creation and, that is the required generation time frame. It can be expected that the time of bid creation will influence the desired generation time frame. But if we would require users that care about generation time to manually select the generation time frame for every bid created in the future, it would eliminate much of the advantages of automatic bid creation. As a result, we offer to peg the required generation time to the chosen demand time frame. Part of the rationale for this is that it aligns with currently limited, but growing interest in 24/7 renewables procurement. For a monthly demand, this would mean that the product of the bid created includes the current month as the generation time frame in the product: A bid created in June would include June as the required generation time. 
__Demands do not have to be canceled because they have a limited duration__. After the duration ends there are no further bids created. In order to signal that a demand is no longer active its status can be changed to archived. Demands can be paused in case a bid should not be created in some time frame. Users can also choose to resume paused demands if automatic demand creation should be continued after a pause.   

### Requirements:  
- Only registered users can create a demand
- The system should automatically create a bid once every defined demand time frame with the right specifications
- The system should periodically create bids from the start until the end of the demand duration













