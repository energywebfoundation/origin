import { marketDemo } from './market'
import { deployEmptyContracts } from './deployEmpty'
import * as fs from 'fs'

async function main() {
    const contractConfig = await deployEmptyContracts()

    //you could either use the default config file "demo-config.json"
    await marketDemo()

    //or you could also pass a customized demo file to the demo function as depicted below
    //const demoFile = fs.readFileSync("./config/demo-config-2.json", 'utf8').toString()
    //await marketDemo(demoFile)
}

main()
