import { marketDemo } from './market'
import { deployEmptyContracts } from './deployEmpty'
import * as fs from 'fs'

async function main() {
    const contractConfig = await deployEmptyContracts()
    console.log(contractConfig)

    const demoFile = fs.readFileSync("./config/demo-config-2.json", 'utf8').toString()
    await marketDemo(demoFile)
}

main()
