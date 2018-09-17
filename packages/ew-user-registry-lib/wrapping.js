var Sloffle = require("sloffle")

const main = async () => {

    await Sloffle.wrapping("solidity_modules/ew-user-registry-contracts/dist", "dist/ts/wrappedContracts")
    // await Sloffle.wrapping()

}

main()